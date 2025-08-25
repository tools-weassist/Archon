# Production build for Railway
FROM node:20-alpine as builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ git curl

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies using npm install (not ci)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install only production dependencies including express
RUN npm install express --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy server file
COPY server.js .

# Expose port (Railway will override this with PORT env var)
EXPOSE 3737

# Start the server
CMD ["node", "server.js"]
