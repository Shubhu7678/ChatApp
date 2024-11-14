import React from 'react'
import { useForm } from 'react-hook-form'
import { signup } from '../../services/operations/authApi';

const SignupForm = () => {

    const { register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors, isSubmitSuccessful },
    } = useForm();

    const onSubmit = (data) => {

        signup(data);
        reset();
    }

    return (
        <div className="text-white w-full md:w-[50%]">
            <div className="w-full p-2  md:p-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-semibold">Create a new account</h1>
                    <p className="text-sm font-normal text-gray-400">Please fill the form to create a new account</p>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex gap-2 mt-3 mb-3">
                                <div className="w-[50%]">
                                    <label className="text-sm" htmlFor="firstName">First Name <sup className="text-red-500">*</sup></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        className="input input-bordered w-full bg-gray-700" placeholder="First Name"
                                        {...register("firstName", { required: true })}
                                    />
                                    {errors.firstName && <span className="text-red-500">First Name is required**</span>}

                                </div>
                                <div className="w-[50%]">
                                    <label className="text-sm" htmlFor="lastName">Last Name <sup className="text-red-500">*</sup></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        className="input input-bordered w-full bg-gray-700" placeholder="Last Name"
                                        {...register('lastName', { required: true })}
                                    />
                                    {errors.lastName && <span className="text-red-500">Last Name is required**</span>}
                                </div>
                            </div>
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
                            <div className="flex gap-2">
                                <div className="w-[50%]">
                                    <label className="text-sm" htmlFor="password">Password <sup className="text-red-500">*</sup></label>
                                    <input
                                        type="text"
                                        name="password"
                                        className="input input-bordered w-full bg-gray-700" placeholder="Password"
                                        {...register('password', { required: true })}
                                    />
                                    {errors.password && <span className="text-red-500">Password is required**</span>}
                                </div>
                                <div className='w-[50%]'>
                                    <label className="text-sm" htmlFor="confirmPassword">Confirm Password <sup className="text-red-500">*</sup></label>
                                    <input
                                        type="text"
                                        name="confirmPassword"
                                        className="input input-bordered w-full bg-gray-700" placeholder="Confirm Password"
                                        {...register('confirmPassword', { required: true })}
                                    />
                                    {errors.confirmPassword && <span className="text-red-500">Confirm Password is required**</span>}
                                </div>
                            </div>
                            <button className="py-3 text-black w-full bg-yellow-500 mt-5 rounded-md ">Create Account</button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default SignupForm