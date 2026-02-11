# =============================================================================
# RM Partial Picking Remover - Frontend Dockerfile
# Next.js 16 + React 19 + TypeScript
# Port: 6065
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY my-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY my-app/ ./

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:6066
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js app (standalone output)
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy standalone build from builder
COPY --from=builder --chown=nextjs:nodejs /app/dist/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/static ./dist/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 6065

# Set environment variables
ENV NODE_ENV=production
ENV PORT=6065
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:6065/ || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
