
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


//HTML elements
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
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


//-------------https://w3c.github.io/webrtc-pc/#simple-peer-to-peer-example------

const constraints = { audio: false, video: true };
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

peerConnection.ontrack = ({ track, streams }) => {
    // once media for a remote track arrives, show it in the remote video element
    track.onunmute = () => {
        // don't set srcObject again if it is already set.
        if (remoteVideo.srcObject) return;
        remoteVideo.srcObject = streams[0];
    };
};

// call start() to initiate
function start() {
    addCameraMic();
}

// add camera and microphone to connection
async function addCameraMic() {
    try {
        // get a local stream, show it in a self-view and add it to be sent
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        for (const track of stream.getTracks()) {
            peerConnection.addTrack(track, stream);
        }
        webcamVideo.srcObject = stream;
    } catch (err) {
        console.error(err);
    }
}


//-----------------https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack------------------------------


async function openCall() {
    const gumStream = await navigator.mediaDevices.getUserMedia(
        { video: true, audio: true });
    for (const track of gumStream.getTracks()) {
        peerConnection.addTrack(track);
    }
}

//-
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
let inboundStream = null;

peerConnection.ontrack = ev => {
    if (ev.streams && ev.streams[0]) {
        remoteVideo.srcObject = ev.streams[0];
    } else {
        if (!inboundStream) {
            inboundStream = new MediaStream();
            remoteVideo.srcObject = inboundStream;
        }
        inboundStream.addTrack(ev.track);
    }
}


//-------------https://www.youtube.com/watch?v=WmR9IMUD_CY&ab_channel=Fireship------------
async function start(){
    //HTML elements
    const webcamVideo = document.getElementById('webcamVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    //streams
    let localStream = null;
    let remoteStream = null;

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    webcamVideo.srcObject = localStream;
    //empty
    remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
        console.log('tracks sent')
        peerConnection.addTrack(track, localStream);
    });

    //peerConnection.ontrack = function(event){
    peerConnection.addEventListener('track', function(event) {
        remoteVideo.srcObject = event.streams[0];
        // console.log("got track");
        // event.streams[0].getTracks().forEach(track => {
        //     remoteStream.addTrack(track);
        // })
    })
   
    // remoteVideo.srcObject = remoteStream;
}

//--------------https://webrtc.github.io/samples/src/content/peerconnection/pc1/-----

//HTML elements
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
//streams
let localStream;
let remoteStream;

async function start() {
    console.log('Requesting local stream');
    // startButton.disabled = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      console.log('Received local stream');
      localVideo.srcObject = stream;
      localStream = stream;
    //   callButton.disabled = false;
    } catch (e) {
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  async function call() {
    // callButton.disabled = true;
    // hangupButton.disabled = false;
    console.log('Starting call');
    // startTime = window.performance.now();
    // const videoTracks = localStream.getVideoTracks();
    // const audioTracks = localStream.getAudioTracks();
    // if (videoTracks.length > 0) {
    //   console.log(`Using video device: ${videoTracks[0].label}`);
    // }
    // if (audioTracks.length > 0) {
    //   console.log(`Using audio device: ${audioTracks[0].label}`);
    // }
    
    peerConnection.addEventListener('track', gotRemoteStream);
  
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    console.log('Added local stream to pc1');
  
  }

  function gotRemoteStream(e) {
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
      console.log('pc2 received remote stream');
    }
  }
  start();
  call()
//----------------------- https://github.com/pion/webrtc/issues/560
// YOU CANNOT SHARE YOUR LOCAL DESCRIPTION BEFORE YOU ADD TRACK :O fucking saved life <3 






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