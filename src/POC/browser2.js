const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
let dataChannel;
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

async function createAnswerAndConnect_user2(offer) {
    peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;
        dataChannel.onopen = e => console.log('Connection opened');
        dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    });
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate", peerConnection.localDescription);
        }
    };
    const remoteDesc = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(remoteDesc);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log(JSON.stringify(answer));
    return answer;
}