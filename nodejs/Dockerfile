# Base image
FROM node:18

# Work directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 8080

# Start the Node application
CMD ["npx", "ts-node", "./src/server.ts"]