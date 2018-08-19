import fs from 'fs'
import os from 'os'
import dns from 'dns'
import path from 'path'
import https from 'https'
import http from 'http'
import express from 'express'
import socketIO from 'socket.io'

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

  });
});

app.use(express.static(staticPath))
app.get('/bundle.js', (req, res) => res.type('javascript').sendFile(path.join(buildPath, 'bundle.js')))

dns.lookup(os.hostname(), function (err, address, fam) {
  console.log(`Serving on: ${address}:${port} ${noTLS ? '' : 'TLS'} (IPV${fam}) - ${staticPath}`);
})

index.listen(port)
