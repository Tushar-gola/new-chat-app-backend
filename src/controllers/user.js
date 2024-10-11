const { mongoose } = require("../config");
const { error, success } = require("../helpers/response");
const { ChatsModal } = require("../schemas/chats");
const { UserModal } = require("../schemas/user-details");

const handleGetUsers = async (req, res) => {
    try {
        const { search = "", page = 0, page_size = 15 } = req.query
        const skip = page * page_size;
        const query = {
            _id: { $ne: req.user },
            status: true,
            $or: [
                { email: { $regex: search, $options: "i" } }, //  i Case-insensitive 
                { user_name: { $regex: search, $options: "i" } },
            ]
        }
        const users = await UserModal.find(query).select('-isAuthenticate -password -userAgent -createdAt -updatedAt -status').skip(skip).limit(page_size)
        const totalUsers = await UserModal.countDocuments(query);
        return res.status(200).json(success('Users retrieve successfully.',
            {
                users,
                total: totalUsers,
                page: parseInt(page),
                page_size: parseInt(page_size),
                totalPages: Math.ceil(totalUsers / page_size)
            }
        ))
    } catch (err) {
        console.log(err);

        return res.status(400).json(error(err))
    }
}
const handleUserChats = async (req, res) => {
    try {
        const { search = "", page = 0, page_size = 15 } = req.query
        const skip = page * page_size;

        const chats = await ChatsModal.aggregate([
            {
                $match: {
                    participants: { $in: [new mongoose.Types.ObjectId(req.user)] }
                }
            },
            {
                $addFields: {
                    user: {
                        $filter: {
                            input: '$participants',
                            as: 'participant',
                            cond: { $ne: ['$$participant', new mongoose.Types.ObjectId(req.user)] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $unwind: {
                    path: "$user_info"
                }
            },
            {
                $match: {
                    $or: [
                        { 'user_info.email': { $regex: search, $options: "i" } }, //  i Case-insensitive 
                        { 'user_info.user_name': { $regex: search, $options: "i" } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: '_id',
                    foreignField: 'chatId',
                    as: 'chats'
                }
            },
            {
                $addFields: {
                    lastMessage: {
                        $arrayElemAt: [
                            {
                                $slice: [{
                                    $sortArray: {
                                        input: '$chats',
                                        sortBy: { createdAt: -1 },

                                    }
                                }, 1]
                            }, 0]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    lastMessage: { $first: "$lastMessage" },
                    user_info: { $first: "$user_info" },
                    // participants: { $first: "$participants" },
                    type: { $first: "$type" },
                    groupName: { $first: "$groupName" },
                    admin: { $first: "$admin" },
                    pinnedMessages: { $first: "$pinnedMessages" },
                    isArchived: { $first: "$isArchived" },
                    room_id: { $first: "$room_id" },
                    isDeleted: { $first: "$isDeleted" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" }

                }
            },
            { $match: { lastMessage: { $ne: null } } },
            {
                $sort: {
                    'lastMessage.createdAt': -1
                }
            },
            {
                $project: {
                    user: 0,
                    chats: 0,
                    user_info: {
                        password: 0,
                        isAuthenticate: 0,
                        login_by: 0,
                        platform: 0,
                        userAgent: 0,
                        createdAt: 0,
                        updatedAt: 0
                    }
                }
            },
            {
                $skip: skip // Implement pagination
            },
            {
                $limit: parseInt(page_size) // Limit results to page_size
            }
        ]);
        return res.status(200).json(success('Users retrieve successfully.', chats))
    } catch (err) {
        console.log(err);

        return res.status(400).json(error(err))
    }


}
module.exports = { handleGetUsers, handleUserChats }