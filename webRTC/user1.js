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
const dataChannel = peerConnection.createDataChannel('channel1');

async function makeCall() {
  
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
 makeCall();