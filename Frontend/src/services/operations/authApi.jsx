import { apiConnector } from '../apiconnector';
import toast from 'react-hot-toast';
import { authApiEndpoints } from '../apis';
import { NavLink, useNavigate } from 'react-router-dom';
import { setToken } from '../../slices/authSlice';
import { setUser } from '../../slices/profileSlice';
import { setSelectedConversation } from '../../slices/messageSlice';


const {
    SIGNUP_API,
    LOGIN_API,
    LOGOUT_API,
    FETCH_ALL_USERS
} = authApiEndpoints
export const signup = async (data) => { 
    
    const toastId = toast.loading('Signing up...');
    try {

        const response = await apiConnector('POST', SIGNUP_API,data );

        if (!response.data.success) { 

            throw new Error(response.data.message);
        }

        toast.success(response.data.message);
        console.log(response.data.message);
    } catch (err) { 

        console.log("Error in signing up", err);
        toast.error(err.response.data.message);
    }
    
    toast.dismiss(toastId);
     
}

export const login = async (data,navigate,dispatch) => { 

    const toastId = toast.loading('Logging in...');
    try {

        const response = await apiConnector('POST', LOGIN_API, data);

        if (!response.data.success) { 

            throw new Error(response.data.message);
        }

        toast.success(response.data.message);
        // console.log(response.data.message);

        localStorage.setItem('token', JSON.stringify(response.data.token));
        localStorage.setItem('user', JSON.stringify(response.data.user));

        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));

        navigate('/');
        toast.dismiss(toastId);

    } catch (error) { 

        console.log("Error in logging in", error);
        toast.error(error.response.data.message);
        toast.dismiss(toastId);
    }

    toast.dismiss(toastId);
}

export const logout = async (navigate, dispatch) => { 

    const toastId = toast.loading('Logging out...');
    try {

        const response = await apiConnector('POST', LOGOUT_API);
        if (!response.data.success) { 

            throw new Error(response.data.message); 
        }

        toast.success(response.data.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        dispatch(setToken(null));
        dispatch(setUser(null));
        dispatch(setSelectedConversation(null));

        navigate('/login');
        toast.dismiss(toastId);

    } catch (error) { 

        console.log("Error in logging out", error);
        toast.error(error.response.data.message);
        toast.dismiss(toastId);
    }

    toast.dismiss(toastId);
}

export const fetchAllData = async (token) => { 

    let result = [];

    try {

        const response = await apiConnector('GET', FETCH_ALL_USERS, {},
            {
                'Authorization': `Bearer ${token}`
            }
        )
        
        if (!response.data.success) { 

            throw new Error(response.data.message);
        }

        result = response.data.users
        // console.log(result);

    } catch (error) { 

        console.log("Error in fetching all users >>> ", error);
        
    }

    return result;
}