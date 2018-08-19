import {Color} from "matrix-display-store"

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

let spike = [.5, 1.5,3]
setInterval(()=> {
  spike[0] = (Math.random()*100)/10
  spike[1] = (Math.random()*100)/10
  spike[2] = (Math.random()*100)/10
}, 2000)

export default function(positions, store, size, videoInput) {

  const w = canvas.height = videoInput.height
  const h = canvas.width = videoInput.width

  ctx.drawImage(videoInput, 0, 0, w, h);

  const hSize = Math.floor(h/size.height)
  const wSize = Math.floor(w/size.width)

  for(let ix = 0, max = size.height * size.width; ix < max; ix++) {
    const col = ix % size.width
    const row = Math.floor(ix/size.width)

    const x = col * wSize
    const y = row * hSize

    const data = ctx.getImageData(x, y, wSize, hSize).data

    let i = 0, count = 0, length = data.length
    let r = 0, g = 0, b = 0, a = 1
    while ((i += 4) < length) {
      count++;
      r += data[i]
      g += data[i+1]
      b += data[i+2]
    }

    r = Math.floor(r/count)
    g = Math.floor(g/count)
    b = Math.floor(b/count)

    r += Math.floor(r/spike[0])
    g += Math.floor(g/spike[1])
    b += Math.floor(b/spike[2])

    if(r > 255) {r=255; a = 255/r}
    if(g > 255) {g=255; a = 255/r}
    if(b > 255) {b=255; a = 255/r}

    store.drawPixel(col, row, Color.rgba(r, g, b, a))
  }
}
