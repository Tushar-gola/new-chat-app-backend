// middleware/verifyToken.js

const { verifyToken } = require('../functions');
const { error } = require('../helpers/response');
const { UserModal } = require('../schemas/user-details');
const verifyUserToken = async (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = req.headers['authorization'].split(' ')[1]
    const tokenData = verifyToken(token);
    if (!tokenData) {
        return res.status(401).json(error("Unauthorized request: Invalid or expired token."));
    }

    try {
        const userVerify = await UserModal.findOne({ _id: tokenData._id });
        if (userVerify) {
            req.user = userVerify._id;
            next();
        } else {
            return res.status(401).json(error("Unauthorized request: User not found."));
        }
    } catch (err) {
        console.log(err);

        return res.status(500).json(error("Server error."));
    }
};

module.exports = verifyUserToken;
