console.log("Hello from your Chrome extension!")
var microphone_data;

// Listen for messages from the popup.js

// function encodeWAV(samples) {
//     var buffer = new ArrayBuffer(44 + samples.length * 2);
//     var view = new DataView(buffer);

//     /* RIFF identifier */
//     writeString(view, 0, 'RIFF');
//     /* RIFF chunk length */
//     view.setUint32(4, 36 + samples.length * 2, true);
//     /* RIFF type */
//     writeString(view, 8, 'WAVE');
//     /* format chunk identifier */
//     writeString(view, 12, 'fmt ');
//     /* format chunk length */
//     view.setUint32(16, 16, true);
//     /* sample format (raw) */
//     view.setUint16(20, 1, true);
//     /* channel count */
//     view.setUint16(22, numChannels, true);
//     /* sample rate */
//     view.setUint32(24, sampleRate, true);
//     /* byte rate (sample rate * block align) */
//     view.setUint32(28, sampleRate * 4, true);
//     /* block align (channel count * bytes per sample) */
//     view.setUint16(32, numChannels * 2, true);
//     /* bits per sample */
//     view.setUint16(34, 16, true);
//     /* data chunk identifier */
//     writeString(view, 36, 'data');
//     /* data chunk length */
//     view.setUint32(40, samples.length * 2, true);

//     floatTo16BitPCM(view, 44, samples);

//     return view;
// }


function saveFile(recordedChunks) {
	const blob = new Blob(recordedChunks, {
		type: "audio/webm",
	});
    microphone_data=blob;
    console.log(blob);
    audioURL = window.URL.createObjectURL(blob);
    console.log(recordedChunks);
    chrome.runtime.sendMessage({stopCapture : audioURL});
    // sendPOSTRequestForMicrophone("http://localhost:8000/ext/microphone", blob);

	// let filename = window.prompt("Enter file name"),
	// 	downloadLink = document.createElement("a");
	// downloadLink.href = URL.createObjectURL(blob);
	// downloadLink.download = `${filename}.mp3`;

	// document.body.appendChild(downloadLink);
	// downloadLink.click();
	// URL.revokeObjectURL(blob); // clear from memory
	// document.body.removeChild(downloadLink);
}

function Recorder(stream){

    var recordedChunks = [];
    const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/webm"});
  
    mediaRecorder.ondataavailable = function (e) {
          if (e.data.size > 0) {
              recordedChunks.push(e.data);
          }
      };
      mediaRecorder.onstop = function () {
          saveFile(recordedChunks);
          recordedChunks = [];
      };
      mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
      return mediaRecorder;
}

startRecording = () => {
    console.log("Recording started");
    navigator.mediaDevices.getUserMedia({ audio: true, systemaudio: "include", echoCancellation: true, noiseSuppression: true })
    .then(function (stream) {
        mediaRecorder = Recorder(stream);
    })
    .catch(function (err) {
        console.log("The following error occured: " + err);
    });
}

stopRecording = () => {
    console.log("Recording stopped");
    mediaRecorder.stop();
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("Message received in content script:", message);
    if (message.message === "start") {
        startRecording();
        console.log("Message received in content script:", message.message);
    }
    else if (message.message === "stop") {
        stopRecording();
    }
});