# # Use the official Node.js 14 image.
# # https://hub.docker.com/_/node
# FROM node:14

# # Create and change to the app directory.
# WORKDIR /usr/src/app

# # Copy application dependency manifests to the container image.
# # A wildcard is used to ensure both package.json AND package-lock.json are copied.
# # Copying this separately prevents re-running npm install on every code change.
# COPY package*.json ./

# # Install production dependencies.
# RUN npm install --only=production

# # Copy local code to the container image.
# COPY . .

# # Bind the express server to port 3000.
# EXPOSE 3000

# # Run the web service on container startup.
# CMD [ "node", "app.js" ]

# Use the official Node.js 16 as a parent image
FROM node:16

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Make port 4000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]
