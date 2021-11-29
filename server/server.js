const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.static("src"));
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const corsWhitelist = [
    'https://webrtc-englingo.herokuapp.com',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials,Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
  next();
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~RESTful Service - Methods~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/', (req, res) => {
  res.send("Go to Home");
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'index.html'));

});
app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'room.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'room.html'));
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~Matches~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/match', (req, res) => {
  const the_topic = req.body.topic;
  const the_user_id = req.body.userId;
  Queues.getQueue(the_topic).addParticipant({
    user_id: req.body.userId
  });
  const match_offer = Matches.getMyMatch(the_user_id);
  res.status(200).send(JSON.stringify(match_offer));
});

app.get('/match/:matchId', (req, res) => {
  console.log('reading match info')
  const matchId = req.params.matchId;
  const the_match = Matches.getMatchInfo(matchId);
  console.log(the_match)
  res.status(200).send(JSON.stringify(the_match));
});

app.post('/match', (req, res) => {

  const the_topic = req.body.topic;
  const the_user_id = req.body.userId;
  Queues.getQueue(the_topic).addParticipant({
    user_id: req.body.userId
  });
  const the_match_id = Matches.findMyMatchID(the_user_id);
  res.status(200).send(JSON.stringify(the_match_id));
});

app.put('/match/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  let result;
  console.log(req.body)
  if (req.body.user1_offer) {
    console.log("Its offer");
    result = Matches.updateMatchOffer(matchId, req.body);
  } else if (req.body.user2_answer) {
    console.log("Its answer");
    result = Matches.updateMatchAnswer(matchId, req.body)
  } else if (req.body.connection_completed) {
    console.log("Its completed");
    result = Matches.updateConnectionCompleted(matchId, req.body)
  }
  res.status(200).send(JSON.stringify(result));
});

app.delete('/match/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  Matches.deleteMatch(matchId);
  res.status(200).send({});
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~Queue for a topic~~~~~~~~~~~~~~~~~~~~~~~~~~
const Queue = {
  topic: '',
  participants: [],
  addParticipant: function (new_participant) {
    const index = this.participants.findIndex((e) => e.user_id == new_participant.user_id);
    const userExists = Matches.userAlreadyMatched(new_participant.user_id);
    if (index > -1 || userExists) {
      return -1;
    } else {
      this.participants.push(new_participant);
      return 0;
    }
  },
  removeParticipant: function (the_user_id) {
    const index = this.participants.findIndex((e) => e.user_id == the_user_id);
    if (index > -1) {
      this.participants.splice(index, 1);
      return 0;
    }
    return -1;
  },
  print: function () {
    console.log("-------------------QUEUE-------------------")
    console.log(JSON.stringify(this));
  }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~Queues for different topics~~~~~~~~~~~~~~~~~~~~~~~~~~
const Queues = {
  elements: [],
  addQueue: function (new_queue) {
    this.elements.push(new_queue);
  },
  getQueue: function (the_topic) {
    if (this.elements.length > -1) return this.elements.find(e => e.topic == the_topic);
    else return -1;
  },
  print: function () {
    console.log("-------------------QUEUES-------------------")
    console.log(JSON.stringify(this));
  }
}

//Define only 1 Topic
const topic1Queue = Object.create(Queue);
topic1Queue.topic = "Topic1";
topic1Queue.participants = [];
Queues.addQueue(topic1Queue);


//~~~~~~~~~~~~~~~~~~~~~~~~~~Matches~~~~~~~~~~~~~~~~~~~~~~~~~~
const Matches = {
  elements: [],
  generateMatches: function (the_topic) {
    console.log(Queues.getQueue(the_topic))
    if (Queues.getQueue(the_topic).participants.length == 1) {
      return -1;
    }
    else {
      while (Queues.getQueue(the_topic).participants[1]) {
        const participant1 = Queues.getQueue(the_topic).participants[0];
        const participant2 = Queues.getQueue(the_topic).participants[1];
        const new_match = {
          match_id: uuidv4(),
          topic: the_topic,
          user1_id: participant1.user_id,
          user1_offer: null,
          user2_id: participant2.user_id,
          user2_answer: null,
          connection_completed: false
        }
        console.log(new_match);
        this.elements.push(new_match);
        Queues.getQueue(the_topic).removeParticipant(participant1.user_id);
        Queues.getQueue(the_topic).removeParticipant(participant2.user_id);
      }
    }
  },
  findMyMatchID: function (the_user_id) {
    console.log("find match ID for user " + the_user_id);
    const index = this.elements.findIndex((m) => m.user1_id == the_user_id || m.user2_id == the_user_id);
    if (index > -1) {
      return this.elements[index].match_id;
    } else return 'no match';
  },
  getMatchInfo: function (the_match_id) {
    const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    if (index > -1) {
      return this.elements[index];
    }
    return -1;
  },
  updateMatchOffer: function (the_match_id, data) {
    const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    console.log(this.elements[index]);
    if (index > -1) {
      this.elements[index].user1_offer = data.user1_offer;
      console.log(this.elements[index])
      return this.elements[index];
    }
    return -1;
  },
  updateMatchAnswer: function (the_match_id, data) {
    console.log('updating match answer')
    const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    if (index > -1) {
      this.elements[index].user2_answer = data.user2_answer;
      console.log(this.elements[index]);
      return this.elements[index];
    }
    return -1;
  },
  updateConnectionCompleted: function (the_match_id, data) {
    const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    console.log(this.elements[index]);
    if (index > -1) {
      this.elements[index].connection_completed = data.connection_completed;
      console.log(this.elements[index]);
      return this.elements[index];
    }
    return -1;
  },
  deleteMatch: function (the_match_id) {
    const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    if (index > -1) {
      const the_match = this.elements[index];
      this.elements.splice(index, 1);
      return the_match;
    }
    return -1;
  },
  userAlreadyMatched: function (the_user_id) {
    const index = this.elements.findIndex((m) => m.user1_id == the_user_id || m.user2_id == the_user_id);
    if (index > -1) {
      return true;
    } else return false;
  },
  print: function () {
    console.log("-------------------MATCHES-------------------");
    console.log(JSON.stringify(this));
  }
};

//Constantly generate Matches for a topic
function constantlyGenerateMatches(the_topic) {
  setTimeout(function () {
    Matches.generateMatches(the_topic);
    constantlyGenerateMatches(the_topic);
  }, 5000);
}
//Start generation Matches for Topic 1
constantlyGenerateMatches('Topic1');

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

