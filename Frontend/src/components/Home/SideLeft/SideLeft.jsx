import React from 'react'
import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import {logout} from '../../../services/operations/authApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';


const SideLeft = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {

        logout(navigate, dispatch);
        
    }

    return (
        <div className="w-[4%] bg-gray-900 h-screen p-3">
            <div className="h-full flex items-end justify-center">
                <div className="flex flex-col gap-5">
                    <IoSearch className="text-2xl text-gray-50  hover:text-gray-400 cursor-pointer duration-300 " />
                    <FiLogOut onClick={handleLogout} className="text-2xl text-gray-50 cursor-pointer scale-90 duration-300" />
                    <IoSettingsOutline className="text-2xl text-gray-50 cursor-pointer scale-105 duration-300" />
                </div>
            </div>
        </div>
    )
}

export default SideLeft