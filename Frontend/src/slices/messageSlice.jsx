import { createSlice } from '@reduxjs/toolkit';

const initialState = {

    selectedConversation: null,
    messages: [],
    
}

const messageSlice = createSlice({

    name: 'message',
    initialState,
    reducers: {

        setSelectedConversation: (state, action) => {

            state.selectedConversation = action.payload;
        },

        setMessages: (state, action) => {

            state.messages = action.payload;
        }
    }
})

export const { setSelectedConversation, setMessages } = messageSlice.actions;

export default messageSlice.reducer;