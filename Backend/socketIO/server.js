import { Server } from 'socket.io';
import  http  from 'http';
import express from 'express';

const app = express();

const httpServer = http.createServer(app);


const io = new Server(httpServer,
    {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    }
);

// real time message code

export const getReceiverSocketId = (receiverId) => { 

    return users[receiverId];
}

const users = {};

io.on('connection', (socket) => {

    console.log('User connected', socket.id);

    const userId = socket.handshake.query.userId;

    users[userId] = socket.id;
    console.log("Users : ", users);

    io.emit('onlineUsers', Object.keys(users));

    socket.on('disconnect', () => {

        console.log('User disconnected', socket.id);
        delete users[userId];
        io.emit('onlineUsers', Object.keys(users));
    })
});

export {app , io , httpServer};
