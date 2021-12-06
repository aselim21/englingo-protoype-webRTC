// const serverURL_rooms = 'http://localhost:3000';
const serverURL_rooms = 'https://webrtc-englingo.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
const the_match_id = window.location.pathname.slice(6);
const the_userId = window.localStorage.userId;
const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
peerConnection.onconnectionstatechange = function (event) {
    console.log('State changed ' + peerConnection.connectionState);
}

setTimeout(() => {
    if (peerConnection.connectionState != 'connected') {
    alert("Your match left.");
        deleteMatchInfo();
        closeVideoCall();
    }
    // 10 seconds
}, 10000);

// setTimeout(() => {
//     closeVideoCall();
//     //1minute
// }, 36000);



let dataChannel;
let im_user_1 = false;
let im_user_2 = false;
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

//Event-Listeners for the videos
localVideo.addEventListener('loadedmetadata', function () {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function () {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});


//1. First start sharing media

async function startMediaSharing() {

    const mediaConstraints_toSend = { audio: true, video: true };
    const mediaConstraints_toDisplay = { audio: false, video: true };

    let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints_toSend);
    let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
    let remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
        console.log("tracks sent");
        peerConnection.addTrack(track, localStream);
    });
    localVideo.srcObject = localStream_toDisplay;

    peerConnection.ontrack = function (event) {
        console.log('track received');
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        })
        remoteVideo.srcObject = remoteStream;
    }
}
await startMediaSharing();


//Main Function to connect the peers
async function connectThePeers() {
    const matchInfo = await getMyMatchInfo();

    if (the_userId == matchInfo.user1_id) im_user_1 = true;
    if (the_userId == matchInfo.user2_id) im_user_2 = true;
    let user1_offer = matchInfo.user1_offer;
    let user2_answer = matchInfo.user2_answer;
    let connection_completed = matchInfo.connection_completed;

    if (peerConnection == null) { return -1 };
    if (im_user_1 == true && user1_offer == null && connection_completed == false) {
        //User 1 - creates an offer
        await createOffer_user1(updateMatchInfo);

    } else if (im_user_2 == true && user1_offer != null && user2_answer == null && connection_completed == false) {
        //User2 - receives the offer and creates an answer
        await createAnswerAndConnect_user2(user1_offer, updateMatchInfo);
        return 0;

    } else if (im_user_1 == true && user2_answer != null && connection_completed == false) {
        //User1 - receives the answer and users are connected
        await connectToPeer_user1(user2_answer);
        const data = {
            connection_completed: true
        }
        connection_completed = true;
        await updateMatchInfo(data);
    }

    if (connection_completed == true) {
        //When users are connected, delete this match
        deleteMatchInfo();
        return 0;
    } else {
        await connectThePeers();
    }
}
await connectThePeers();



//WebRTC Functions
async function createOffer_user1(callback) {
    dataChannel = peerConnection.createDataChannel('channel1');
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate", peerConnection.localDescription);
            callback({ user1_offer: peerConnection.localDescription });
        }
    };
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    return offer;
}

async function connectToPeer_user1(answer) {
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}

async function createAnswerAndConnect_user2(offer, callback) {
    peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;
        dataChannel.onopen = e => console.log('Connection opened');
        dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    });
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate", peerConnection.localDescription);
            callback({ user2_answer: peerConnection.localDescription });
        }
    };
    const remoteDesc = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(remoteDesc);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}

//Requests
async function getMyMatchInfo() {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'GET',
        headers: headers,
    });
    return response.json();
}
async function updateMatchInfo(data) {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
    });
    return response.json();
};

async function deleteMatchInfo() {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'DELETE',
        headers: headers,
    });
    return response.json();
};


function closeVideoCall() {
    console.log('++++++video closed');

    if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onremovetrack = null;
        peerConnection.onremovestream = null;
        peerConnection.onicecandidate = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onsignalingstatechange = null;
        peerConnection.onicegatheringstatechange = null;
        peerConnection.onnegotiationneeded = null;

        if (remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        alert('Call ended.');
        peerConnection.close();
        peerConnection = null;
    }
}