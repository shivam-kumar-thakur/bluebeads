import mongoose from "mongoose";

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

const bloodBankSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    location:LocationSchema,
    contact:{
        type:Number
    }
})

export const bloodBank=mongoose.model("bloodBank",bloodBankSchema)