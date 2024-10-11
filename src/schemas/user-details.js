const { Schema, mongoose } = require("../config/index")
const UserData = new Schema({
    email: { type: String, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please check email."] },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    user_name: { type: String, default: "" },
    full_name: { type: String, default: "" },
    password: { type: String, default: "" },
    profile: { type: String, default: "" },
    status: { type: Boolean, default: true },
    isAuthenticate: { type: Boolean, default: false },
    login_by: { type: String, default: '' },
    platform: { type: String, default: '' },
    userAgent: { type: String, default: '' },
},
    {
        timestamps: true,
        timeseries: true
    }
)

const UserModal = mongoose.model('user', UserData)

module.exports = {
    UserModal
}
