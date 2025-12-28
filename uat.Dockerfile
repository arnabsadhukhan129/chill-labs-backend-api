# Use Node.js version 20 as a parent image
FROM node:21.6.2

# Install bash
# RUN apk add --no-cache bash

# Set the working directory inside the container
WORKDIR /user-managment-service

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY .env.uat ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Copy the wait-for-it.sh script into the container
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Build the TypeScript code
RUN npm run build:uat

# Expose the port the app runs on
EXPOSE 8081

# Command to run the app
CMD ["npm", "run", "start:uat"]
# CMD ["/usr/src/app/wait-for-it.sh", "rabbitmq_service", "--", "/usr/src/app/wait-for-it.sh", "redis_db_service", "--", "npm", "run", "start:prod"]



