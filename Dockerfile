# get latest node.js image
FROM node:latest

# set user root
USER root

# install shout
RUN npm install -g shout

# copy server config
# NOTE: you can skip this step if you want shout to be public, and require no user login
RUN rm /usr/local/lib/node_modules/shout/config.json
COPY ./config.json /usr/local/lib/node_modules/shout/config.json

# create user
RUN useradd -m -d /home/shout -p shout shout

# set HOME env
ENV HOME /home/shout

# set user shout
USER shout

# add users to shout's folder in home
# NOTE: you can skip this step if you want shout to be public, and require no user login
# COPY ./users/<username>/user.json /home/shout/.shout/users/<username>/user.json

# expose server port
EXPOSE 9000

# entrypoint is shout, to start the shout server...
ENTRYPOINT shout