const jwt = require("jsonwebtoken");
const generateToken = (exist, time) => {
    try {
        let token = jwt.sign(exist, "my-app-user", { expiresIn: time });
        return token;
    } catch (err) {
        return null
    }
};
const verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, "my-app-user");
      return decoded;
    } catch (err) {
      console.error("Invalid or expired token:", err.message);
      return null;
    }
  };

module.exports = { generateToken ,verifyToken}