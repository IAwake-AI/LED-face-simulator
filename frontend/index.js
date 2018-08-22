import { LedMatrix } from 'led-matrix'
import { createStore, Color } from 'matrix-display-store'
import { faceOutline, face, tile, tileSpark} from './filter'
import { faceTone } from './sound'
import faceDetect from './faceDetect'

// simple helper function to build the face mask
// its kinda like a slop calculator. You set the
// row (0-end of the slope) and the len is the
// starting length, then the grow is a + or -
// number that will be the amount that will be
// masked.
// For Example, (2, size, 4, 3) would start with 4 square in the middle +
// (row*grow). If you have a (2, size, 4, -3) it would be (4*3) pixels from
// then edges of the matrix
const emptyPixel = Color.rgba(0, 0, 0, 0)
function slopeMask(row, size, len, grow) {
  const span = Math.floor((grow*row) + len)
  let x = Math.floor((size.width/2)-(span/2))
  let x2 = x + span

  if(x<0) x = 0
  if(x2 > size.width) x2 = size.width

  return [x, x2]
}

function rgb2hex({r, g, b}) {
  let rgb = b | (g << 8) | (r << 16);
  // if 000000 -> 0
  return '' + (0x1000000 + rgb).toString(16).slice(1)
}

// wait for the page to load
document.addEventListener("DOMContentLoaded", () => {

  let videoInput, ctracker, intervalTimer;

  // open a socket connection to the raspberry pi
  const socket = io()

  // =============================================
  // get references to all the controls on the page
  // when any control is changed call onSettingChanged
  // that in turn will call reset to restart the face
  // filter

  const canvasElement = document.getElementById('matrix')
  const widthElement = document.getElementById('width')
  const heightElement = document.getElementById('height')
  const pixalSizeElement = document.getElementById('pixal-size')
  const pixalMarginElement = document.getElementById('pixal-margin')
  const refreshElement = document.getElementById('refresh')
  const soundRefreshElement = document.getElementById('sound-refresh')
  const filterElement = document.getElementById('filter')

  function onSettingChanged() {
    const width = 30
    const height = 25
    const pixalSize = Number(pixalSizeElement.value)
    const pixalMargin = Number(pixalMarginElement.value)
    const refresh = Number(refreshElement.value)
    const soundRefresh = Number(soundRefreshElement.value)
    const filter = filterElement.value

    reset({width, height}, pixalSize, pixalMargin, refresh, soundRefresh, filter)
  }

  widthElement.onchange = onSettingChanged
  heightElement.onchange = onSettingChanged
  pixalSizeElement.onchange = onSettingChanged
  pixalMarginElement.onchange = onSettingChanged
  refreshElement.onchange = onSettingChanged
  soundRefreshElement.onchange = onSettingChanged
  filterElement.onchange = onSettingChanged

  // =============================================
  // simple function to start a loop waiting for data
  // from the camera then it apply a filter that updates
  // the matrix and sends data via socket to the raspberry pi

  function reset(size, pixalSize, pixalMargin, refresh, soundRefresh, filter) {

    // now build a mask because the LED are not a square box, but a face shape
    // the mask is an array of [row] => that have [start, end] so that anything
    // between 0-start and end-(end edge) will be ignored or only pixel between
    // start-end will be used per row
    const mask = [
      [13, 17],
      [10, 20],
      [7, 23],
      [4, 26],
      [1, 29],
      [0, 30],
      [1, 29],
      [1, 29],
      [2, 28],
      [2, 28],
      [3, 27],
      [3, 27],
      [4, 26],
      [5, 25],
      [5, 25],
      [6, 24],
      [6, 24],
      [7, 23],
      [7, 23],
      [8, 22],
      [8, 22],
      [9, 21],
      [11, 19],
      [13, 17],
      [14, 16],
    ]

    // setup a LED matrix (in memory model of all the LEDs)
    const store = createStore(size.width, size.height)
    const matrix = new LedMatrix(canvasElement, {
      x: size.width,
      y: size.height,
      pixelWidth: pixalSize,
      pixelHeight: pixalSize,
      margin: pixalMargin,
      glow: true,
      animated: false,
    });

    matrix.setData(store.matrix)

    // start/reset timer - remember reset is called each time
    // a user changes any control so we need to cleanup/reset
    // our timer.
    intervalTimer && clearInterval(intervalTimer)
    let lastPositions
    intervalTimer = setInterval(() => {

      // get the current face detection points from the camera and
      // skip updating anything in the matrix/store if no face detected
      let positions = ctracker && ctracker.getCurrentPosition()
      if(!positions) {
        if(!lastPositions) return
        positions = lastPositions
      }

      // apply the user selected filter using the current config, face points, and matrix/store data
      if(filter === 'faceOutline') faceOutline(positions, store, size, videoInput)
      else if(filter === 'face') face(positions, store, size, videoInput)
      else if(filter === 'tile') tile(positions, store, size, videoInput)
      else if(filter === 'tileSpark') tileSpark(positions, store, size, videoInput)

      mask.forEach(([offset, end], ix) => {
        for(let x=0; x<offset; x++) store.drawPixel(x, ix, emptyPixel)
        for(let x=end; x<size.width; x++) store.drawPixel(x, ix, emptyPixel)
      })

      // Now play music using the new matrix/store if the user has turned it on
      if(soundRefresh) faceTone(positions, store, size, soundRefresh)

      const ledArray = []
      mask.forEach(([start, end], row) => {
        for(let i = ((row * size.width) + start), span =0 ; span < end; span++, i++) {
          matrix.data[i] && ledArray.push(rgb2hex(matrix.data[i].color))
        }
      })

      // send the data to the raspberry pi to refresh the real LED matrix
      socket.emit('face', ledArray.join(','))

      // redraw the canvas display
      // using the current matrix/store
      matrix.render()

      if(lastPositions !== positions) {
        lastPositions = positions
      }
    }, refresh)
  }

  // now start the face detect loop
  faceDetect((_videoInput, _ctracker) => {
    videoInput = _videoInput
    ctracker = _ctracker

    videoInput.play()
    ctracker.start(videoInput)
  })

  // init the application
  onSettingChanged()
}, false)
