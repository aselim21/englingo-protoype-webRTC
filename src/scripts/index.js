
const serverURL_rooms = 'http://localhost:3000'
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});

// let myVideoStream;
// const myVideo = document.createElement("video");
// myVideo.muted = true;
// navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: true,
// })
// .then((stream) => {
//     myVideoStream = stream;
//     addVideoStream(myVideo, stream);
// });
const room1 = document.getElementById("room1");
room1.addEventListener("click", async (e) => {
    const the_userId = window.localStorage.userId;
    const the_offer = await createAnOffer();
    const data = {
        userId: the_userId,
        topic: e.srcElement.getAttribute('topic'),
        offer: the_offer
    }
    getYourMatch(data);
    
})

function getYourMatch(data){
    let answer;
    setTimeout(async function () {
        console.log('-----------no matches--------')
        answer = await createRoom(data);
        console.log(answer)
        if(answer == 'no matches'){
            getYourMatch(data);
        }else{
            connect(answer);
        }
}, 3000);
}

function connect(){
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addEventListener('datachannel', event => {
    const dataChannel = event.channel;
});

}
async function createRoom(data) {
    console.log("----------Creating a room-----------------");

    const response = await fetch(`${serverURL_rooms}/room`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}




async function keepAskingForMatch(data) {
    console.log("----------Keeping asking-----------------");
    const response = await fetch(`${serverURL_rooms}/room`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}


async function createAnOffer() {
    // const peerConnection = new RTCPeerConnection(configuration);
    // const dataChannel = peerConnection.createDataChannel();
    
    const peerConn = new RTCPeerConnection();
    const dataChann = peerConn.createDataChannel();
    dataChann.onmessage = e => console.log("Got a Message: " + e.data);
    dataChann.onopen = e => console.log("Connection opened!");
    peerConn.onicecandidate = e => console.log("New Ice Candidate!"); // + JSON.stringify(peerConn.localDescription)
    const offer = await peerConn.createOffer() //then(o => peerConn.setLocalDescription(o)).then(a => console.log("Set Local Desc from the offer"));
    await peerConn.setLocalDescription(offer);
    return offer;
}

function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res
}

function renderTemplate(the_url, the_template, the_target) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", the_url);
    xhttp.send();
    xhttp.onreadystatechange = (e) => {
        fetch(the_template).then((response) => response.text()).then((template) => {
            const obj = JSON.parse(xhttp.responseText);
            const rendered = Mustache.render(template, obj);
            document.getElementById(the_target).innerHTML = rendered;
        });
    }
}

// const socket = io('http://localhost:3000');
// socket.on('message', text => {
//     console.log(text);
// })
// const addVideoStream = (video, stream) => {
//     video.srcObject = stream;
//     video.addEventListener("loadedmetadata", () => {
//        video.play();
//        videoGrid.append(video);
//     });
// };
