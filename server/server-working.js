const express = require('express');
const mongoose = require('mongoose');
const app = express();
const logger = require('./logger');
app.use(express.json());
app.use(express.static("src"));
const MongodbURI = "mongodb+srv://englingo-admin:admin123@cluster0.enlfp.mongodb.net/englingo-matches?retryWrites=true&w=majority";
const Log = require('./models/log-model.js');
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const corsWhitelist = [
    'https://webrtc-englingo.herokuapp.com',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://englingo.herokuapp.com'
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
  next();
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~Matches~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/', (req, res) => {
  res.send('Welcome to Englingo-Matches Service');
});

app.get('/matches', (req, res) => {
  const matches = {matches:Matches.elements}
  res.status(200).send(matches);
});

// ~~~~~~~~~~~~~~~~~refactored~~~~~~~~~~~~~~~~~
app.get('/matches/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  const the_match = Matches.getMatchInfo(matchId);
  res.status(200).send(JSON.stringify(the_match));
});

// ~~~~~~~~~~~~~~~~~refactored~~~~~~~~~~~~~~~~~
app.get('/matches/participants/:userId', (req,res)=>{
    const user_id = req.params.userId;
    const match_id = Matches.findMyMatchID(user_id);
    res.status(200).send(JSON.stringify(match_id));
})

// ~~~~~~~~~~~~~~~~~refactored~~~~~~~~~~~~~~~~~
app.post('/participant', (req, res) => {
  const topic = req.body.topic;
  const user_id = req.body.userId;
  const result = Queues.getQueue(topic).addParticipant({
    user_id: user_id
  });
  logger.info(`POST-participant => ${JSON.stringify(req.body)}`);
  res.status(200).send();
});

app.put('/matches/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  let result;
  if (req.body.user1_offer) {
    result = Matches.updateMatchOffer(matchId, req.body);
    logger.info(`PUT-matches/${matchId}:OFFER => ${JSON.stringify(result)}`);
  } else if (req.body.user2_answer) {
    result = Matches.updateMatchAnswer(matchId, req.body);
    logger.info(`PUT-matches/${matchId}:ANSWER => ${JSON.stringify(result)}`);
  } else if (req.body.connection_completed) {
    result = Matches.updateConnectionCompleted(matchId, req.body);
    logger.info(`PUT-matches/${matchId}:COMPLETE => ${JSON.stringify(result)}`);
  }
  res.status(200).send(JSON.stringify(result));
});

app.delete('/matches/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  Matches.deleteMatch(matchId);
  logger.info(`DELETE-matches/${matchId}`);
  res.status(200).send();
});

//----------------------LOGS-------------------
//get all logs of the service
app.get('/logs', (req, res) => {
  Log.find()
      .then((result) => {
          res.send(result);
      }).catch(err => {
          res.status(400).json("Error: " + err);
          logger.error(err);
      })
})

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
    return this;
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
    return this;
  }
}

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
    if (index > -1) {
      this.elements[index].user1_offer = data.user1_offer;
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
    return this;
  }
};

//Define 1st Topic
const topic1Queue = Object.create(Queue);
topic1Queue.topic = "books";
topic1Queue.participants = [];
Queues.addQueue(topic1Queue);

//Define 2nd Topic
const topic2Queue = Object.create(Queue);
topic2Queue.topic = "family";
topic2Queue.participants = [];
Queues.addQueue(topic2Queue);

//Define 3rd Topic
const topic3Queue = Object.create(Queue);
topic3Queue.topic = "relationships";
topic3Queue.participants = [];
Queues.addQueue(topic3Queue);

//Constantly generate Matches for a topic
function constantlyGenerateMatches(the_topic) {
  setTimeout(function () {
    Matches.generateMatches(the_topic);
    constantlyGenerateMatches(the_topic);
  }, 1000);
}
//Start generation Matches for Topic 1
constantlyGenerateMatches('books');
constantlyGenerateMatches('family');
constantlyGenerateMatches('relationships');

//connect with DB and start the server
mongoose.connect(MongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(PORT, () => {
        logger.info(`Listening on port ${PORT}...`);
    }))
    .catch(err => {
        logger.error(err);
        res.status(400).json("Error: " + err)
    });