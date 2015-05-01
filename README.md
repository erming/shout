# Shout [![](https://badge.fury.io/js/shout.png)](https://www.npmjs.org/package/shout)

### [Try the Demo](http://demo.shout-irc.com/)

__What is it?__  
Shout is a web IRC client that you host on your own server.

__What features does it have?__  
- Multiple user support
- Stays connected even when you close the browser
- Connect from multiple devices at once
- Responsive layout — works well on your smartphone
- _.. and more!_

## Install

```
sudo npm install -g shout
```

## Install with Docker
__Creating a public shout server__
```
git clone https://github.com/erming/shout.git
docker build --tag=shout-img .;
docker run --name=shout --publish=9000:9000 --detach --tty -v PATH/TO/SHOUT/FOLDER/data:/root/.shout shout-img;
```

__Creating a private shout server__
```
git clone https://github.com/erming/shout.git
sed -i 's/public: true,/public: false,/' shout/defaults/config.js
docker build --tag=shout-img .;
docker run --name=shout --publish=9000:9000 --detach --tty -v PATH/TO/SHOUT/FOLDER/data:/root/.shout shout-img;
```
To manage users, configuration file, just run another docker with the right volume attached to it!
```
docker run -t -i -v PATH/TO/SHOUT/FOLDER/data:/root/.shout node:latest  /bin/bash
sudo npm -g install shout
```
From there, you can use all shout's commands, such as:
```
shout add john
```

## Usage

When the install is complete, go ahead and run this in your terminal:

```
shout --help
```

For more information, read the [documentation](http://shout-irc.com/docs/).

## Development setup

To run the app from source, just clone the code and run this in your terminal:

```
npm install
grunt
./index.js --port 8080
```

And if you don't have [grunt](http://gruntjs.com/getting-started) installed already, just run `npm install -g grunt-cli`.

## License

Available under [the MIT license](http://mths.be/mit).
