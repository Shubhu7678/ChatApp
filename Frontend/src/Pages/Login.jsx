import React, { useState } from 'react'
import SignUpImage from '../assets/signUP.jpeg'
import { useForm } from 'react-hook-form'

import { login } from '../services/operations/authApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Login = () => {

    const { register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors, isSubmitSuccessful },
    } = useForm();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
         
        login(data,navigate,dispatch);
        reset();

    }
    return (
        <div className="bg-gray-900">
            <div className="w-11/12 mx-auto h-screen flex items-center justify-center">
                <div className="w-full flex items-center ">
                    <div className="text-white w-full md:w-[50%]">
                        <div className="w-full p-2  md:p-8">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-semibold">Create a new account</h1>
                                <p className="text-sm font-normal text-gray-400">Please fill the form to create a new account</p>
                                <div>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="mb-3">
                                            <label className="text-sm" htmlFor="email">Email <sup className="text-red-500">*</sup></label>
                                            <input
                                                type="text"
                                                name="email"
                                                className="input input-bordered w-full bg-gray-700" placeholder="Email"
                                                {...register('email', { required: true })}
                                            />
                                            {errors.email && <span className="text-red-500">Email is required**</span>}
                                        </div>
                                        <div className="mb-3 gap-2">
                                            <label className="text-sm" htmlFor="password">Password <sup className="text-red-500">*</sup></label>
                                            <input
                                                type="text"
                                                name="password"
                                                className="input input-bordered w-full bg-gray-700" placeholder="Password"
                                                {...register('password', { required: true })}
                                            />
                                            {errors.password && <span className="text-red-500">Password is required**</span>}
                                        </div>
                                        <button className="py-3 text-black w-full bg-yellow-500 mt-5 rounded-md ">Login</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block md:w-[50%] lg:w-[50%]">
                        <img className="w-full" src={SignUpImage} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login