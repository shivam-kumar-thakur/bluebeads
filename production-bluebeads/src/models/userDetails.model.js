import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const requestCurrentSchema = new mongoose.Schema({
    needy_person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserDetails",
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    }
});

const readyToDonateSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserDetails",
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    }
});

const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true
    },
    country: String,
    state: String,
    postalCode: String
});

const donationsSchema=new mongoose.Schema({
    campId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"campId"
    },
    requestStatus:{
        type:Number,
        enum:[0,1], // 0=register, 1=donated
        default:0
    }
})

const volunterExperience=new mongoose.Schema({
    campId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"campId"
    },
    requestStatus:{
        type:Number,
        enum:[0,1,2], // 0=pending, 1=approved,2=decline
        default:1
    }
})

const requestSchema=new mongoose.Schema({
    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"requestId"
    },
    requestStatus:{
        type:Number,
        //1=open, 0=closedByUser, 2=Automatoicaly closed no donor found
        enum:[1,0,2],
        required:true,
        default:1
    }
})

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        index: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"]
    },
    dob:{
        type:Date,
        require:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    location: {
        type: locationSchema,
        required: true
    },
    contactList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
    }],
    priorityList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Priority"
    }],
    signup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignupDetails"
    },
    donations: [donationsSchema],
    volunteerExperience: [volunterExperience],
    //implemented with a seperate database fro request history and current.
    requests: [{
       type: requestSchema,
       required: false
    }],
    readyToDonate: [{
        type: readyToDonateSchema,
        required: false
    }],
    lastdonation:{
        type:Date
    }
}, { timestamps: true });

// Indexes
userSchema.index({ bloodGroup: 1 });
userSchema.index({ 'location.state': 1, 'location.postalCode': 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

export const UserDetails = mongoose.model("UserDetails", userSchema);
