"use strict";

// On load resets
window.onload = function () {
  document.getElementById('oscValue').value = '1000';
  document.getElementById('oscRange').value = 1000;
}; // On and Off button


var onOff = document.querySelector('#onOff');
onOff.addEventListener('click', function (e) {
  if (onOff.getAttribute('data-muted') === 'false') {
    gainNode.disconnect(audioContext.destination);
    gainNodeNoise.disconnect(audioContext.destination);
    onOff.setAttribute('data-muted', 'true');
    onOff.innerHTML = 'Play';
  } else {
    audioContext.resume();
    gainNode.connect(audioContext.destination);
    gainNodeNoise.connect(audioContext.destination);
    onOff.setAttribute('data-muted', 'false');
    onOff.innerHTML = 'Stop';
  }
}); // Initialize audio

var audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create oscillator

var oscillator = audioContext.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 1000; // value in hertz

oscillator.detune.setValueAtTime(0, audioContext.currentTime); // value in cents
// Connect Gain to Oscillator

var gainNode = audioContext.createGain();
gainNode.gain.value = 0;
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination); // Connect Gain to All three types of Noise

var gainNodeNoise = audioContext.createGain();
gainNodeNoise.gain.value = 0;
gainNodeNoise.connect(audioContext.destination); // Start oscillator

oscillator.start(); // Frequency control

document.querySelector('#oscRange').addEventListener('input', function (e) {
  oscillator.frequency.value = e.target.value;
}); // Frequency shortcuts

var shortcuts = document.getElementsByClassName('shortcut');

var shortcutClick = function shortcutClick() {
  var shortcutAttr = this.getAttribute('data-freq');
  oscillator.frequency.value = shortcutAttr;
  oscRange.value = shortcutAttr;
  oscValue.value = shortcutAttr;
};

for (var i = 0; i < shortcuts.length; i++) {
  shortcuts[i].addEventListener('click', shortcutClick, false);
} // Frequency Volume control


document.querySelector('#volume').addEventListener('input', function (e) {
  if (onOff.getAttribute('data-muted') === 'false') {
    gainNode.gain.value = e.target.value * 0.01;
  } else {
    gainNode.gain.value = 0;
  }
}); // Detune control

document.querySelector('#detune').addEventListener('input', function (e) {
  oscillator.detune.setValueAtTime(e.target.value, audioContext.currentTime);
}); // change detuning when using the slider
// Wave radio button selection

var radioButtons = document.querySelectorAll('input[type=radio][name = "radio"]');
radioButtons.forEach(function (radio) {
  return radio.addEventListener('change', function () {
    return oscillator.type = radio.value;
  });
}); // White Noise

var whiteBufferSize = 2 * audioContext.sampleRate,
    noiseBuffer = audioContext.createBuffer(1, whiteBufferSize, audioContext.sampleRate),
    output = noiseBuffer.getChannelData(0);

for (var _i = 0; _i < whiteBufferSize; _i++) {
  output[_i] = Math.random() * 2 - 1;
}

var whiteNoise = audioContext.createBufferSource();
whiteNoise.buffer = noiseBuffer;
whiteNoise.loop = true;
whiteNoise.volume = 0;
whiteNoise.start(0); // Pink Noise

var pinkBufferSize = 4096;

var pinkNoise = function () {
  var b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  var node = audioContext.createScriptProcessor(pinkBufferSize, 1, 1);

  node.onaudioprocess = function (e) {
    var output = e.outputBuffer.getChannelData(0);

    for (var _i2 = 0; _i2 < pinkBufferSize; _i2++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[_i2] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[_i2] *= 0.11; // (roughly) compensate for gain

      b6 = white * 0.115926;
    }
  };

  return node;
}(); // Brown Noise


var brownBufferSize = 4096;

var brownNoise = function () {
  var lastOut = 0.0;
  var node = audioContext.createScriptProcessor(brownBufferSize, 1, 1);

  node.onaudioprocess = function (e) {
    var output = e.outputBuffer.getChannelData(0);

    for (var _i3 = 0; _i3 < brownBufferSize; _i3++) {
      var white = Math.random() * 2 - 1;
      output[_i3] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[_i3];
      output[_i3] *= 3.5; // (roughly) compensate for gain
    }
  };

  return node;
}(); // Start White noise


var whiteNoiseCheck = document.querySelector('input[name=whiteNoise]');
whiteNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    whiteNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    whiteNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Start Pink noise

var pinkNoiseCheck = document.querySelector('input[name=pinkNoise]');
pinkNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    pinkNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    pinkNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Start Brown noise

var brownNoiseCheck = document.querySelector('input[name=brownNoise]');
brownNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    brownNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    brownNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Noise Volume control

document.querySelector('#noiseVolume').addEventListener('input', function (e) {
  gainNodeNoise.gain.value = e.target.value * 0.01;
}); // Frequency button adjustment function

var oscLower = document.querySelector('#oscLower');
var oscHigher = document.querySelector('#oscHigher');
var oscRange = document.querySelector('#oscRange');
var oscValue = document.querySelector('#oscValue');

var decreaseOsc = function decreaseOsc() {
  if (oscillator.frequency.value >= 1) {
    oscillator.frequency.value = oscillator.frequency.value - 1;
    oscRange.value = oscRange.value - 1;
    oscValue.value = oscValue.value - 1;
  } else {
    return 1;
  }
};

oscLower.addEventListener('click', decreaseOsc);

var increaseOsc = function increaseOsc() {
  if (oscillator.frequency.value <= 20000) {
    oscillator.frequency.value = oscillator.frequency.value + 1;
    oscRange.value = parseInt(oscRange.value) + 1;
    oscValue.value = parseInt(oscValue.value) + 1;
  } else {
    return;
  }
};

oscHigher.addEventListener('click', increaseOsc);