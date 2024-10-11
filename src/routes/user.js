
const express = require('express')
const verifyUserToken = require('../middlewares/access-token')
const { handleGetUsers, handleUserChats } = require('../controllers/user')

const userRoutes = express.Router()
userRoutes.get('/', verifyUserToken, handleGetUsers)
userRoutes.get('/chats', verifyUserToken, handleUserChats)

module.exports = { userRoutes }