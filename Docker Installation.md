## Installation with Docker

1. Clone this repository:

  ```bash
  $ git clone git@github.com:erming/shout.git
  $ cd shout
  ```

Please follow the 
[installation instructions](https://docs.docker.com/installation/#installation) 
on how to install Docker (or `boot2docker`) on your system. Then follow the
steps bellow:

1.  **Build** a Docker image according to our [`Dockerfile`](Dockerfile) 
  and name it `shout-img`:

  ```bash
  $ docker build --tag=shout-img .
  ```

2. **Verify** the image has been created:

  ```bash
  $ docker images
  REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
  shout-img           latest              95da6797223b        9 minutes ago       833.1 M
  ```

3. **Create** a new container named `shout ` from the `shout-img` 
  image and run the app in it:

  ``` bash
  $ docker run --name=shout --publish=9000:9000  --detach --tty shout-img
  ```

4. **Verify** the container is running:

  ```bash
  $ docker ps
  CONTAINER ID        IMAGE                   COMMAND                CREATED             STATUS              PORTS                    NAMES
  bf0a83b7cc07        shout-img:latest    /bin/sh -c shout    8 minutes ago       Up 8 minutes        0.0.0.0:9000->9000/tcp   shout
  
  ```
  
5. Now shout should be running in the Docker container on port `9000`. 
  The full URL depends on the method you used to install Docker:

  * If you have installed **Docker directly** on your system, the full 
    URL will simply be: [`http://localhost:9000/`](http://localhost:9000/)
  * If you have used **`boot2docker`,** then run `$ boot2docker ip` 
    to find out the IP address under which the app is available, 
    and the full URL will be `http://<boot2docker IP>:9000/`


To stop the app (Docker container), run:

```bash
$ docker stop shout
```

To start it again, run:
```bash
$ docker start shout
```

After you have made any changes to the codebase or configuration and 
want them to be applied to the container, or simply wish to start 
from scratch again, run the following commands to delete the 
existing container (*this will also delete all user data in it*):

```bash
$ docker stop shout
$ docker rm shout
```

And then start again from step 1. above (it should go much faster this time).