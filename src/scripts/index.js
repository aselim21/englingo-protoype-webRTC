
const serverURL_rooms = 'http://localhost:3000'
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

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
    room1.addEventListener("click", (e) => {
        const the_userId = window.localStorage.userId;
        createAnOffer().then(the_offer =>{
            const data = {
                userId : the_userId,
                topic : e.srcElement.getAttribute('topic'),
                offer : the_offer
            }
            createRoom(JSON.stringify(data));
            console.log(JSON.stringify(data));
         
        })
        
    });

});

function createRoom(data) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${serverURL_rooms}/room`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Request finished.");
            // Request finished. Do processing here.
        }
    }
    xhr.send(data);   
}

async function createAnOffer(){
    const peerConn = new RTCPeerConnection()
    const dataChann = peerConn.createDataChannel("channel");
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
