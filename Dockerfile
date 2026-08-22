# Use the official Playwright image which includes Node.js and browser dependencies
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Set working directory
WORKDIR /app

# Install Xvfb for virtual display support
RUN apt-get update && apt-get install -y xvfb && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

# Make entrypoint executable
RUN chmod +x scripts/docker-entrypoint.sh

# Expose MCP standard stdio (or port if configured later)
# Standard MCP uses stdin/stdout, so no port EXPOSE is strictly required,
# but we document 9222 for potential CDP debugging
EXPOSE 9222

# Set the entrypoint
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
