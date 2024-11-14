import React from 'react'
import { FaRocketchat } from "react-icons/fa6";

const ClosedChat = () => {
  return (
      <div className="w-[70%] flex items-center justify-center h-screen bg-slate-950 text-white relative">
          <div className="flex w-[40%] justify-center mx-auto text-center flex-col gap-5 ">
              <FaRocketchat className="text-gray-500 mx-auto animate-bounce text-9xl" />
              <h1 className="text-4xl text-gray-400 font-mono">ChatApp For Windows</h1>
              <p className="text-sm text-gray-500">
                  Send and receive messages with your friends without keeping your phone online.
              </p>
          </div>
    </div>
  )
}

export default ClosedChat