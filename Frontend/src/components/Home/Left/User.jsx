import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedConversation, setMessages } from '../../../slices/messageSlice';
import { fetchAllChatDetails } from '../../../services/operations/conversationApi';
import { useSocketContext } from '../../../Context/SocketContext';


const User = ({ user }) => {

  const { selectedConversation, messages } = useSelector((state) => state.message);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { socket, onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);
  
  useEffect(() => {
    setIsUserSelected(user?._id === selectedConversation?._id);

    const fetchMessages = async () => {

      try {

        const receiverId = selectedConversation?._id;
        const result = await fetchAllChatDetails(receiverId, token);
        if (result) {

          dispatch(setMessages(result));
        }

      } catch (error) {

        console.log('Error in fetching messages', error);
      }
    }

    fetchMessages();

  }, [user?._id, selectedConversation?._id]);


  const handleChatUser = async () => {

    dispatch(setSelectedConversation(user));
  }

  return (

    <div
      onClick={handleChatUser}
      className={`flex gap-2 ${isUserSelected ? "bg-slate-600" : ""} hover:bg-slate-600 rounded-md p-2 cursor-pointer duration-300`}>
      <div className={`avatar ${isOnline ? "online" : ""} `}>
        <div className="w-16 rounded-full">
          <img src={user.profileImage} />
        </div>
      </div>
      <div>
        <h1 className="font-semibold">{user.firstName + " " + user.lastName}</h1>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>
    </div>

  )
}

export default User