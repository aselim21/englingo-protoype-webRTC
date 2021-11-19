const serverURL_rooms = 'https://webrtc-englingo.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');

// const serverURL_rooms = 'http://localhost:3000';
const the_match_id = window.location.pathname.slice(6);
const the_userId = window.localStorage.userId;
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration);
peerConnection.onconnectionstatechange = function(event) {
    console.log('State changed ' + peerConnection.connectionState);
}
let dataChannel;
let im_user_1 = false;
let im_user_2 = false;
const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});
localVideo.addEventListener('loadedmetadata', function() {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
  });
  
  remoteVideo.addEventListener('loadedmetadata', function() {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
  });





//1. First start media sharing!
// //HTML elements
async function startMediaSharing() {
    console.log("startMediaSharing")
    //HTML elements
   
    const constraints = { audio: false, video: true };
    //streams
    let localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    // let remoteStream = new MediaStream();

    
    peerConnection.ontrack = function({ streams: [stream] }) {
        console.log('remote tracks received!')
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
   };

    // peerConnection.ontrack = function (event) {
    //     event.streams[0].getTracks().forEach(track => {
    //         remoteStream.addTrack(track);
    //     })
    // }
    // remoteVideo.srcObject = remoteStream;
}
startMediaSharing();


//2. Get the information about the match
async function getMyMatchInfo() {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        //mode: 'no-cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //     'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
        headers: headers,
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}
async function connectThePeers() {
   
        const matchInfo = await getMyMatchInfo()

        if (the_userId == matchInfo.user1_id) im_user_1 = true;
        if (the_userId == matchInfo.user2_id) im_user_2 = true;
        let user1_offer = matchInfo.user1_offer;
        let user2_answer = matchInfo.user2_answer;
        let connection_completed = matchInfo.connection_completed;


        if (im_user_1 == true && user1_offer == null && connection_completed == false) {
 
            const offer = await createOffer_user1(updateMatchInfo);
            // const data = {
            //     user1_offer: offer
            // }
            // user1_offer = offer;


        } else if (im_user_2 == true && user1_offer != null && user2_answer == null && connection_completed == false) {

 
            const answer = await createAnswerAndConnect_user2(user1_offer ,updateMatchInfo);
            return 0;
            
            // const data = {
            //     user2_answer: answer
            // }
            // user2_answer = answer;
            // const result = await updateMatchInfo(data);
            
     

        } else if (im_user_1 == true && user2_answer != null && connection_completed == false) {
            
            await connectToPeer_user1(user2_answer);
            const data = {
                connection_completed: true
            }
            connection_completed = true;
     
            const result = await updateMatchInfo(data);
           
        }
        if (connection_completed == true) {
            deleteMatchInfo();
            return 0;
        }else {
            await connectThePeers();
        }
}
 await connectThePeers();

 


async function createOffer_user1(callback) {
    dataChannel = peerConnection.createDataChannel('channel1');
    // peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription))
 
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate",peerConnection.localDescription);
            callback({user1_offer: peerConnection.localDescription});
        }
    };
    const offer = await peerConnection.createOffer();
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
    // peerConnection.onicecandidate = e => console.log('New ICE candidate! reprinting SDP' + JSON.stringify(peerConnection.localDescription));
    // peerConnection.onicecandidate = (event) => {
    //     if (!peerConnection || !event || !event.candidate) return;
    //     var candidate = event.candidate;
    //     // POST-ICE-to-other-Peer(candidate.candidate, candidate.sdpMLineIndex);
    // }
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        if (e.candidate == null) {
            console.log("ice candidate",peerConnection.localDescription);
            callback({user2_answer: peerConnection.localDescription});
        }
    };
    const remoteDesc = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(remoteDesc);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}
//1. PUT offer user1


//3. PUT answer user2


//4. GET answer user1


async function updateMatchInfo(data) {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        //mode: 'no-cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //     'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
        headers: headers,
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
};

async function deleteMatchInfo() {
    const response = await fetch(`${serverURL_rooms}/match/${the_match_id}`, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        //mode: 'no-cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //     'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
        headers: headers,
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
};