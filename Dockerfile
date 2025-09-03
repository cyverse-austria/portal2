# Multi-stage build for Portal2 Next.js application
FROM node:20-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies needed for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Suppress deprecation warnings to reduce build noise
RUN npm ci --include=dev --silent

# Copy source code
COPY . .

# Set minimal environment variables needed for build
ENV NODE_ENV=production \
    UI_BASE_URL=http://localhost:3000 \
    API_BASE_URL=http://localhost:3000/api \
    WS_BASE_URL=ws://localhost:3001

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS production

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd --gid 1001 --system nodejs \
    && useradd --uid 1001 --system --gid nodejs --create-home --shell /bin/bash nodejs

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --omit=dev --silent && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/next.config.js ./next.config.js

# Set ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production \
    PORT=3000

# Expose the port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
