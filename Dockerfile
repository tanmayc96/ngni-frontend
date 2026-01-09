# Use the slim image for a balance of size and compatibility
FROM node:20-slim

WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json* ./

# Fix Network Issues: Increase timeout and retries (Removed deprecated cache-min)
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 600000 \
    && npm config set fetch-retry-maxtimeout 1200000

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy the rest of your source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the project
# Note: Ensure your "build" script in package.json runs "next build"
RUN npm run build

# Cloud Run requirement: Expose port 8080
ENV PORT 8080
EXPOSE 8080

# Start the app in standard mode (simplest way, no standalone required)
CMD ["npm", "start"]