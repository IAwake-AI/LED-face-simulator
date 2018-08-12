export default function faceDetect(cb) {

  const videoInput = document.getElementById('video')
  const debugOverlay = document.getElementById('debug-overlay')
  const overlayCC = debugOverlay.getContext('2d')

  const videoInputWidth = videoInput.width
  const videoInputHeight = videoInput.height

  const ctracker = new clm.tracker()

  ctracker.init()

  function mediaDeviceSuccess(stream) {
    if ("srcObject" in videoInput) {
      videoInput.srcObject = stream
    } else {
      videoInput.src = (window.URL && window.URL.createObjectURL(stream))
    }

    videoInput.onloadedmetadata = function () {
      cb(videoInput, ctracker)

      function drawLoop() {
        requestAnimationFrame(drawLoop)
        overlayCC.clearRect(0, 0, videoInputWidth, videoInputHeight)
        if (ctracker.getCurrentPosition()) {
          ctracker.draw(debugOverlay)
        }
      }

      drawLoop()
    }
  }

  function mediaDeviceFail() {
    alert('Your browser media device failed!')
  }

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({video: true}).then(mediaDeviceSuccess).catch(mediaDeviceFail)
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, mediaDeviceSuccess, mediaDeviceFail)
  } else {
    alert('Your browser does not seem to support getUserMedia, using a fallback video instead.')
  }
}
