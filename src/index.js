const os = require('os')
const dns = require('dns')
const path = require('path')
const express = require('express')
const app = express()
const index = require('http').Server(app)
const io = require('socket.io')(index)

io.on('connection', function (socket) {
  socket.on('face', function (data) {
    socket.broadcast.emit('face', data)
    //socket.emit('face', data);
  });
});

const staticPath = path.resolve(__dirname, '..', 'static')
app.use(express.static(staticPath))

const port = process.env.PORT || 1337
dns.lookup(os.hostname(), function (err, address, fam) {
  console.log(`Serving on: ${address}:${port} (IPV${fam}) - ${staticPath}`);
})

index.listen(port)
