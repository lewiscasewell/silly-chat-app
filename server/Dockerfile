FROM node:20.5.1

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to leverage Docker caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --verbose

# Copy your application code with proper permissions
COPY --chown=node:node . .

# Expose the port your app runs on
EXPOSE 6969

# Specify the command to run your app
CMD ["yarn", "run", "dev"]