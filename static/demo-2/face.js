const api = pJSDom[0].pJS.fn.modes

function scale(positions) {
//center point of window
  let cx = window.pJSDom[0].pJS.canvas.w / 2
  let cy = window.pJSDom[0].pJS.canvas.h / 2

  var padding = 120
  cx -= padding
  cy -= padding

  var maxX = positions[0][0];
  var minX = positions[0][0];
  var maxY = positions[0][1];
  var minY = positions[0][1];

  for(var i = 1; i < positions.length; i++){
    if(positions[i][0] > maxX){
      maxX = positions[i][0];
    }
    if(positions[i][0] < minX){
      minX = positions[i][0];
    }
    if(positions[i][1] > maxY){
      maxY = positions[i][1];
    }
    if(positions[i][1] < minY){
      minY = positions[i][1];
    }
  }

//center point of face in video
  const w = (maxX - minX) / 2;
  const h = (maxY - minY) / 2;

//ratios
 const ratioX = cx / w;
 const ratioY = cy / h;

 var _positions = positions.map(item => item.slice());

 for(var i = 0; i < positions.length; i++){
   // if(!foobar)
   _positions[i][0] = ((positions[i][0] - minX) * ratioX) + (padding)
   _positions[i][1] = ((positions[i][1] - minY) * ratioY) + (padding)
 }

 return _positions
}

// foobar = false
// setTimeout(function(){foobar = true}, 10000)

function repulse(positions, ix) {
  const pJS = pJSDom[0].pJS

  const fpos = scale(positions)
  for(let i =0; i< pJS.particles.array.length; i++) {
    const p = pJS.particles.array[i]

    var dx_mouse = p.x - fpos[i][0],
      dy_mouse = p.y - fpos[i][1],
      dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);

    var normVec = {x: dx_mouse / dist_mouse, y: dy_mouse / dist_mouse},
      repulseRadius = pJS.interactivity.modes.repulse.distance,
      velocity = 100,
      repulseFactor = clamp((1 / repulseRadius) * (-1 * Math.pow(dist_mouse / repulseRadius, 2) + 1) * repulseRadius * velocity, 0, 5);

    var pos = {
      x: p.x + normVec.x * repulseFactor,
      y: p.y + normVec.y * repulseFactor
    }

    p.x = pos.x;
    p.y = pos.y;
  }
}

var demoicStop = [61,60,65,56,57,58,46,48,43,42]
var demoicFirst = null
function demoicFace(pJS, positions) {
  pJS.particles.array.splice(200 - positions.length, positions.length);
  let _positions = scale(positions)
  for (var p = 0; p < _positions.length; p+=2) {
    if(demoicStop.indexOf(p) !== -1) continue;
    let pt = _positions[p]
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
  }
}

function ghost(pJS, positions) {
  pJS.particles.array.splice(pJS.particles.array.length - positions.length, positions.length);
  let _positions = scale(positions)
  for (var p = 0;p < _positions.length;p++) {
    let pt = _positions[p]
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
  }
}

function faceonly(pJS, positions) {
  pJS.particles.array.splice(positions.length, pJS.particles.array.length);
  let _positions = scale(positions)
  for (var p = 0;p < _positions.length;p++) {
    let pt = _positions[p]
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
  }
}

var eyes = [23, 63,24,64,25,65,26,66,30,69,31,70,28,67,29,68, 54, 52,44,50]
function happy(pJS, positions) {
  pJS.particles.array.splice(eyes.length*4, eyes.length);
  let _positions = scale(positions)

  for (var p in eyes) {
    let pt = _positions[eyes[p]]
    api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
  }
}

var dreaming = null
var emotion = 'happy'
var positions

function positionLoop() {
  positions = ctracker.getCurrentPosition();
  if (positions) {
    const pJS = pJSDom[0].pJS

    if(document.location.search.indexOf('demoic')) demoicFace(pJS, positions)
    else if(document.location.search.indexOf('ghost')) ghost(pJS, positions)
    else if(document.location.search.indexOf('face')) faceonly(pJS, positions)
    else happy(pJS, positions)
  }
}

let cameraId = '';

var allPeople = []
var activeCId = null

var videoInput = document.getElementById('video');
var ctracker = new clm.tracker();

ctracker.init();
ctracker.start(videoInput);

function gumSuccess( stream ) {
  if ("srcObject" in videoInput) {
    videoInput.srcObject = stream;
  } else {
    videoInput.src = (window.URL && window.URL.createObjectURL(stream));
  }

  videoInput.onloadedmetadata = function() {
    videoInput.play();
    setTimeout(positionLoop, 100)
  }
}

function gumFail () {}

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

setInterval(positionLoop, 100)

