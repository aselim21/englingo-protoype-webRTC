const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Offer = new Schema({
    type:String,
    sdp:String
});

const room_schema = new Schema({
    userId : String,
    topic: String,
    offer : Offer
},{timestamps:true});



const Room = mongoose.model('Room', room_schema);
module.exports = Room;