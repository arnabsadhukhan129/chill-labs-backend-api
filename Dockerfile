# Use Node.js version 20 as a parent image
FROM node:22.15.0


# Set the working directory inside the container
WORKDIR /api-service

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY .env.production ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 8081

# Command to run the app
CMD ["npm", "run", "start:prod"]
# CMD ["/usr/src/app/wait-for-it.sh", "rabbitmq_service", "--", "/usr/src/app/wait-for-it.sh", "redis_db_service", "--", "npm", "run", "start:prod"]



