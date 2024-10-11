const { Schema, mongoose } = require("../config/index");

const messageData = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'chats',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [
        {
            fileType: {
                type: String,
                enum: ['image', 'audio', 'video', 'document'],
                required: true
            },
            fileUrl: {
                type: String,
                required: true // Store the URL or path of the file
            },
            fileName: {
                type: String,
                required: true
            },
            fileSize: {
                type: Number, // Optionally store file size
            }
        }
    ],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'], // Message status tracking
        default: 'sent'
    },
    reactions: [
        {
            emoji: {
                type: String,  // Store the emoji code
                required: true
            },
            reactedBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'messages'  // Replying to a specific message
    },
    isSeen: { type: Boolean, default: false },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const MessagesModel = mongoose.model('messages', messageData);

module.exports = {
    MessagesModel
};
