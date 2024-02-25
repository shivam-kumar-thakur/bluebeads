import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    priorityContacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Assuming "User" is the model name
    }],
    inContactWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Assuming "User" is the model name
    }]
}, { timestamps: true });

// Define the model for the contact list
export const ContactList = mongoose.model("ContactList", contactSchema);
