# Multi-stage build using Next.js standalone output
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies from the lockfile
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build
COPY . .
RUN NEXT_OUTPUT=standalone npm run build

# Production stage: only the standalone server and static assets
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Run as the image's unprivileged user
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
