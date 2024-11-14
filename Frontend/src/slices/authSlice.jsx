import { createSlice } from "@reduxjs/toolkit";

const initialState = {

    token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')) : null,
    userData: null,
    loading: false,   
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        
        setToken: (state, action) => {

            state.token = action.payload;
            
        },

        setUserData: (state, action) => {

            state.userData = action.payload;
        },

        setLoading: (state, action) => {

            state.loading = action.payload;
        }
    }


});

export const { setToken, setUserData, setLoading } = authSlice.actions;

export default authSlice.reducer;