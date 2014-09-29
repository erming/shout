# Shout [![](https://badge.fury.io/js/shout.png)](https://www.npmjs.org/package/shout)

__What is it?__  
Shout is a web IRC client that you host on your own server.

__What features does it have?__  
- Multiple user support
- Stays connected even when you close the browser
- Connect from multiple devices at once
- Responsive layout — works well on your smartphone
- _... and more!_

__Ok, you caught my attention. I want to try it!__  
Here's a Shout server running in public mode, which allows for anonymous connections:

### [Try the Demo](http://demo.shout-irc.com/)

_Clicking the link above will open http://demo.shout-irc.com/_

## Install

```
sudo npm install -g shout
```

## Usage

When the install is complete, go ahead and start the server:

```
shout
```

For more information:

```
shout --help
```

## Screenshot

![](https://raw.github.com/erming/shout/master/screenshots/shout.png)

## Configuration

Open the `config.json` file by running:

```
shout config
```

The settings:

__port__  
The default port to be used.  
You can override this by running `shout --port 80`

__public__  
Set to either `true|false`.  
When set to `false`, a login will be required for connecting users.


## User Management

Go ahead and run `shout --help`:

```
$ shout --help

  Usage: shout [options] [command]

  Commands:

    start
       Start the server

    config
       Edit config: '/usr/lib/node_modules/shout/config.json'

    list
       List all existing users

    add <name>
       Add a new user

    remove <name>
       Remove an existing user

    reset <name>
       Reset user password

    edit <name>
       Edit user: '/home/erming/.shout/users/<name>/user.json'


  Options:

    -h, --help         output usage information
    -h, --host <ip>    host
    -p, --port <port>  port
```

Pretty simple, huh?

If you want to edit users manually, see `users/example/user.json`.

## Commands

These are the commands currently implemented:

- [x] /clear
- [x] /close
- [x] /connect
- [x] /deop
- [x] /devoice
- [x] /disconnect
- [x] /invite
- [x] /join
- [x] /kick
- [x] /leave
- [x] /me
- [x] /mode
- [x] /msg
- [x] /nick
- [x] /notice
- [x] /op
- [x] /part
- [x] /query
- [x] /quit
- [x] /quote
- [x] /raw
- [x] /say
- [x] /send
- [x] /server
- [x] /slap
- [x] /topic
- [x] /voice
- [x] /whois

## License

Available under [the MIT license](http://mths.be/mit).
