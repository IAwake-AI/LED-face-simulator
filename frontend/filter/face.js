import {Color} from "matrix-display-store";

const pointList = [27, 32, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]

export default function(positions, store, size) {

  const clamp = positions.reduce((acc, coord) => {
    return {
      min: [(coord[0] < acc.min[0] ? coord[0] : acc.min[0]), (coord[1] < acc.min[1] ? coord[1] : acc.min[1])],
      max: [(coord[0] > acc.max[0] ? coord[0] : acc.max[0]), (coord[1] > acc.max[1] ? coord[1] : acc.max[1])]
    }
  }, {min:[Number.MAX_VALUE, Number.MAX_VALUE], max: [0,0]})

  store.fillRect(0, 0, size.width, size.height, Color.rgba(0,0,0,.05))

  pointList.forEach(ix => {
    store.drawPixel(
      Math.floor((positions[ix][0] - clamp.min[0]) / ((clamp.max[0] - clamp.min[0]) / size.width)),
      Math.floor((positions[ix][1] - clamp.min[1]) / ((clamp.max[1] - clamp.min[1]) / size.height)),
      Color.hex('#FFCC00'))
  })
}
