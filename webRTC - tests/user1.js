//---user 1----
const peerConnection = new RTCPeerConnection();
const dataChannel = peerConnection.createDataChannel('channel');

dataChannel.onmessage = e => console.log('Got a message: '+ e.data);

dataChannel.onopen = e => console.log('Connection opened');

peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription));

peerConnection.createOffer().then(o => peerConnection.setLocalDescription(o)).then(r => console.log('set succesfully'));

const answer = {}
peerConnection.setRemoteDescription(answer)

//---------------------------------webrtc.org
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);
let dataChannel;

async function makeCall() {
    dataChannel = peerConnection.createDataChannel('channel1');
    peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription))
    dataChannel.onmessage = e => console.log('Got a message: '+ e.data);
    dataChannel.onopen = e => console.log('Connection opened');

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
}
async function connectToPeer(answer){
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}



// ----------https://w3c.github.io/webrtc-pc/#simple-peer-to-peer-example-------------------

// //HTML elements
const webcamVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
const constraints = {audio: false, video: true};

peerConnection.ontrack = ({track, streams}) => {
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




  //----------------------user1 and 2------------------------
  const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
  const peerConnection = new RTCPeerConnection(configuration);
  let dataChannel;
  
  async function createOffer_user1() {
    console.log("creating an offer");
    dataChannel = peerConnection.createDataChannel('channel1');
    peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription))
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
}
async function connectToPeer_user1(answer) {
    console.log("connceting to answer");
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}
async function createAnswerAndConnect_user2(offer) {
  console.log("createAnswerAndConnect_user2");
    peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;
        dataChannel.onopen = e => console.log('Connection opened');
        dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    });
    peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription));
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}
async function startMediaSharing() {

  const mediaConstraints = { audio: true, video: true };

  let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  let remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
      console.log("tracks sent");
      peerConnection.addTrack(track, localStream);
  });
  localVideo.srcObject = localStream;

  peerConnection.ontrack = function (event) {
      console.log('track received');
      event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
      })
      remoteVideo.srcObject = remoteStream;
  }
}
await startMediaSharing();

//-------dafeult
async function startMediaSharing() {
  //HTML elements
  const localVideo = document.getElementById('webcamVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const constraints = { audio: false, video: true };
  //streams
  let localStream = await navigator.mediaDevices.getUserMedia(constraints);
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
  });

  let remoteStream = new MediaStream();
  peerConnection.ontrack = function (event) {
      event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
      })
  }
  remoteVideo.srcObject = remoteStream;
}
startMediaSharing();