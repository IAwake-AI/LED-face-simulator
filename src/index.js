import fs from 'fs'
import os from 'os'
import dns from 'dns'
import path from 'path'
import https from 'https'
import http from 'http'
import express from 'express'
import socketIO from 'socket.io'
import detectRPI from 'detect-rpi'

// environment variables you can set
const LED_DRIVER = process.env.LED_DRIVER
const LED_MAX = parseInt(process.env.LED_MAX || (16 * 4), 10)

let leds = null
let ledsWS281X = null

if(detectRPI()) {
  try {
    const ws281x = require('rpi-ws281x-native')
    if(LED_DRIVER === 'blinkt') {
      const Blinkt = require('node-blinkt')
      leds = new Blinkt()

      leds.setup()
      leds.clearAll()
    } else if(LED_DRIVER === 'ws281x') {
      leds = require('rpi-ws281x-native')
      leds.reset()
      leds.init(LED_MAX)
      leds.setBrightness(1)

      ledsWS281X = new Uint32Array(LED_MAX)
      for(let i=0; i<LED_MAX; i++) {
        ledsWS281X[i] = 0
      }

      leds.render(ledsWS281X)

      process.on('SIGINT', () => {
        leds.reset()
        process.nextTick(() => process.exit(0))
      })
    } else {
      console.log('You need to set environment variable LED_DRIVER\n\ni.e. export LED_DRIVER=blinkt or LED_DRIVER=ws281x')
      process.exit(1)
    }
  } catch(err) {
    console.log('On RPI you need to run "npm install node-blinkt rpi-ws281x-native" and run as root!\n\n')
    console.log('ERROR', err)
    process.exit(1)
  }
}

const app = express()

const noTLS = process.env.NO_TLS
const port = process.env.PORT || (noTLS ? 80 : 443)
const buildPath = path.resolve(__dirname, '..', 'build')
const staticPath = path.resolve(__dirname, '..', 'static')

const ca = !noTLS && fs.readFileSync(path.resolve(__dirname, '..', 'cert', 'tls.pem'), 'utf8')
const certificate = {key: ca, cert: ca}

// create the express and socketIO server with or without TLS (chrome will only let the camera work if TLS is enabled)
const index = noTLS ? http.createServer(app) : https.createServer(certificate, app)
const io = socketIO(index)

io.on('connection', function (socket) {
  socket.on('face', function (data) {
    if(leds) {
      if(driver === 'blinkt') {
        data.split(',').forEach((hex, ix) => {
          if(ix > LED_MAX) return; // ignore LED over our address space

          const bigint = parseInt(hex, 16)
          const r = (bigint >> 16) & 255
          const g = (bigint >> 8) & 255
          const b = bigint & 255

          leds.setPixel(ix, r, g, b, 1)
        })

        leds.sendUpdate()
      } else if(driver === 'ws281x') {
        data.split(',').forEach((hex, ix) => {
          if(ix > LED_MAX) return; // ignore LED over our address space

          const bigint = parseInt(hex, 16)
          ledsWS281X[ix] = bigint
        })

        leds.render(ledsWS281X)
      }
    }
  })
})

app.use(express.static(staticPath))
app.get('/bundle.js', (req, res) => res.type('javascript').sendFile(path.join(buildPath, 'bundle.js')))

dns.lookup(os.hostname(), function (err, address, fam) {
  console.log(`Serving on: ${address}:${port} ${noTLS ? '' : 'TLS'} (IPV${fam}) - ${staticPath}`);
})

index.listen(port)
