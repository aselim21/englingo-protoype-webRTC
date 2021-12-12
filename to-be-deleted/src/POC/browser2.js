const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);
let dataChannel;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

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