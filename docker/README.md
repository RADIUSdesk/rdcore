# radiusdesk

Dockerised new radiusdesk from https://github.com/RADIUSdesk based on

- php8.3-fpm
- FreeRadius 3.x
- NGINX for the web server.
- MariaDB 11.8 to store the data.
- CakePHP 4.x to create an API.
- ExtJs 7.0 to present a modern GUI that interacts with the API.

## Using a pre-compiled image

A pre-compiled image is available [here](https://github.com/keeganwhite/radiusdesk-docker/tree/main) but note this may not be the latest version. Check the publishing logs [here](https://github.com/keeganwhite/radiusdesk-docker/blob/main/publishing.md) to verify the age of the docker image and what commit it links to.

## Building the Image

Mount the rdcore top directory to the rdcore/docker/rdcore directory
```
cd rdcore/docker
sudo mkdir rdcore
sudo mount --bind ../../rdcore ./rdcore
```

To build the latest code yourself simply run
```
sudo ./local_build.sh
```
