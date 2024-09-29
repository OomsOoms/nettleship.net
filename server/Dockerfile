# Use the official Node.js image as the base image
FROM node:22.2.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application, this uses cross-env to set the NODE_ENV to production
CMD ["npm", "run", "prod"]