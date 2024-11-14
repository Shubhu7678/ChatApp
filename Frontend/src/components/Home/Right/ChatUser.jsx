import React from 'react'
import { useSelector } from 'react-redux'
import { useSocketContext } from '../../../Context/SocketContext';

const ChatUser = () => {

    const { selectedConversation } = useSelector((state) => state.message);
    const { socket, onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(selectedConversation?._id);
    
    return (
        <div>
            <div className="w-full py-2 px-4 bg-gray-900 flex gap-2">
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className="w-12 rounded-full">
                        <img src={selectedConversation?.profileImage} />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-semibold">{selectedConversation?.firstName + " " + selectedConversation?.lastName}</h1>
                    <span className="text-sm text-gray-400">{isOnline ? "Online" : "Offline"}</span>
                </div>
            </div>
        </div>
    )
}

export default ChatUser