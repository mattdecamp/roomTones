console.log("hey there");

// let oscValue = document.getElementById("oscValue").value;
// let valLabel = document.getElementById("valLabel").innerHTML;

window.onload = function () {
    document.getElementById("oscValue").value = "440";
    document.getElementById("oscRange").value = 440;
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440; // value in hertz
oscillator.connect(audioContext.destination);
oscillator.start();

document.addEventListener("click", () => audioContext.resume(), { once: true });

// document.querySelector("#wave").addEventListener("change", (e) => {
//     oscillator.type = e.target.value;
// });

document.querySelector("#oscRange").addEventListener("input", (e) => {
    oscillator.frequency.value = e.target.value;
});

// document.querySelector("#volume").addEventListener("input", (e) => {
//     gainNode.gain.value = e.target.value * 0.01;
// });
