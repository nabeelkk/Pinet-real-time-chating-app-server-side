import express from "express"
import { protectRoute } from "../middlewares/auth.js"
import { getMessages, getUsersForSideBar, markMessageAsSeen, sendMessage } from "../controllers/messagesControllers.js"




const messagesRoutes = express.Router()

messagesRoutes.get('/users', protectRoute, getUsersForSideBar)
messagesRoutes.get('/:id', protectRoute, getMessages)
messagesRoutes.put('/mark/:id', protectRoute, markMessageAsSeen)
messagesRoutes.post('/send/:id',protectRoute, sendMessage)

export default messagesRoutes