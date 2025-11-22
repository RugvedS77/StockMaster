#Sets the base image to use for any futher installation
FROM node:20  

#The absolute or relative path to use as working directory for the container
WORKDIR /app

#To copy the package.json to working directory
COPY package*.json ./

#To install all the dependencies form package.json
RUN npm install

#To copy all other remaining files/folder to working directory
COPY . ./

#To expose the port the app will be running on
EXPOSE 5173

#Commands to be ran , to start the app
CMD ["npm", "run", "dev", "--", "--host"]