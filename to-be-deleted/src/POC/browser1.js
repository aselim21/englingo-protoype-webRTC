const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);
let dataChannel;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

async function createOffer_user1() {
    console.log("creating an offer");
    dataChannel = peerConnection.createDataChannel('channel1');
    peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription))
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');

    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    return offer;
}
async function connectToPeer_user1(answer) {
    console.log("connceting to answer");
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
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