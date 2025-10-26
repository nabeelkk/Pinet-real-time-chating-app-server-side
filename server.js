import express from 'express'
import http from 'http'
import 'dotenv/config'
import cors from 'cors'
import connectDb from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messagesRoutes from './routes/messagesRoutes.js'
import { Server } from 'socket.io'



const app = express()
const server = http.createServer(app)

export const io = new Server(server,{
    cors : {origin: "https://pinet-real-time-chating-app-client.vercel.app/"}
})

export const userSocketMap = {} // {userId: socketId}

io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId
    console.log("socket connected",userId)

    if(userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("User disconnected",userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

// middleware
app.use(cors())
app.use(express.json({limit:'4mb'}))



app.use('/api/status',(req,res)=>res.send("Server Listening"))
app.use('/api/auth',userRouter)
app.use('/api/messages',messagesRoutes)


await connectDb()

const PORT = process.env.PORT || 5003

server.listen(PORT,()=>console.log(`Server Running on http://localhost:${PORT}`))
