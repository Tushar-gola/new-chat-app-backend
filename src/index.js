const express = require('express')
const { createServer } = require("http");
const cors = require('cors')
const app = express()
const { Server } = require("socket.io");
const dotenv = require('dotenv')
dotenv.config()
const { authRoutes } = require('./routes/login');
const { startServer } = require('./config');
const { userRoutes } = require('./routes/user');
const { roomsRoutes } = require('./routes/rooms');
const { ChatsModal } = require('./schemas/chats');
const { default: mongoose } = require('mongoose');
const { MessagesModel } = require('./schemas/messages');
const server = createServer(app);
const { PORT, MONGO_URL } = process.env
app.use(cors('*'))
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/room', roomsRoutes)

// Socket Io

const io = new Server(server, {
    cors: "*",
    pingTimeout: 60000, // Increase this value as needed
    pingInterval: 25000
})

const userSocketMap = new Map();
const onlineUsers = new Set();
io.on('connection', (socket) => {
    const userId = socket?.handshake?.auth.user;
    console.log('a user connected', userId, socket.id);
    if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, []);
    }
    userSocketMap.get(userId).push(socket.id);
    if (!onlineUsers.has(userId)) {
        onlineUsers.add(userId);
        // Fetch chats only if the user comes online for the first time
        ChatsModal.find({ participants: { $in: [userId] } }).then(chats => {
            const notifiedUsers = new Set(); // Track users already notified
            chats.forEach(chat => {
                chat.participants.forEach(participantId => {
                    const participantIdStr = String(participantId);
                    if (onlineUsers.has(participantIdStr) && !notifiedUsers.has(participantIdStr)) {
                        notifiedUsers.add(participantIdStr);  // Avoid redundant notifications
                        const participantSockets = userSocketMap.get(participantIdStr);
                        if (participantSockets && participantSockets.length > 0) {
                            participantSockets.forEach(socketId => {
                                io.to(socketId).emit('user status', { userId: Array.from(onlineUsers), online: true });
                            });
                        }
                    }
                });
            });
        });
    }
    socket.on('join room', async (participantId) => {
        let existingChat = await ChatsModal.findOne({
            participants: { $all: participantId }
        });
        let roomId;
        if (existingChat) {
            roomId = existingChat.room_id;
            socket.join(roomId);
            io.to(roomId).emit('user joined', `A new user has joined room: ${roomId}`);
        } else {
            roomId = `room-${new mongoose.Types.ObjectId()}`;
            existingChat = await ChatsModal.create({
                participants: participantId,
                type: participantId.length >= 2 ? "solo" : 'group',
                room_id: roomId
            });
            socket.join(roomId);

        }
        io.to(roomId).emit('room id', { roomId, chat_id: existingChat?._id });
    })
    socket.on('send message', async (message) => {        
        const roomId = message.room
        const chatId = message.chatId
        const messageData = await MessagesModel.create({
            chatId,
            sender: message.user,
            content: message.message,
        })
        if (roomId) {
            io.to(roomId).emit('new message', messageData);
        }
    })

    socket.on('find chats', async ({ chatId, room }) => {
        let chats = []  
        if (chatId) {
            chats = await MessagesModel.find({
                chatId: chatId
            });
        }
        io.to(room).emit('get chats', chats)
    })

    socket.on('leave room', (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit('user left', `A user has left room: ${roomId}`);
        console.log(`User ${userId} left room: ${roomId}`);
    });

    socket.on('user typing start', (data) => {
        
        const userSockets = userSocketMap.get(data?.recieverId)
        console.log(userSockets);
        console.log(data);
        
        userSockets?.forEach(element => {
            io.to(element).emit('user typing', { userId: data?.userId });
        });

    });
    socket.on('user hold typing', async (data) => {
        const userSockets = userSocketMap.get(data?.recieverId)
        let lastMessage
        if (data.room) {
            lastMessage = await MessagesModel.findOne({ chatId: data?.chatId })
                .sort({ createdAt: -1 }) // Sort by createdAt in descending order
                .exec(); // Execute the query
        }


        io.to(userSockets).emit('user stopped typing', { userId: data?.userId, lastMessage });


    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', userId);
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
            const socketIndex = userSockets.indexOf(socket.id);
            if (socketIndex !== -1) {
                userSockets.splice(socketIndex, 1);  // Remove the socket ID from the array
            }
            if (userSockets.length == 0) {
                userSocketMap.delete(userId);
                onlineUsers.delete(userId);  // Mark the user as offline
                io.emit('user status', { userId, online: false });
            } else {
                console.log(`Active socket IDs for user ${userId}: ${userSockets}`);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

startServer(MONGO_URL)
module.exports = {
    app,
    server
}