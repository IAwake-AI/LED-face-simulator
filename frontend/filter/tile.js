import {Color} from "matrix-display-store";

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

export default function(positions, store, size, videoInput) {

  canvas.height = videoInput.height
  canvas.width = videoInput.width

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(videoInput, 0, 0, size.width, size.height)

  for(let ix = 0, max = size.height * size.width; ix < max; ix++) {
    const col = ix % size.width

    const row = Math.floor(ix/size.width)
    const data = ctx.getImageData(col, row,1, 1).data

    store.drawPixel(col, row, Color.rgba(data[0], data[1], data[2], 1))
  }
}
