import React from 'react'
import { GrEmoji } from "react-icons/gr";
import { MdDriveFolderUpload } from "react-icons/md";
import { LuSendHorizonal } from "react-icons/lu";
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { sendConversationMessage } from '../../../services/operations/conversationApi';
import {setMessages } from '../../../slices/messageSlice'

const Type = () => {

    const { handleSubmit,
        register,
        formState: { errors },
        reset,
        getValues,
        setValue
    } = useForm();

    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.message);

    const { selectedConversation } = useSelector((state) => state.message);

    const onSubmit = async (data) => {

        if (!data.message) return;
        console.log(data);
        const receiverId = selectedConversation?._id;
        const message = data.message;
        const result = await sendConversationMessage(receiverId, message, token);
        if (result) { 

            reset();
            dispatch(setMessages([...messages, result]));
        }
    }

    return (
        <div className="w-full bg-gray-900 absolute bottom-0">
            <div className="p-4 flex gap-2 items-center">
                <div className="w-[10%] flex items-center gap-4">
                    <GrEmoji className="text-2xl text-gray-400 cursor-pointer hover:text-gray-200 duration-300" />
                    <MdDriveFolderUpload className="text-2xl text-gray-400 cursor-pointer hover:text-gray-200 duration-300" />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="w-[90%] flex items-center gap-4" action="">
                    <div className="w-[95%]">
                        <input
                            name="message"
                            type="text"
                            placeholder="Type here" className="input py-1 bg-gray-800 input-bordered w-full text-white"
                            {...register('message', { required: true })}
                        />
                    </div>
                    <div>
                        <button type="submit">
                            <LuSendHorizonal className="text-2xl text-gray-400 cursor-pointer hover:text-gray-200 duration-300" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Type