const { Schema, mongoose } = require("../config/index")
const chatData = new Schema({
    type: {
        type: String,
        enum: ['solo', 'group'],
        required: true
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    ],
    groupName: {
        type: String,
        required: function () { return this.type === 'group'; }
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: function () { return this.type === 'group'; }
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'messages'  // Store a reference to the most recent message
    },
    pinnedMessages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'messages' // Allows pinning important messages
        }
    ],
    isArchived: {
        type: Boolean,
        default: false  // Allows archiving chats for later
    },
    room_id: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
},
    {
        timestamps: true,
        timeseries: true
    }
)

const ChatsModal = mongoose.model('chats', chatData)

module.exports = {
    ChatsModal
}
