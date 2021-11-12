
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    if (hasGetUserMedia()) {
        console.log("getUserMedia can get!");
    } else {
        alert("getUserMedia() is not supported by your browser");
    }

});


//Test if your browser has access to the cameta and audio media input
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
//HTML elements
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

//PeertoPeer
const configuration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ],
    iceCandidatePoolSize: 10
}

//configuration.iceServers[0].urls

const peerConnection = new RTCPeerConnection(configuration);

//streams
let localStream = null;
let remoteStream = null;

localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }) 
//empty
remoteStream = new MediaStream();

localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
});

peerConnection.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
    })
}
webcamVideo.srcObject = localStream;
remoteVideo.srcObject = remoteStream;









//Global State










// const constraints = {video : true};
// function successCallback(stream) {
//     const video = document.querySelector("video");
//     console.log(video);
//     video.src = window.URL.createObjectURL(stream);
// }
// function errorCallback(error) {
//     console.log("navigator.getUserMedia error: ", error);
// }
// navigator.getUserMedia(constraints, successCallback, errorCallback);