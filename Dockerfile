# image to build from
FROM    node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY    package*.json ./
RUN     npm install

# Bundle app source
#COPY    CONTROL/*         ./CONTROL/
#COPY    SERVER/*          ./SERVER/


#COPY    lib/*             ./lib/

#

#COPY    favicon.ico       .
#COPY    index.html        .
#COPY    server_index.html .
#
#COPY    servercert.pem    .
#COPY    serverkey.pem     .

 COPY    .                 .
#COPY    I18N              .
#COPY    I18N*.zip         .
#COPY    I18N.zip          .

# PORT
EXPOSE  81
EXPOSE 444

# LAUNCH
CMD    ["node", "SERVER/server.js"]

