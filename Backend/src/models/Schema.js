const mongoose = require("mongoose");

const Userschema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    joinedEvents:[{type:mongoose.Schema.Types.ObjectId,ref:'Event'}]
},
{timeStamp:true}
)

const EventSchema = new mongoose.Schema({
  name:{type:String,required:true},
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location:{type:String,required:true},
  category: { type: String, required: true },
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: { type: String }
});

const User = mongoose.model('User',Userschema);
const Event = mongoose.model("Event",EventSchema);

module.exports={
    User,
    Event
}