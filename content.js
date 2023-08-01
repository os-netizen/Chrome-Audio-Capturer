console.log("Hello from your Chrome extension!")
var microphone_data;
// Listen for messages from the popup.js

// function sendPOSTRequestForMicrophone(url, data) {
  
//     fetch(url, {
//       method: "POST",
//       body: data,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then(response => response.json())
//       .then(data => {
//         // Handle the response data
//         console.log(data)
//       })
//       .catch(error => {
//         console.error("Error sending POST request:", error);
//       });
//   }


function saveFile(recordedChunks) {
	const blob = new Blob(recordedChunks, {
		type: "audio/wav",
	});
    microphone_data=blob;
    console.log(blob);
    audioURL = window.URL.createObjectURL(blob);
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
    const mediaRecorder = new MediaRecorder(stream);
  
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
    navigator.mediaDevices.getUserMedia({ audio: true, systemaudio: "include" })
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