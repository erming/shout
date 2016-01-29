#
# Thanks to @Xe for the Dockerfile template
# https://github.com/Shuo-IRC/Shuo/pull/87/files
#
FROM node:4.2-onbuild

# SHOUT_USERNAME: The user we will run shout as.
ENV SHOUT_USERNAME=shout

# Use npm link so we have the shout command available in our shell
# Update apt so we can install packages
# Install vim so shout config works
# Remove apt database caches (save disk space)
# Clean up temporary files from our apt install (save disk space)
# Create a non-root user for shout to run in.
RUN npm link \
    && apt-get update \
    && apt-get install -y vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
              /tmp/* \
              /var/tmp/* \
    && useradd --create-home $SHOUT_USERNAME

# Drop root.
USER $SHOUT_USERNAME

# HOME: Needed for setup of Node.js
# SHOUT_HOME: Used by shout for a data directory.
ENV HOME=/home/$SHOUT_USERNAME \
    SHOUT_HOME=/home/$SHOUT_USERNAME/data

# Create our SHOUT_HOME directory
RUN mkdir $SHOUT_HOME

# Expose our SHOUT_HOME as a volume mount
VOLUME $SHOUT_HOME

# Expose Listening Port
EXPOSE 9000

# Don't use an entrypoint here. It makes debugging difficult.
CMD node index.js
