import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
    ngo_name: {
        type: String,
        required: true
    },
    ngo_description: {
        type: String,
        default: null
    },
    camps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Camp" // Assuming "Camp" is the model name
    }],
    signup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignupDetails"
    },
    ngoHeadName:{
        type:String,
        trim:true,
        required:true
    },
    ngoHeadContact:{
        type: String,
        required:true
    },
    ngoHeadEmail:{
        type:String,
        trim:true,
        required:true
    },
    ngoHeadAddress:{
        type:String,
        trim:true,
        required:true
    },
    ngoHeadDob:{
        type:Date,
        require:true
    },
    ngoHeadGender:{
        type:String,
        required:true,
        enum:["male","female","other"]
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        country: {
            type: String
        },
        state: {
            type: String
        },
        postalCode: {
            type: String
        }
    }
}, { timestamps: true });

ngoSchema.index({ 'location.coordinates': '2dsphere' }); // Index for geospatial queries

export const NgoDetails = mongoose.model("NgoDetails", ngoSchema);
