import { LedMatrix } from 'led-matrix'
import { createStore, Color } from 'matrix-display-store'
import { faceOutline, face, tile } from './filter'
import faceDetect from './faceDetect'

document.addEventListener("DOMContentLoaded", () => {
  const canvasElement = document.getElementById('matrix')
  const widthElement = document.getElementById('width')
  const heightElement = document.getElementById('height')
  const pixalSizeElement = document.getElementById('pixal-size')
  const pixalMarginElement = document.getElementById('pixal-margin')
  const refreshElement = document.getElementById('refresh')
  const filterElement = document.getElementById('filter')

  let videoInput, ctracker, intervalTimer;

  function onSettingChanged() {
    const width = Number(widthElement.value)
    const height = Number(heightElement.value)
    const pixalSize = Number(pixalSizeElement.value)
    const pixalMargin = Number(pixalMarginElement.value)
    const refresh = Number(refreshElement.value)
    const filter = filterElement.value

    reset({width, height}, pixalSize, pixalMargin, refresh, filter)
  }

  widthElement.onchange = onSettingChanged
  heightElement.onchange = onSettingChanged
  pixalSizeElement.onchange = onSettingChanged
  pixalMarginElement.onchange = onSettingChanged
  refreshElement.onchange = onSettingChanged
  filterElement.onchange = onSettingChanged

  function reset(size, pixalSize, pixalMargin, refresh, filter) {
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

    intervalTimer && clearInterval(intervalTimer)
    intervalTimer = setInterval(() => {
      const positions = ctracker && ctracker.getCurrentPosition()
      if(!positions) return

      if(filter === 'faceOutline') faceOutline(positions, store, size, videoInput)
      else if(filter === 'face') face(positions, store, size, videoInput)
      else if(filter === 'tile') tile(positions, store, size, videoInput)

      matrix.render()
    }, refresh)

    // only init faceDetect once (and save off references to video & ctracker
    if(!ctracker) {
      faceDetect((_videoInput, _ctracker) => {
        videoInput = _videoInput
        ctracker = _ctracker

        videoInput.play()
        ctracker.start(videoInput)
      })
    }
  }

  // init the application
  onSettingChanged()
}, false)
