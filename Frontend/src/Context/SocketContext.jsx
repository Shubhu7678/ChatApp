import { Children, createContext, useContext, useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import { io } from "socket.io-client";

const socketContext = createContext();

export const useSocketContext = () => { 

    return useContext(socketContext);
}

export const SocketProvider = ({ children }) => { 

    const [socket, setSocket] = useState(null);
    const { user } = useSelector((state) => state.profile);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    useEffect(() => { 

        if (user) {

            const socket = io('http://localhost:4000', { query: { userId: user.id } });

            setSocket(socket);

            socket.on('onlineUsers', (users) => {
                
                setOnlineUsers(users);
                 
            })

            return () => socket.close();
        } else { 

            if (socket) { 

                socket.close();
                setSocket(null);
            }
        }
            
    }, [user])
    
    return ( 
        <socketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </socketContext.Provider>
    )
}

