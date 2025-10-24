# Build stage
FROM node:24-slim AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including dev dependencies for build
RUN pnpm install --frozen-lockfile

# Copy source code and public files
COPY src/ ./src/
COPY static/ ./static/
COPY esbuild.config.js ./

# Build the TypeScript application
RUN pnpm build

# Production stage
FROM node:24-slim AS production

# Set working directory
WORKDIR /app

## Install pnpm globally
#RUN npm install -g pnpm
#
## Copy package files
#COPY package.json pnpm-lock.yaml ./
#
## Install only production dependencies
#RUN pnpm install --prod --frozen-lockfile

# Copy built files and static assets
COPY --from=builder /app/dist ./dist
COPY static/ ./static/

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --gid 1001 nodejs

# Change ownership of files to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port your app runs on (adjust if different)
EXPOSE 3000

# Set the command to run your application
CMD ["node", "dist/app.js"]