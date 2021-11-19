
// const serverURL_rooms = 'http://localhost:3000';
const serverURL_rooms = 'https://webrtc-englingo.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
});

const topic1_btn = document.getElementById('js-topic1-button');
topic1_btn.addEventListener("click", async (e) => {
    const the_userId = window.localStorage.userId;
    const data = {
        userId: the_userId,
        topic: e.srcElement.getAttribute('topic'),
    }
    getYourMatchID(data);
});

async function getYourMatchID(data) {
    let match_id;
    match_id = await createMatch_request(data);
    if (match_id == 'no match') {
        console.log('Match ID: ' + match_id)
        setTimeout(async function () {
            await getYourMatchID(data);
        }, 5000)
    } else {
        window.location.replace(`/room/${match_id}`);
    }
}


function connect() {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addEventListener('datachannel', event => {
        const dataChannel = event.channel;
    });

}
async function createMatch_request(data) {
    // console.log("----------Creating a room-----------------");

    const response = await fetch(`${serverURL_rooms}/match`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'no-cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: headers,
        // headers: {
        //     'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
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
        headers: headers,
        // headers: {
        //     'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
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
