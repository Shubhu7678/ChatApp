
import { configureStore } from "@reduxjs/toolkit";
import authReducer from './src/slices/authSlice'
import profileReducer from './src/slices/profileSlice'
import messageReducer from '/src/slices/messageSlice'

const store = configureStore({
    reducer: {
        'auth' : authReducer,
        'profile': profileReducer,
        'message': messageReducer,
    },
})

export default store