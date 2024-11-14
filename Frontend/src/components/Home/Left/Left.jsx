import React from 'react'
import Search from './Search'
import Users from './Users'


const Left = () => {
  return (
    <div className="w-[30%] bg-gray-800 text-white p-4 h-screen">
      <div className="mb-2">
        <p className="font-semibold text-2xl">Chats</p>
      </div>
      <Search />
      <hr />
      <Users/>
    </div>
  )
}

export default Left