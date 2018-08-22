# LED face simulator

The goal of this project is to let the community
build new exciting interactive faces for the IAake robot

## Setup and running

#### Labtop (development)

You will need to have nodeJS installed
```
$ clone git@github.com:IAwake-AI/LED-face-simulator.git
$ cd LED-face-simulator
$ npm install
$ 
```

Run in development mode
```
$ npm run dev
```

You can also 

#### Raspberry PI (production)

You will need to have an older version of Node installed vs 7 and
you need to run as root

```
$ sudo -s
# apt-get purge nodejs
# curl -L https://git.io/n-install | bash
# /root/n/bin/n 7.10.1
# npm install -g nodemon
```

```
$ clone git@github.com:IAwake-AI/LED-face-simulator.git
$ cd LED-face-simulator
$ npm install
$ npm install node-blinkt rpi-ws281x-native
$ npm run build
$ sudo npm start
```

NOTE: You need to install node-blinkt for the Raspberry PI
because it can not be added to package.json (the osx version does not support node-blinkt)

For development
```
$ npm run pidev
```

NOTE: Other environment variables for PI development
```
export LED_DRIVER=blinkt or ws281x
export LED_MAX=64
```


#### Build and Deploy

The `npm run build` will build production bundles and output
them in `build` folder

```
$ npm run build
$ npm start
```

NOTES: Set the environment variables PORT={any port} or NO_TLS=1 to override the default
configuration. This is needed if you deploy to heroku, aws, docker, etc.

Checkout `/demo-2/index.html` for a partical demo

Checkout [commit diff](https://github.com/IAwake-AI/LED-face-simulator/commit/4958f78134381ec954831bc75fd9c7bfff2ac21b) to see how to add a new filter

### CODE

The `frontend` directory holds all the logic for face detection and sending
data to the backend. It sends the data via a websocket.
