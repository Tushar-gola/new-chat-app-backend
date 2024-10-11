const { error, success } = require("../helpers/response");
const { ChatsModal } = require("../schemas/chats");

const handleCreateRoom = async (req, res) => {
    try {
        const { participantId } = req.body

        let existingChat = await ChatsModal.findOne({
            participants: participantId
        });
        if (existingChat) {
            return res.json(success('Room is found', existingChat))
        }
        const newRoomId = `room-${new mongoose.Types.ObjectId()}`;
        existingChat = await ChatsModal.create({
            participants: participantId,
            type: participantId.length > 2 ? "solo" : 'group',
            room_id: newRoomId
        });
        return res.json(success('New room created', existingChat));
    } catch (err) {
        console.log(err);
        return res.status(400).json(error(err))

    }
}

module.exports = { handleCreateRoom }