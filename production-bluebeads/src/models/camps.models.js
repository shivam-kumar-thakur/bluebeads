import mongoose from "mongoose";

const donorRegisterSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming "User" is the model name for donors
        required: true
    },

    bloodType: {
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    status: {
        type: Number,
        //"given", "not_given" as 1,0
        enum: [1,0],
        default: 0
    }
});

const volunterRegisterSchema=new mongoose.Schema({
    // secondary details userid i need
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserId",
        required:true
    },
    approvalStatus:{
        //ok =1, waiting=0, decline=2
        type:Number,
        enum:[1,0,2],
        default:0
    }
})


const campLocationSchema = new mongoose.Schema({
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

const campSchema = new mongoose.Schema({
    campName: {
        type: String,
        required: true,
        trim: true
    },
    ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ngo", // Assuming "Ngo" is the model name for NGOs
        required: true
    },
    campDescription: {
        type: String,
        default: null
    },
    donationStartDate:{
        type:Date,
        required:true
    },
    donationEndDate:{
        type:Date,
        required:true
    },
    donationStartTime:{
        type:Number,
        required:true,
        max:23,
        min:0
    },
    donationsEndTime:{
        type:Number,
        required:true,
        max:23,
        min:0
    },
    donorsRegister: [donorRegisterSchema],
    volunteersRegister: [volunterRegisterSchema],
    location: campLocationSchema
}, { timestamps: true });

export const CampDetails = mongoose.model("CampDetails", campSchema);
