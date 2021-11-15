//user2
const offer = {};

const peerConnection = new RTCPeerConnection();

peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription));

peerConnection.ondatachannel = e => {
    peerConnection.dataChannel = e.channel;
    peerConnection.dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    peerConnection.dataChannel.onopen = e => console.log('Connection opened!');
}

peerConnection.setRemoteDescription(offer).then(r => console.log('Remote description set!'));

peerConnection.createAnswer().then(a => peerConnection.setRemoteDescription(a)).then(a => console.log('Local description set!'));

//---------------------------------webrtc.org

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);
let dataChannel;
peerConnection.addEventListener('datachannel', event => {
    dataChannel = event.channel;
    dataChannel.onopen = e => console.log('Connection opened');
    dataChannel.onmessage = e => console.log('Got a message: '+ e.data);
});
async function connectToPeer(offer) {
    peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription));
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}
