const User = require("../model/User");
require("dotenv").config();
// const jwt = require("jsonwebtoken");

// module.exports.userVerification = (req, res) => {
//     const token = req.cookies.token
//     if (!token) {
//       return res.json({ status: false })
//     }
//     jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
//       if (err) {
//        return res.json({ status: false })
//       } else {
//         const user = await User.findById(data.id)
//         if (user) return res.json({ status: true, user: user.userId })
//         else return res.json({ status: false })
//       }
//     })
//   }
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = async(req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // Unauthorized

    
    try{
       const isVerify= jwt.verify(token, process.env.JWT_SECRET);
       
       req.userId=isVerify.userId;
       console.log(req.userId);

        next();
    }
    catch(error){
        return res.status(401).json({message:"Unauthorized token"})

    };
};
module.exports = authenticateToken;
