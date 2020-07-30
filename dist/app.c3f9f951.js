// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/app.js":[function(require,module,exports) {
// On load resets
window.onload = function () {
  document.getElementById("oscValue").value = "440";
  document.getElementById("oscRange").value = 440;
}; // Initialize audio


var audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create oscillator

var oscillator = audioContext.createOscillator();
oscillator.type = "sine";
oscillator.frequency.value = 440; // value in hertz

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

document.querySelector("#oscRange").addEventListener("input", function (e) {
  oscillator.frequency.value = e.target.value;
}); // Frequency shortcuts

var shortcuts = document.getElementsByClassName("shortcut");

var shortcutClick = function shortcutClick() {
  var shortcutAttr = this.getAttribute("data-freq");
  oscillator.frequency.value = shortcutAttr;
  oscRange.value = shortcutAttr;
  oscValue.value = shortcutAttr;
};

for (var i = 0; i < shortcuts.length; i++) {
  shortcuts[i].addEventListener("click", shortcutClick, false);
} // On and Off button


var onOff = document.querySelector("#onOff");
onOff.addEventListener("click", function (e) {
  if (onOff.getAttribute("data-muted") === "false") {
    gainNode.disconnect(audioContext.destination);
    gainNodeNoise.disconnect(audioContext.destination);
    onOff.setAttribute("data-muted", "true");
    onOff.innerHTML = "Play";
  } else {
    gainNode.connect(audioContext.destination);
    gainNodeNoise.connect(audioContext.destination);
    onOff.setAttribute("data-muted", "false");
    onOff.innerHTML = "Stop";
  }
}); // Frequency Volume control

document.querySelector("#volume").addEventListener("input", function (e) {
  if (onOff.getAttribute("data-muted") === "false") {
    gainNode.gain.value = e.target.value * 0.01;
  } else {
    gainNode.gain.value = 0;
  }
}); // Detune control

document.querySelector("#detune").addEventListener("input", function (e) {
  oscillator.detune.setValueAtTime(e.target.value, audioContext.currentTime);
}); // change detuning when using the slider
// Wave radio button selection

var radioButtons = document.querySelectorAll('input[type=radio][name = "radio"]');
radioButtons.forEach(function (radio) {
  return radio.addEventListener("change", function () {
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


var whiteNoiseCheck = document.querySelector("input[name=whiteNoise]");
whiteNoiseCheck.addEventListener("change", function () {
  if (this.checked) {
    // Checkbox is checked
    whiteNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    whiteNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Start Pink noise

var pinkNoiseCheck = document.querySelector("input[name=pinkNoise]");
pinkNoiseCheck.addEventListener("change", function () {
  if (this.checked) {
    // Checkbox is checked
    pinkNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    pinkNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Start Brown noise

var brownNoiseCheck = document.querySelector("input[name=brownNoise]");
brownNoiseCheck.addEventListener("change", function () {
  if (this.checked) {
    // Checkbox is checked
    brownNoise.connect(gainNodeNoise); // gainNodeNoise.connect(audioContext.destination);
  } else {
    // Checkbox is not checked
    brownNoise.disconnect(gainNodeNoise); // gainNodeNoise.disconnect(audioContext.destination);
  }
}); // Noise Volume control

document.querySelector("#noiseVolume").addEventListener("input", function (e) {
  gainNodeNoise.gain.value = e.target.value * 0.01;
}); // Frequency button adjustment function

var oscLower = document.querySelector("#oscLower");
var oscHigher = document.querySelector("#oscHigher");
var oscRange = document.querySelector("#oscRange");
var oscValue = document.querySelector("#oscValue");

var decreaseOsc = function decreaseOsc() {
  if (oscillator.frequency.value >= 1) {
    oscillator.frequency.value = oscillator.frequency.value - 1;
    oscRange.value = oscRange.value - 1;
    oscValue.value = oscValue.value - 1;
  } else {
    return 1;
  }
};

oscLower.addEventListener("mousedown", decreaseOsc);

var increaseOsc = function increaseOsc() {
  if (oscillator.frequency.value <= 20000) {
    oscillator.frequency.value = oscillator.frequency.value + 1;
    oscRange.value = parseInt(oscRange.value) + 1;
    oscValue.value = parseInt(oscValue.value) + 1;
  } else {
    return;
  }
};

oscHigher.addEventListener("click", increaseOsc);

function clickAndHold() {
  setTimeout(decreaseOsc, 200);
}
},{}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53622" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","js/app.js"], null)
//# sourceMappingURL=/app.c3f9f951.js.map