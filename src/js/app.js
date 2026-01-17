/**
 * 
 * Audio Oscillator
 * @author Matt DeCamp <matt@mattdecamp.com>
 * 
 */

/**
 * Window reload reset
 * @description Resets the value and range values on page load.
 */
window.onload = function () {
  document.getElementById('oscValue').value = '1000'
  document.getElementById('oscRange').value = 1000
}

/**
 * On/Off Button
 * @description Toggle for the application's audio
 */
const onOff = document.querySelector('#onOff')

onOff.addEventListener('click', (e) => {
  if (onOff.getAttribute('data-muted') === 'false') {
    gainNode.disconnect(audioContext.destination)
    gainNodeNoise.disconnect(audioContext.destination)
    onOff.setAttribute('data-muted', 'true')
    onOff.innerHTML = 'Play'
  } else {
    audioContext.resume()
    gainNode.connect(audioContext.destination)
    gainNodeNoise.connect(audioContext.destination)
    onOff.setAttribute('data-muted', 'false')
    onOff.innerHTML = 'Stop'
  }
})

/**
 * @description Initialize audio
 */
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

/**
 * @description Create Oscillator
 */
const oscillator = audioContext.createOscillator()
oscillator.type = 'sine'
oscillator.frequency.value = 1000 // value in hertz
oscillator.detune.setValueAtTime(0, audioContext.currentTime) // value in cents

/**
 * @description Connect Gain to Oscillator
 */
const gainNode = audioContext.createGain()
gainNode.gain.value = 0
oscillator.connect(gainNode)
gainNode.connect(audioContext.destination)

/**
 * @description Connect Gain to All three types of Noise
 */
const gainNodeNoise = audioContext.createGain()
gainNodeNoise.gain.value = 0
gainNodeNoise.connect(audioContext.destination)

/**
 * Start oscillator
 */
oscillator.start()

/**
 * Frequency control
 */
document.querySelector('#oscRange').addEventListener('input', (e) => {
  oscillator.frequency.value = e.target.value
})

/**
 * Frequency shortcut buttons
 */
const shortcuts = document.getElementsByClassName('shortcut')

const shortcutClick = function () {
  let shortcutAttr = this.getAttribute('data-freq')
  oscillator.frequency.value = shortcutAttr
  oscRange.value = shortcutAttr
  oscValue.value = shortcutAttr
}

for (let i = 0; i < shortcuts.length; i++) {
  shortcuts[i].addEventListener('click', shortcutClick, false)
}

/**
 * Frequency Volume control
 */
document.querySelector('#volume').addEventListener('input', (e) => {
  if (onOff.getAttribute('data-muted') === 'false') {
    gainNode.gain.value = e.target.value * 0.01
  } else {
    gainNode.gain.value = 0
  }
})

/**
 * Detune control
 */
document.querySelector('#detune').addEventListener('input', (e) => {
  oscillator.detune.setValueAtTime(e.target.value, audioContext.currentTime)
}) // change detuning when using the slider

/**
 * Wave radio button selection
 */
const radioButtons = document.querySelectorAll(
  'input[type=radio][name = "radio"]'
)
radioButtons.forEach((radio) =>
  radio.addEventListener('change', () => (oscillator.type = radio.value))
)

/**
 * White Noise
 */
const whiteBufferSize = 2 * audioContext.sampleRate,
  noiseBuffer = audioContext.createBuffer(
    1,
    whiteBufferSize,
    audioContext.sampleRate
  ),
  output = noiseBuffer.getChannelData(0)
for (let i = 0; i < whiteBufferSize; i++) {
  output[i] = Math.random() * 2 - 1
}

const whiteNoise = audioContext.createBufferSource()
whiteNoise.buffer = noiseBuffer
whiteNoise.loop = true
whiteNoise.volume = 0
whiteNoise.start(0)

/**
 * Pink Noise
 */
const pinkBufferSize = 4096
const pinkNoise = (function () {
  let b0, b1, b2, b3, b4, b5, b6
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
  const node = audioContext.createScriptProcessor(pinkBufferSize, 1, 1)
  node.onaudioprocess = function (e) {
    const output = e.outputBuffer.getChannelData(0)
    for (let i = 0; i < pinkBufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      output[i] *= 0.11 // (roughly) compensate for gain
      b6 = white * 0.115926
    }
  }
  return node
})()

/**
 * Brown Noise
 */
const brownBufferSize = 4096
const brownNoise = (function () {
  let lastOut = 0.0
  const node = audioContext.createScriptProcessor(brownBufferSize, 1, 1)
  node.onaudioprocess = function (e) {
    const output = e.outputBuffer.getChannelData(0)
    for (let i = 0; i < brownBufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = output[i]
      output[i] *= 3.5 // (roughly) compensate for gain
    }
  }
  return node
})()

/**
 * Start White noise
 */
const whiteNoiseCheck = document.querySelector('input[name=whiteNoise]')

whiteNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    whiteNoise.connect(gainNodeNoise)
    // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    whiteNoise.disconnect(gainNodeNoise)
    // gainNodeNoise.disconnect(audioContext.destination);
  }
})

/**
 * Start Pink noise
 */
const pinkNoiseCheck = document.querySelector('input[name=pinkNoise]')

pinkNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    pinkNoise.connect(gainNodeNoise)
    // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    pinkNoise.disconnect(gainNodeNoise)
    // gainNodeNoise.disconnect(audioContext.destination);
  }
})

/**
 * Start Brown noise
 */

const brownNoiseCheck = document.querySelector('input[name=brownNoise]')

brownNoiseCheck.addEventListener('change', function () {
  if (this.checked) {
    // Checkbox is checked
    brownNoise.connect(gainNodeNoise)
    // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    brownNoise.disconnect(gainNodeNoise)
    // gainNodeNoise.disconnect(audioContext.destination);
  }
})

/**
 * Noise Volume control
 */
document.querySelector('#noiseVolume').addEventListener('input', (e) => {
  gainNodeNoise.gain.value = e.target.value * 0.01
})

/**
 * Frequency button adjustment function
 */
const oscLower = document.querySelector('#oscLower')
const oscHigher = document.querySelector('#oscHigher')
const oscRange = document.querySelector('#oscRange')
const oscValue = document.querySelector('#oscValue')

const decreaseOsc = function () {
  if (oscillator.frequency.value >= 1) {
    oscillator.frequency.value = oscillator.frequency.value - 1
    oscRange.value = oscRange.value - 1
    oscValue.value = oscValue.value - 1
  } else {
    return 1
  }
}
oscLower.addEventListener('click', decreaseOsc)

const increaseOsc = function () {
  if (oscillator.frequency.value <= 20000) {
    oscillator.frequency.value = oscillator.frequency.value + 1
    oscRange.value = parseInt(oscRange.value) + 1
    oscValue.value = parseInt(oscValue.value) + 1
  } else {
    return
  }
}
oscHigher.addEventListener('click', increaseOsc)
