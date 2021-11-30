const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
let dataChannel;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

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
//await startMediaSharing();

async function createOffer_user1() {
    dataChannel = peerConnection.createDataChannel('channel1');
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate", peerConnection.localDescription);
        }
    };
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    console.log(JSON.stringify(offer));
    return offer;
}

async function connectToPeer_user1(answer) {
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}