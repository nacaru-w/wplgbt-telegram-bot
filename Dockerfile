# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Create a directory for persistent data, owned by the non-root user
RUN mkdir -p /usr/src/app/data && chown 100000:100000 /usr/src/app/data

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies (include dev so we can compile TS)
RUN npm install

# Copy the rest of the project (including config.json)
COPY . .

# Compile TypeScript to dist/
RUN npm run compile

# Remove dev deps for smaller final image
RUN npm prune --production

# Run as a non-root user
USER 100000:100000

# Start the bot
CMD ["npm", "start"]
