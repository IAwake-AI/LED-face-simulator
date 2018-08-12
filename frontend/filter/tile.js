import {Color} from "matrix-display-store";

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

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
    let r = 0, g = 0, b = 0
    while ((i += 4) < length) {
      count++;
      r += data[i]
      g += data[i+1]
      b += data[i+2]
    }

    r = Math.floor(r/count)
    g = Math.floor(g/count)
    b = Math.floor(b/count)

    store.drawPixel(col, row, Color.rgba(r, g, b, 1))
  }
}
