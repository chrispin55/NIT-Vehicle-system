# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install the application dependencies
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 8080

# Define the entry point for the container
CMD ["npm", "start"]
