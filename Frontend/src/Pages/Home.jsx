import React from 'react'
import Left from '../components/Home/Left/Left'
import Right from '../components/Home/Right/Right'
import SideLeft from '../components/Home/SideLeft/SideLeft'
import { useSelector } from 'react-redux'
import ClosedChat from '../components/Home/Closed/ClosedChat'

const Home = () => {

  const { user } = useSelector((state) => state.profile);
  const { selectedConversation } = useSelector((state) => state.message);

  return (
    <div>
      <div className="flex h-screen">
        <SideLeft />
        <Left />
        {
          selectedConversation ?
            (
              <Right />
            )
            :
            (
              // <div className="w-full flex items-center justify-center text-white text-2xl font-semibold">
              //   Select a user to start conversation
              // </div>
              <ClosedChat />
            )
        }

      </div>
    </div>
  )
}

export default Home