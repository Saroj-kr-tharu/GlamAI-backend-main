# Base image
FROM node:20-alpine

WORKDIR /backend

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p src/uploads

# Default port used by the server
EXPOSE 5000

CMD ["node", "src/server.js"]