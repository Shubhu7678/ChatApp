import React, { useEffect } from 'react'
import { useSocketContext } from './SocketContext'
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../slices/messageSlice';

const GetSocketMessage = () => {

    const { socket } = useSocketContext();
    const { messages } = useSelector((state) => state.message);
    const dispatch = useDispatch();

    useEffect(() => { 

        socket.on('messageReceived', (message) => { 

            dispatch(setMessages([...messages, message]));
        })

        return () => { 

            socket.off('messageReceived');
        }

    },[socket,messages,setMessages])
  return (
    <div></div>
  )
}

export default GetSocketMessage