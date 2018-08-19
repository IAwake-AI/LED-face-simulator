import Howl from 'howler'

const notes = []

for (let i = 0; i < 16; i++) {
  notes[i] = new window.Howl({
    src: ['/sounds/' + i + '.mp3', '/sounds/' + i + '.ogg']
  })
}

let interval
let scorePosition = 0
export default function(positions, store, size, refresh) {
  if(interval) return
  scorePosition = 0

  interval = setInterval(function() {
    let row = store.y
    while(row--) {
      let pixel = store.matrix[scorePosition + (store.x * row)]
      if(pixel && pixel.on && pixel.color.a > .1) {
        notes[row % 16].play()
      }
    }

    scorePosition++
    if(scorePosition > store.x) {
      interval = clearInterval(interval)
    }
  }, Math.floor(refresh / size.width))
}
