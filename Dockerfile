# Based on the work of Furier, thank's to him! https://gist.github.com/furier/09f1bbe309e2c19236a1
 
FROM node:latest
 
# set user root
# using root user to bind volume without permission's issues
USER root
 
# install shout
RUN npm install -g shout
 
# expose server port
EXPOSE 9000
 
# entrypoint is shout, to start the shout server...
ENTRYPOINT shout
