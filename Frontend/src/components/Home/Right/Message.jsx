import React, { useState,forwardRef } from 'react'
import { useSelector } from 'react-redux';

const Message = forwardRef(({ message },ref) => {

    const { user } = useSelector((state) => state.profile);
    const createdAt = new Date(message.createdAt);
    const formattedDate = createdAt.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            {
                user.id === message.receiverId ?
                    (
                        <div ref={ref} className="chat chat-start">
                            <div className="chat-bubble">

                                {message.content}
                            </div>
                            <div className="chat-footer opacity-50">{ formattedDate }</div>
                        </div>
                    ) : (
                        <div ref={ref} className="chat chat-end">
                            <div className="chat-bubble chat-bubble-info">{message.content}</div>
                             <div className="chat-footer opacity-50">{ formattedDate }</div>
                        </div>
                    )
            }
        </>
    )
})

export default Message