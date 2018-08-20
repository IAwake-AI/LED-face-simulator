import fs from 'fs'
import os from 'os'
import dns from 'dns'
import path from 'path'
import https from 'https'
import http from 'http'
import express from 'express'
import socketIO from 'socket.io'
import detectRPI from 'detect-rpi'

let leds = null
if(detectRPI()) {
  try {
    const Blinkt = require('node-blinkt')
    leds = new Blinkt()
  } catch(err) {
    console.log('On RPI you need to install "node-blinkt" and run as root!\n$ npm install node-blinkt\n\n')
    process.exitCode(1)
  }

  leds.setup()
  leds.clearAll()
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
      data.forEach((color, ix)=> {
        leds.setPixel(ix, color[0], color[1], color[2], color[3])
      })

      leds.sendUpdate()
    }
  });
});

app.use(express.static(staticPath))
app.get('/bundle.js', (req, res) => res.type('javascript').sendFile(path.join(buildPath, 'bundle.js')))

dns.lookup(os.hostname(), function (err, address, fam) {
  console.log(`Serving on: ${address}:${port} ${noTLS ? '' : 'TLS'} (IPV${fam}) - ${staticPath}`);
})

index.listen(port)
