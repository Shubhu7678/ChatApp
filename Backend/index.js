import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoutes from './routes/user.js';
import messageRoutes from './routes/message.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
import path from 'path';
import { app, io, httpServer } from './socketIO/server.js';
// const app = express();

// middleware for json data
app.use(express.json());
app.use(cookieParser());

// cors middleware 

app.use(cors({
    credentials: true,
    origin: 'https://chat-app-chi-fawn.vercel.app',
}));
// app.use(cors({
//     credentials: true,
//     origin: 'http://localhost:3000',
// }));

// Connect to MongoDB

connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!');
})

// Routes
app.use('/user', userRoutes);
app.use('/message', messageRoutes);

// -----------------------------Code for Deployment ---------------


httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})