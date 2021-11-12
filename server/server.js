const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const MongodbURI = "mongodb+srv://englingo_admin:admin1234@cluster0.hgtlr.mongodb.net/englingo_rooms?retryWrites=true&w=majority"
const Room = require('./models/room_model.js');
app.use(express.json());
app.use(express.static("src"));
// app.use(express.static("node_modules"));
const { v4: uuidv4 } = require("uuid");
const { match } = require('assert');
const PORT = process.env.PORT || 3000;
const server = require('http').Server(app); //for socket IO
//creates a socket io based on our server
//The server is for setting the rooms; if you shut down the server, the videos are still going to be transmitted

//-------------------------------------Web server
app.get('/', (req, res) => {
    res.send("Go to Home");
});

app.get('/home', (req, res)=>{
  res.sendFile(path.join(__dirname, '../src', 'index.html'));
    //res.redirect(`/room/${uuidv4()}`);
});

app.get('/room/:roomId', (req,res)=>{
  const roomId = req.params.roomId;
  console.log(roomId);
  res.status(200).send(roomId);
});

// --------------------------------------Server 2
app.post('/room', (req,res)=>{
//   const data = {
//     userId : the_userId,
//     topic : e.srcElement.getAttribute('topic'),
//     offer : the_offer
// }
//1. add the Participant to the queue
Queues.getQueue(req.body.topic).addParticipant({
  user_id : req.body.userId,
  offer : req.body.offer
});
Queues.getQueue(req.body.topic).print()
//2. Match him and send him a foreign offer


 // queue.push(req.body);
  //console.log(req.body);
//   const new_candidate = new Room(req.body)
//   new_candidate.save().then((result) => {
//     console.log("New Room was saved.", result);
//   }).catch(err => {
//     console.error("Error saving the New room", err);

// })
  res.status(200).send();

});

// -------------Queues---------------
const Queue = {
  topic : '',
  participants : [],
  addParticipant : function (new_participant) {
    this.participants.push(new_participant);
    return 0;
  },
  removeParticipant : function (the_user_id){
    const index = this.participants.findIndex((e)=> e.user_id == the_user_id);
    if (index > -1) {
      this.participants.splice(index, 1);
      return 0;
    }
    return -1;
  },
  print : function(){
    console.log(JSON.stringify(this));
  }
};
const Queues = {
  elements : [],
  addQueue : function (new_queue){
    this.elements.push(new_queue);
  },
  getQueue : function (the_topic){
    if(!!this.elements.length) return this.elements.find(e => e.topic == the_topic);
    else return -1;
  },
  print : function(){
    console.log(JSON.stringify(this));
  }
}

const topic1Queue = Object.create(Queue);
//du musst alle Attribute defiinieren, wenn du sie bei einem getQueue auch bekommen wills
topic1Queue.topic = "Topic1";
topic1Queue.participants = [];
const topic2Queue = Object.create(Queue);
topic2Queue.topic = "Topic2";
topic2Queue.participants = [];


Queues.addQueue(topic1Queue);
Queues.addQueue(topic2Queue);


//------------End Queues------------

Queues.getQueue('Topic1').addParticipant({
  user_id : "user1",
  offer : {
    type : "offer",
    sdp : "sdasdasdasdewgregregh"
  } 
});
Queues.getQueue('Topic1').addParticipant({
  user_id : "user2",
  offer : {
    type : "offer",
    sdp : "sdasdasdasdewgregregh"
  } 
});
Queues.getQueue('Topic1').addParticipant({
  user_id : "user3",
  offer : {
    type : "offer",
    sdp : "sdasdasdasdewgregregh"
  } 
});
Queues.getQueue('Topic1').print()

//---------------Mathcing - ---------------
const Matches = {
  elements : [], //Macth elements
  generateMatch : function(the_topic, the_user_id){
    if(Queues.getQueue(the_topic).participants.length == 1){
      return -1;
    }else{

    }
  },
  findMatch: function(user_id){
    //chech in already generated
    //

  }


  // let i = 0;
  // for(i = 0 ; i < Queues.getQueue(the_topic).participants.length; i+2){
  //   const new_match = {
  //     user1_id : Queues.getQueue(the_topic).participants[i].user_id
  //   }
  //   Object.create(Match);
  //   new_match.user1_id = Queues.getQueue(the_topic).participants[i].user_id;
  //   new_match.user1_offer = Queues.getQueue(the_topic).participants[i].offer;
  //   new_match.user2_id = Queues.getQueue(the_topic).participants[i+1].user_id;
  //   new_match.user2_offer = Queues.getQueue(the_topic).participants[i+1].offer;
  //   new_match.topic = Queues.getQueue(the_topic).participants[i].user_id;
  // }  
  // for(i in Queues.getQueue(the_topic).participants.length-1){

      
  //   }

  //   const index1 = getRandomInt(Queues.getQueue(the_topic).participants.length);
  //   console.log(index1);
  //   const user1 = Queues.getQueue(the_topic).participants[index1];
  //   const index2 = getRandomInt(Queues.getQueue(the_topic).participants.length);
  //   console.log(index2);
  //   const user2 = Queues.getQueue(the_topic).participants[index1];     
  // }
};
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
Matches.generateMatch('Topic1');

//console.log(getRandomInt(3));
// expected output: 0, 1 or 2

//topic
//user_1
//user_1_offer
//user_2
//user_2_offer


const Match = {
  user1_id : '',
  user1_offer : '',
  user2_id : '',
  user2_offer : '',
  topic : '',
}
// function matchInTopic(the_topic, user_1){
//   const the_queue = Queues.getQueue(the_topic);
//   the_queue.participants.get
// }









// console.log(Queues.elements[0].addParticipant({
//   user_id : "user1",
//   offer : {
//     type : "offer",
//     sdp : "sdasdasdasdewgregregh"
//   } 
// }));

// console.log(Queues.getQueue('Topic1').addParticipant({
//   user_id : "user2",
//   offer : {
//     type : "offer",
//     sdp : "kgahahahah"
//   } 
// }));
// console.log(Queues.elements);
// Queues.print();
// Queues.getQueue('Topic1').print()


//------------------------------------------------------
// const topics = [];
// function Queue() {
//   this.elements = [];
// }

// Queue.prototype.enqueue = function (new_element){
//   this.elements.push(new_element);
// }
// Queue.elements.enqueue('Test');
// console.log(Queue.prototype);
// console.log(Queue.elements);

// function addTopic(new_topic){
//   topics.push(new_topic);
  
// }

// function searchQueue(the_topic){
//   const index = queue.findIndex((element) => element.topic == the_topic);

// }

// function matchFromQueue(the_topic){
  
// }

// io.on('connection', (socket) => { 
//   console.log("socket is connected");
//   socket.emit('message', "This is test message from the server socket - emit");
  
// });

//SOCKET
// io.on('connection', (socket) => {

//   socket.on('join', (roomID) => {

//     const roomClients = io.sockets.adapter.rooms[roomId] || {length: 0};
//     const numberOfCleints = roomClients.length;

//     if(numberOfClients == 0){
//       console.log(`Creating room ${roomID}`);
//       socket.join(roomID);
//       //издавам, пускам в обръщение
//       socket.emit('room_created', roomID);
//     }
//   })
// })\
//SERVER START, not the APP
// server.listen(port, () => {
//   console.log(`Express server listening on port ${port}`);
// });

//connect with DB and start the server
mongoose.connect(MongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    }))
    .catch(err => {
      console.error(err);
        res.status(400).json("Error: " + err)
    });