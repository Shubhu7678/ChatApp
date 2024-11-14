import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    senderId: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId
    },
    receiverId: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId
    },
    content: {
        type: String,
        required: true,
        trim: true
    },

},
    {
        timestamps: true
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;

