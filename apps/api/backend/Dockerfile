# ─── Build Stage ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL deps (including dev — needed for tsx)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/
COPY socketHandlers/ ./socketHandlers/
COPY auth/ ./auth/
COPY api/ ./api/

# Compile TypeScript → dist/
RUN npx tsc

# ─── Production Stage ────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Only copy production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create projects directory (mounted as volume in production)
RUN mkdir -p projects

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use compiled JS — fast, no tsx overhead
CMD ["node", "dist/index.js"]
