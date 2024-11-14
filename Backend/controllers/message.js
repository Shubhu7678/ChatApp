import User from "../models/user.js";
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import { getReceiverSocketId } from "../socketIO/server.js";
import { io } from "../socketIO/server.js";

export const sendMessage = async (req, res) => {

    try {

        const { message,receiverId } = req.body;
        const senderId = req.user.id;

        if (!message || !receiverId || !senderId) {

            return res.status(404).json({

                success: false,
                message: "All fields are required",
            });
        }

        const newMessage = await Message.create({

            senderId: senderId,
            receiverId: receiverId,
            content: message,
        });

        const conversation = await Conversation.findOne({

            members: { $all: [senderId, receiverId] }
        })

        if (!conversation) {

            const newConversation = await Conversation.create(
                {
                    members: [senderId, receiverId],
                    messages: [newMessage._id],
                },

            )
        } else {

            const updateConversation = await Conversation.findOneAndUpdate(
                {
                    members: { $all: [senderId, receiverId] }
                },
                {
                    $push: {
                        messages: newMessage._id,
                    }
                },
                {
                    new: true,
                }
            )
        }

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) { 

            io.to(receiverSocketId).emit("messageReceived", newMessage);
        }

        return res.status(200).json({

            success: true,
            message: "Message sent successfully",
            data: newMessage
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error", error: error.message
        })
    }
}

export const getAllMessages = async (req, res) => {
    try {

        const { receiverId } = req.body;
        const senderId = req.user.id;

        // console.log("RECEIVER ID", receiverId);
        

        const conversation = await Conversation.findOne({

            members: { $all: [senderId, receiverId] }
        }).populate('messages');

        if (!conversation) {

            return res.status(201).json({

                success: true,
                message: "No messages found",
                data: []
            })
        }

        const messages = conversation.messages;
        return res.status(200).json({

            success: true,
            message: "Messages fetched successfully",
            data: messages
        })

    } catch (error) {

        console.log("Error in getting all messages", error.message);
        return res.status(500).json({

            success: false,
            message: "Internal Server Error",
        })
    }
}