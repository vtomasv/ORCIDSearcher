import { Queue, Worker, Job } from 'bullmq';
import { searchOrcid, closeBrowser } from './orcidSearchWorker';
import { updateOrcidSearch, getResearcherById } from './db';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

interface SearchJobData {
  searchId: number;
  researcherId: number;
  userId: number;
  institutionVariants?: string[];
}

interface SearchProgress {
  userId: number;
  total: number;
  processed: number;
  found: number;
  multiple: number;
  notFound: number;
  errors: number;
}

// Create queue
export const orcidSearchQueue = new Queue<SearchJobData>('orcid-search', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep failed jobs for 7 days
    },
  },
});

// Progress tracking
const progressMap = new Map<number, SearchProgress>();

export function getProgress(userId: number): SearchProgress | null {
  return progressMap.get(userId) || null;
}

export function initProgress(userId: number, total: number) {
  progressMap.set(userId, {
    userId,
    total,
    processed: 0,
    found: 0,
    multiple: 0,
    notFound: 0,
    errors: 0,
  });
}

export function updateProgress(userId: number, status: 'found' | 'multiple' | 'not_found' | 'error') {
  const progress = progressMap.get(userId);
  if (progress) {
    progress.processed++;
    switch (status) {
      case 'found':
        progress.found++;
        break;
      case 'multiple':
        progress.multiple++;
        break;
      case 'not_found':
        progress.notFound++;
        break;
      case 'error':
        progress.errors++;
        break;
    }
    progressMap.set(userId, progress);
  }
}

export function clearProgress(userId: number) {
  progressMap.delete(userId);
}

// Create worker
const worker = new Worker<SearchJobData>(
  'orcid-search',
  async (job: Job<SearchJobData>) => {
    const { searchId, researcherId, userId, institutionVariants } = job.data;
    
    console.log(`Processing search ${searchId} for researcher ${researcherId}`);
    
    try {
      // Get researcher data
      const researcher = await getResearcherById(researcherId);
      if (!researcher) {
        throw new Error(`Researcher ${researcherId} not found`);
      }
      
      // Perform search
      const result = await searchOrcid(
        researcher.firstName,
        researcher.lastName,
        researcher.institution || undefined,
        institutionVariants
      );
      
      // Update search in database
      await updateOrcidSearch(searchId, {
        status: result.status,
        orcid: result.orcid,
        searchUrl: result.searchUrl,
        errorMessage: result.errorMessage,
        searchedAt: new Date(),
      });
      
      // Update progress
      updateProgress(userId, result.status);
      
      // Emit progress update via Socket.IO (will be handled by the server)
      const progress = getProgress(userId);
      if (progress) {
        // This will be picked up by the Socket.IO server
        global.io?.to(`user-${userId}`).emit('search-progress', progress);
      }
      
      return result;
    } catch (error) {
      console.error(`Error processing search ${searchId}:`, error);
      
      // Update search as error
      await updateOrcidSearch(searchId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        searchedAt: new Date(),
      });
      
      // Update progress
      updateProgress(userId, 'error');
      
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 searches in parallel
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Cleanup on process exit
process.on('SIGTERM', async () => {
  await worker.close();
  await orcidSearchQueue.close();
  await closeBrowser();
  connection.disconnect();
});

export { worker };
