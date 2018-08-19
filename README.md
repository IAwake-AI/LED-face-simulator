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
$ clone git@github.com:IAwake-AI/LED-face-simulator.git
$ cd LED-face-simulator
$ npm install
$ npm run build
$ sudo npm start
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

