# ==============================================================================
# Multi-stage Dockerfile for Finstaq Financial SaaS Backend
# Node.js 20 Alpine Runtime
# ==============================================================================

# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install OpenSSL for Prisma engine binary compatibility
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies for production
RUN npm prune --production

# ------------------------------------------------------------------------------
# STAGE 2: Production Minimal Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

RUN apk add --no-cache openssl libc6-compat dumb-init

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Create non-root user for security compliance (CIS benchmark)
RUN addgroup --system --gid 1001 finstaqgroup && \
    adduser --system --uid 1001 finstaquser

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

USER finstaquser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
