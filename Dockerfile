# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies (include dev so we can compile TS)
RUN npm install

# Copy the rest of the project (including config.json and idData.json)
COPY . .

# Compile TypeScript to dist/
RUN npm run compile

# Remove dev deps for smaller final image
RUN npm prune --production

# Start the bot
CMD ["npm", "start"]
