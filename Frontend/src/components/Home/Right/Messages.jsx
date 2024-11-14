import React, { useEffect, useRef, useState } from 'react'
import Message from './Message'
import { useSelector } from 'react-redux';
import GetSocketMessage from '../../../Context/GetSocketMessage';



const Messages = () => {

  const [loading, setLoading] = useState(false);
  const { selectedConversation, messages } = useSelector((state) => state.message);

  GetSocketMessage();
  // console.log(messages.messages);
 
  const newMessageRef = useRef();

  useEffect(() => {

    if (newMessageRef.current) { 

      newMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [selectedConversation, messages])

  return (
    <div className="p-4 h-[calc(100vh-10rem)] overflow-y-auto">
      {
        loading ? (<div></div>) : (
          <>
            {
              messages?.map((message, index) => (
                <Message ref={index === messages.length - 1 ? newMessageRef : null} key={index} message={message} />
              ))
            }
          </>
        )
      }
    </div>
  )
}

export default Messages