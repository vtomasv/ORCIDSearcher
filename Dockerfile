# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Define build arguments for Vite environment variables
ARG VITE_APP_TITLE="ORCID Manager"
ARG VITE_APP_LOGO="/logo.svg"
ARG VITE_ANALYTICS_ENDPOINT=""
ARG VITE_ANALYTICS_WEBSITE_ID=""
ARG VITE_APP_ID=""
ARG VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
ARG VITE_FRONTEND_FORGE_API_KEY=""
ARG VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# Set environment variables from build arguments
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_LOGO=$VITE_APP_LOGO
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL
ENV VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY
ENV VITE_FRONTEND_FORGE_API_URL=$VITE_FRONTEND_FORGE_API_URL

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory (required by pnpm)
COPY patches ./patches

# Install pnpm and dependencies
RUN npm install -g pnpm@10.4.1
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches directory (required by pnpm)
COPY patches ./patches

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Copy necessary files
COPY server ./server
COPY shared ./shared
COPY scripts ./scripts

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
# Run migrations first, then start the server
CMD ["sh", "-c", "node scripts/migrate.mjs && node dist/index.js"]
