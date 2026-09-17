# ==============================================================================
# Multi-stage Dockerfile for Finstaq Financial SaaS Backend
# Node.js 20 Alpine Runtime
# ==============================================================================

# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./

COPY . .

RUN npm ci


RUN npm run build


# ------------------------------------------------------------------------------
# STAGE 2: Production Minimal Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk update && apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Create non-root user for security compliance (CIS benchmark)
RUN addgroup --system --gid 1001 finstaqgroup && \
    adduser --system --uid 1001 finstaquser

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack

USER finstaquser

EXPOSE 3000

CMD ["node", "dist/server.js"]
