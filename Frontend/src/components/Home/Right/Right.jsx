import React from 'react'
import ChatUser from './ChatUser'
import Messages from './Messages'
import Type from './Type'

const Right = () => {
  return (
    <div className="w-[70%] bg-slate-950 text-white relative">
      <ChatUser />
      <Messages />
      <Type />
    </div>
  )
}

export default Right