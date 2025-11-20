import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { 
  createUploadSession, 
  getUploadSessionsByUser,
  getUploadSession,
  updateUploadSession,
  createResearcher,
  createOrcidSearch,
  getOrcidSearchesNeedingReview,
  getAllOrcidSearchesByUser,
  updateOrcidSearch,
  getAllInstitutions,
  createInstitution,
  getResearchersByUser
} from "./db";
import { normalizeText, getInstitutionVariants, buildOrcidSearchUrl } from "./utils";
import ExcelJS from 'exceljs';
import { orcidSearchQueue, initProgress, getProgress } from './queueService';

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Upload and process Excel file
  upload: router({
    // Process uploaded Excel file
    processExcel: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64 encoded Excel file
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Parse Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (skip first row if it's header)
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Assume first row is header, second row is actual header with column names
        const headers = data[1] as string[];
        const rows = data.slice(2);
        
        // Find column indices
        const firstNameIdx = headers.findIndex(h => h && h.toLowerCase().includes('first name'));
        const lastNameIdx = headers.findIndex(h => h && h.toLowerCase().includes('last name'));
        const institutionIdx = headers.findIndex(h => h && h.toLowerCase().includes('institution'));
        const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
        const countryIdx = headers.findIndex(h => h && h.toLowerCase().includes('country'));
        
        // Filter valid rows
        const validRows = rows.filter(row => 
          row[firstNameIdx] && row[lastNameIdx]
        );
        
        // Create upload session
        const sessionId = await createUploadSession({
          userId,
          filename: input.filename,
          totalResearchers: validRows.length,
          processedCount: 0,
          foundCount: 0,
          multipleCount: 0,
          notFoundCount: 0,
          status: 'processing',
        });
        
        // Get institutions data
        const institutionsData = await getAllInstitutions();
        
        // Create researchers and initial search records
        for (const row of validRows) {
          const firstName = String(row[firstNameIdx] || '').trim();
          const lastName = String(row[lastNameIdx] || '').trim();
          const institution = institutionIdx >= 0 ? String(row[institutionIdx] || '').trim() : '';
          const email = emailIdx >= 0 ? String(row[emailIdx] || '').trim() : '';
          const country = countryIdx >= 0 ? String(row[countryIdx] || '').trim() : '';
          
          const researcherId = await createResearcher({
            userId,
            uploadSessionId: sessionId,
            firstName,
            lastName,
            firstNameNormalized: normalizeText(firstName),
            lastNameNormalized: normalizeText(lastName),
            institution,
            email,
            country,
            originalData: JSON.stringify(row),
          });
          
          // Create initial ORCID search record
          const searchUrl = buildOrcidSearchUrl(firstName, lastName, institution);
          
          await createOrcidSearch({
            researcherId,
            status: 'pending',
            resultCount: 0,
            searchUrl,
            needsReview: false,
          });
        }
        
        return {
          sessionId,
          totalResearchers: validRows.length,
        };
      }),
    
    // Get all upload sessions for current user
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return await getUploadSessionsByUser(ctx.user.id);
    }),
    
    // Get session details
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getUploadSession(input.sessionId);
      }),
  }),

  // Researchers management
  researchers: router({
    // Get all researchers for current user
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getResearchersByUser(ctx.user.id);
    }),
    
    // Get researchers with their ORCID search results
    getAllWithSearches: protectedProcedure.query(async ({ ctx }) => {
      const researchers = await getResearchersByUser(ctx.user.id);
      const allSearches = await getOrcidSearchesNeedingReview(ctx.user.id);
      
      // For each researcher, get their ORCID search
      const results = [];
      for (const researcher of researchers) {
        results.push({
          researcher,
          search: allSearches.find(s => s.search.researcherId === researcher.id)?.search,
        });
      }
      
      return results;
    }),
  }),

  // ORCID searches management
  orcid: router({
    // Get searches needing review
    getNeedingReview: protectedProcedure.query(async ({ ctx }) => {
      return await getOrcidSearchesNeedingReview(ctx.user.id);
    }),
    
    // Update search with manual decision
    updateSearch: protectedProcedure
      .input(z.object({
        searchId: z.number(),
        orcid: z.string().optional(),
        status: z.enum(['found', 'not_found', 'manual']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateOrcidSearch(input.searchId, {
          orcid: input.orcid,
          status: input.status,
          notes: input.notes,
          needsReview: false,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });
        
        return { success: true };
      }),
    
    // Export results to Excel
    exportToExcel: protectedProcedure
      .input(z.object({ sessionId: z.number().optional() }))
      .mutation(async ({ ctx }) => {
        const researchers = await getResearchersByUser(ctx.user.id);
        
        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Researchers');
        
        // Add headers
        worksheet.columns = [
          { header: 'First Name', key: 'firstName', width: 20 },
          { header: 'Last Name', key: 'lastName', width: 20 },
          { header: 'Institution', key: 'institution', width: 40 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Country', key: 'country', width: 15 },
          { header: 'ORCID', key: 'orcid', width: 20 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Search URL', key: 'searchUrl', width: 60 },
        ];
        
        // Add data
        // Get all searches for this user
        const allSearches = await getAllOrcidSearchesByUser(ctx.user.id);
        
        for (const researcher of researchers) {
          const orcidSearch = allSearches.find(s => s.search.researcherId === researcher.id)?.search;
          
          worksheet.addRow({
            firstName: researcher.firstName,
            lastName: researcher.lastName,
            institution: researcher.institution,
            email: researcher.email,
            country: researcher.country,
            orcid: orcidSearch?.orcid || '',
            status: orcidSearch?.status || 'pending',
            searchUrl: orcidSearch?.searchUrl || '',
          });
        }
        
        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Convert to base64
        const base64 = Buffer.from(buffer).toString('base64');
        
        return {
          data: base64,
          filename: `orcid-results-${new Date().toISOString().split('T')[0]}.xlsx`,
        };
      }),
  }),

  // Automatic ORCID search
  search: router({    
    // Start automatic search for all pending researchers
    startAutoSearch: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        concurrency: z.number().min(1).max(20).optional().default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Get all searches for this session that are pending
        const allSearches = await getAllOrcidSearchesByUser(userId);
        const pendingSearches = allSearches.filter(
          s => s.search.status === 'pending' && s.researcher.uploadSessionId === input.sessionId
        );
        
        if (pendingSearches.length === 0) {
          return { success: false, message: 'No pending searches found' };
        }
        
        // Initialize progress tracking
        initProgress(userId, pendingSearches.length);
        
        // Get all institutions for variants
        const institutions = await getAllInstitutions();
        
        // Add jobs to queue with rate limiting based on concurrency
        console.log(`[Queue] Adding ${pendingSearches.length} jobs to queue for user ${userId} with concurrency ${input.concurrency}`);
        
        // Add jobs in batches based on concurrency to control processing rate
        const batchSize = input.concurrency;
        for (let i = 0; i < pendingSearches.length; i += batchSize) {
          const batch = pendingSearches.slice(i, i + batchSize);
          
          for (const { search, researcher } of batch) {
            const institutionVariants = researcher.institution 
              ? getInstitutionVariants(researcher.institution, institutions)
              : [];
            
            const job = await orcidSearchQueue.add('search-orcid', {
              searchId: search.id,
              researcherId: researcher.id,
              userId,
              institutionVariants,
              concurrency: input.concurrency,
            }, {
              // Add delay between batches to control rate
              delay: i > 0 ? 1000 : 0, // 1 second delay between batches
            });
            console.log(`[Queue] Added job ${job.id} for search ${search.id}`);
          }
        }
        console.log(`[Queue] All ${pendingSearches.length} jobs added successfully with concurrency ${input.concurrency}`);
        
        return { 
          success: true, 
          message: `Iniciando búsqueda automática para ${pendingSearches.length} investigadores`,
          total: pendingSearches.length
        };
      }),
    
    // Get search progress
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const progress = getProgress(ctx.user.id);
      return progress;
    }),
  }),

  // Institutions management
  institutions: router({
    // Get all institutions
    getAll: publicProcedure.query(async () => {
      return await getAllInstitutions();
    }),
    
    // Seed institutions from JSON
    seedInstitutions: protectedProcedure
      .input(z.object({
        institutions: z.array(z.object({
          canonical: z.string(),
          country: z.string().optional(),
          countryCode: z.string().optional(),
          orcidRegistryName: z.string().optional(),
          variants: z.array(z.string()),
        })),
      }))
      .mutation(async ({ input }) => {
        for (const inst of input.institutions) {
          await createInstitution({
            canonical: inst.canonical,
            country: inst.country,
            countryCode: inst.countryCode,
            orcidRegistryName: inst.orcidRegistryName,
            variants: JSON.stringify(inst.variants),
          });
        }
        
        return { success: true, count: input.institutions.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
