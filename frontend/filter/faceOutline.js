import {Color} from "matrix-display-store";

export default function(positions, store, size) {

  const clamp = positions.reduce((acc, coord) => {
    return {
      min: [(coord[0] < acc.min[0] ? coord[0] : acc.min[0]), (coord[1] < acc.min[1] ? coord[1] : acc.min[1])],
      max: [(coord[0] > acc.max[0] ? coord[0] : acc.max[0]), (coord[1] > acc.max[1] ? coord[1] : acc.max[1])]
    }
  }, {min:[Number.MAX_VALUE, Number.MAX_VALUE], max: [0,0]})

  store.fillRect(0, 0, size.width, size.height, Color.rgba(0,0,0,.05))

  let last = positions[0]

  positions.forEach(coord => {
    store.drawLine(
      Math.floor((last[0] - clamp.min[0])/((clamp.max[0]-clamp.min[0])/size.width)),
      Math.floor((last[1] - clamp.min[1])/((clamp.max[1]-clamp.min[1])/size.height)),

      Math.floor((coord[0] - clamp.min[0])/((clamp.max[0]-clamp.min[0])/size.width)),
      Math.floor((coord[1] - clamp.min[1])/((clamp.max[1]-clamp.min[1])/size.height)),
      Color.hex('#FFCC00'),
    )

    last = coord
  })

  //store.drawPixel(2, t++, Color.hex('#FFCC00'))
  //store.drawLine(0, 0, 4, 1, Color.hex('#FF00AA'))
}
