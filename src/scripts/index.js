// const serverURL_rooms = 'http://localhost:3000';
const serverURL_rooms = 'https://webrtc-englingo.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');

//Listen to the Button for Topic 1
const topic1_btn = document.getElementById('js-topic1-button');
topic1_btn.addEventListener("click", async (e) => {
    const the_userId = window.localStorage.userId;
    const data = {
        userId: the_userId,
        topic: e.srcElement.getAttribute('topic'),
    }
    getYourMatchID(data);
});

//Keep asking for a match; If there is one, then open the room
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

//Requests
async function createMatch_request(data) {
    const response = await fetch(`${serverURL_rooms}/match`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    return response.json();
}



