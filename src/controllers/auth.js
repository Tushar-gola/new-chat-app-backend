const { error, success } = require("../helpers/response");
const { validationResult } = require('express-validator');
const { UserModal } = require("../schemas/user-details");
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require("../functions");
const handleSignIndata = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(error(errors.array().map(err => err.msg)[0]));
        }
        const { email, first_name, last_name, password, profile, login_by, user_name, platform, userAgent } = req.body

        const hashedPassword = await bcrypt.hash(password, 10);

        const exist = await UserModal.findOne({ email: email })

        if (exist) return res.status(400).json(error('User already exist.'));

        const user = await UserModal.create({
            email,
            first_name,
            last_name,
            password: hashedPassword,
            profile,
            login_by,
            user_name,
            platform,
            userAgent,
            full_name: first_name + " " + last_name,
            isAuthenticate: true
        })
        const { createdAt, updatedAt, isAuthenticate, password: nopass, login_by: nologin_by, ...remaining } = user?._doc
        const accessToken = generateToken(remaining, '15m')
        const refreshToken = generateToken(remaining, '24h')
        return res.status(200).json(success('Sign In Successfully.', { ...remaining, accessToken, refreshToken }))

    } catch (err) {
        console.log(err);
        return res.status(400).json(error(err))

    }
}
const handleSignUpUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(error(errors.array().map(err => err.msg)[0]));
        }
        const { email, password, login_by } = req.body
        const user = await UserModal.findOne({ email, login_by })
        if (!user) return res.status(400).json(error('User does not exist'))
        const hashedPassword = await bcrypt.compare(password, user.password);
        if (!hashedPassword) return res.status(400).json(error('Creadiencial is wrong.'))
        const { createdAt, updatedAt, isAuthenticate, password: nopass, login_by: nologin_by, ...remaining } = user?._doc
        const accessToken = generateToken(remaining, '15m')
        const refreshToken = generateToken(remaining, '24h')
        return res.status(200).json(success('Sign In Successfully.', { ...remaining, accessToken, refreshToken }))
    } catch (err) {
        console.log(err);
        return res.status(400).json(error(err))

    }
}
const handleVerifyUser = async (req, res) => {
    try {
        const user = await UserModal.findOne({ _id: req.user })
        if (!user.isAuthenticate) {
            await UserModal.findOneAndUpdate({ _id: req.user }, { isAuthenticate: false })
        }
        const { createdAt, updatedAt, isAuthenticate, password, login_by, ...remaining } = user?._doc
        return res.status(200).json(success('Verify User.', { isAuthenticate: isAuthenticate, user_details: remaining }))
    } catch (err) {
        console.log(err);

        return res.status(400).json(error(err))
    }
}
const handleUserRefreshToken = async (req, res) => {
    try {        
        const { refreshToken, accessToken, user } = req.body
        if (!refreshToken) {
            return res.status(400).json(error("Refresh Token is required."))
        }
        if (!accessToken) {
            return res.status(400).json(error("Access Token is required."))
        }
        const refreshTokenData = verifyToken(refreshToken);
        if (!refreshTokenData) {
            await UserModal.findOneAndUpdate({ _id: user }, { isAuthenticate: false })
            return res.status(400).json(error("Refresh Token is Expired."))
        }
        const isValid = await UserModal.findOne({ _id: user })
        if (!isValid) return res.status(400).json(error("User not found."))

        const { createdAt, updatedAt, isAuthenticate, password, login_by, ...remaining } = isValid?._doc
        const newAccessToken = generateToken(remaining, '15m')
        const newRefreshToken = generateToken(remaining, '24h')
        return res.status(200).json(success('Verify User.', { accessToken: newAccessToken, refreshToken: newRefreshToken }))
    } catch (err) {
        console.log(err);
        return res.status(400).json(error(err))
    }
}

module.exports = {
    handleSignIndata,
    handleVerifyUser,
    handleSignUpUser,
    handleUserRefreshToken
}