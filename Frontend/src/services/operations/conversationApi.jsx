import { apiConnector } from "../apiconnector";
import { conversationEndPoints } from '../apis';

const { SEND_MESSAGE_API,GET_ALL_MESSAGES_API } = conversationEndPoints;

export const sendConversationMessage = async (receiverId, message,token) => {
    
    let result = [];
    try {

        const response = await apiConnector('POST', SEND_MESSAGE_API, { receiverId, message },
            {
                'Authorization': `Bearer ${token}`
            }
        );

        console.log(response);

        if (!response.data.success) { 

            throw new Error(response.data.message);
        }

        result = response.data.data;
      

    } catch (err) { 

        console.error("Error in sending message", err);
        
    }
    
    return result;
}

export const fetchAllChatDetails = async (receiverId, token) => {

    let result = [];
    try {
 
        const response = await apiConnector('POST', GET_ALL_MESSAGES_API,{receiverId},
            {
                'Authorization': `Bearer ${token}`
            }
        ) 
        
        if (!response.data.success) { 

            throw new Error(response.data.message);
        }

        result = response.data.data;
        // console.log(result);

    } catch (error) { 

        console.error("Error in fetching messages", error);
    }

    return result;
 }