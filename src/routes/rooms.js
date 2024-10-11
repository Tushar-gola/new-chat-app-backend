
const express = require('express')
const verifyUserToken = require('../middlewares/access-token')
const { handleGetUsers } = require('../controllers/user')
const { handleCreateRoom } = require('../controllers/rooms')

const roomsRoutes = express.Router()
roomsRoutes.post('/generate',verifyUserToken,handleCreateRoom)

module.exports = {
    roomsRoutes
}
