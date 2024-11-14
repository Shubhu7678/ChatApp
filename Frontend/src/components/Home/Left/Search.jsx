import React from 'react'
import { IoSearch } from "react-icons/io5";

const Search = () => {
  return (
    <div className="text-black mb-2">
      <form action="">
        <label className="input input-bordered flex items-center gap-2">
          <input type="text" className="grow" placeholder="Search" />
           <IoSearch className="text-xl hover:text-gray-400 cursor-pointer duration-300 " />
        </label>
      </form>
    </div>
  )
}

export default Search