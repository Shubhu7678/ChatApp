import React from 'react'
import SignUpImage from '../assets/signUP.jpeg'
import SignupForm from '../components/SignUp/SignupForm'

const Signup = () => {
    return (
        <div className="bg-gray-900">
            <div className="w-11/12 mx-auto h-screen flex items-center justify-center">
                <div className="w-full flex items-center ">
                    <SignupForm />
                    <div className="hidden md:block md:w-[50%] lg:w-[50%]">
                        <img className="w-full" src={SignUpImage} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup