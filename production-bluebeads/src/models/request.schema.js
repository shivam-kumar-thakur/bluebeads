import mongoose from "mongoose";

const notifiedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userId",
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
});

const acceptedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userId",
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
});


const LocationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere' // Indexing for geospatial queries
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        index: true // Indexing for state queries
    },
    postalCode: {
        type: String,
        required: true
    }
});

const requestSchema=new mongoose.Schema({
    // secondaryUserId
    raisedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userId",
        required:true
    },
    raisedType:{
        type:Number,
        //1=self,0=other
        enum:[1,0],
        required:true
    },
    bloodGroup:{
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    location:{
        type:LocationSchema,
        required: true
     },
    requestStatus:{
        type:Number,
        //1=open, 0=closedByUser, 2=Automatoicaly closed no donor found
        enum:[1,0,2],
        required:true,
        default:1
    },
    usersAcceptedRequest:[acceptedSchema],
    userNotified:[notifiedSchema]
})

export const Request=mongoose.model("Request",requestSchema)