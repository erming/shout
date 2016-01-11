[![npm version](https://img.shields.io/npm/v/shout.svg)](https://www.npmjs.org/package/shout)
[![Build Status](https://travis-ci.org/erming/shout.svg?branch=master)](https://travis-ci.org/erming/shout)
[![Dependency Status](https://david-dm.org/erming/shout.svg)](https://david-dm.org/erming/shout)

# Shout

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

## Usage

When the install is complete, go ahead and run this in your terminal:

```
shout --help
```

For more information, read the [documentation](http://shout-irc.com/docs/).

## HTTPS support with letsencrypt (recommended)

To enable https in the easiest way, use letsencrypt.

```
git clone https://github.com/letsencrypt/letsencrypt
cd letsencrypt/
./letsencrypt-auto certonly --standalone --email you@email.com -d domain.com -d www.domain.com
```

Follow the instructions, and you should have your new certificate (remember to set an alarm for a few days before the date it tells you, to update your certificates).

Finally, edit your shout config, enable https support, add the file "privkey.pem" as the key, and add the cert.pem as the certificate. (Bear in mind that letsencrypt will create your /etc/letsencrypt folder as root, so you might have to change the owner to the user that runs shout).


## Development setup

To run the app from source, just clone the code and run this in your terminal:

```
npm install
npm run build
npm start
```

## License

Available under the [MIT License](http://mths.be/mit).

Some fonts licensed under [SIL OFL](http://scripts.sil.org/OFL) and the [Apache License](http://www.apache.org/licenses/).
