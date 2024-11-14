const BASE_URL = import.meta.env.VITE_BASE_URL;

export const authApiEndpoints = {

    SIGNUP_API: BASE_URL + '/user/signup',
    LOGIN_API: BASE_URL + '/user/login',
    LOGOUT_API: BASE_URL + '/user/logout',
    FETCH_ALL_USERS : BASE_URL + '/user/fetchAllUsers'
}

export const conversationEndPoints = {

    SEND_MESSAGE_API: BASE_URL + '/message/sendMessage',
    GET_ALL_MESSAGES_API : BASE_URL + '/message/getRelatedMessages'
}