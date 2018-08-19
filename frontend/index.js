import { LedMatrix } from 'led-matrix'
import { createStore, Color } from 'matrix-display-store'
import { faceOutline, face, tile, tileSpark} from './filter'
import { faceTone } from './sound'
import faceDetect from './faceDetect'

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
    const width = Number(widthElement.value)
    const height = Number(heightElement.value)
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

      // Now play music using the new matrix/store if the user has turned it on
      if(soundRefresh) faceTone(positions, store, size, soundRefresh)

      // send the data to the raspberry pi to refresh the real LED matrix
      socket.emit('face', matrix.data.slice(0, size.width * size.height).map(({color}) => [color.r, color.g, color.b, color.a]))

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
