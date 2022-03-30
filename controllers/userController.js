const { User } = require('../model/user');
const { createJwtToken } = require("../util/auth")
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const SendEmail = require('../util/sendEmail');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Tesseract = require('tesseract.js');

// register - dang ky tai khoan
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({ msg: 'Invalid input, please check your data' })
    }
    const { password, email, name } = req.body;
    console.log(req.body);
    let user;
    try {
        user = await User.findOne({ email });
    } catch (err) {
        console.errors(err.message)
        res.status(500).send({ msg: 'Server Error' })
    }
    if (user) {
        return res.status(200).json({ status: 'fail', msg: 'User already exists, please login instead.' })
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        console.errors(err.message);
        res.status(500).send({ msg: 'Server Error' });
    }



    user = new User({
        password: hashedPassword, email, name
    })
    try {
        await user.save().then(doc => {
            const token = createJwtToken(doc._id);
            res.json({ status: 'success', msg: 'Sign up successfully', token: token })
        });
    } catch (err) {
        console.log(err);
    }
}

// login - dang nhap tai khoan thuong
const login = async (req, res, next) => {
    if (!req.headers.authorization) {
        const { email, password } = req.body;
        let staff;
        try {
            staff = await User.findOne({ email: email });
        } catch (error) {
            console.log(error)
        }
        if (!staff) {
            return res.json({ status: 'fail', msg: 'email not found' })
        }
        let check = false;
        try {
            check = await bcrypt.compare(password, staff.password);
        } catch (err) {
            console.log(err)
        }
        if (!check) {
            return res.json({ status: 'fail', msg: 'Password is not match!' })
        }
        const token = createJwtToken(staff._id);
        return res.json({ status: 'sucess', msg: 'login successfully', token: token, data: staff })
    } else {
        const token = req.headers.authorization.split(' ')[1];
        let id;
        if (token) {
            jwt.verify(token, "kiendao2001", function (err, decodedToken) {
                if (err) {
                    return res.json({ status: 'fail', msg: "Invalid token" })
                }
                id = decodedToken.userID;
            });
            if (id) {
                let user = await User.findOne({ _id: id });
                return res.json({ status: 'sucess', msg: 'login successfully', token: token, data: user })
            }
        }
    }
}

//change password tài khoản thường
const normalUserChangePass = async (req, res) => {
    const userID = req.params.id;
    let user = await User.findOne({ _id: userID });
    if (!user) {
        return res.json({ status: 'fail', msg: 'user not found!' })
    }
    const { oldPassword, newPassword } = req.body;
    if (oldPassword && newPassword) {
        let check = false;
        try {
            check = await bcrypt.compare(oldPassword, user.password);
        } catch (err) {
            console.errors(err.message);
            res.status(200).send({ status: 'fail', msg: 'Server Error' });
        }
        if (!check) {
            return res.json({ status: 'fail', msg: 'Old password is not match' });
        } else {
            let hashedPassword = await bcrypt.hash(newPassword, 12);
            User.findOneAndUpdate({ _id: userID }, { password: hashedPassword }, { new: true }, (err, doc) => {
                return res.json({ status: 'success', msg: 'password has changed', info: doc })
            })
        }

    }
}


const forgetPass = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({ msg: 'Invalid input, please check your data' })
    }
    const user = await User.findOne({ email: req.body.email });
    console.log(user)
    if (!user)
        return res.status(200).json({ status: 'fail', msg: 'Email not found' });
    const n = crypto.randomInt(100000, 999999);
    console.log(n);
    const newpass = await bcrypt.hash(n.toString(), 12);
    await SendEmail(user.email, "Your new password", n);
    await User.findOneAndUpdate({ email: user.email }, { password: newpass }, { new: true }).then(doc => {
        res.json({ status: true, msg: 'Check your email to receive new password' })
    })
}

const extractText = async (req, res) => {
    let { image ,mode } = req.body;
    Tesseract.recognize(image, mode,
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log(text);
        // text= text.replace(/?/g, "")
        return res.json({status:'success',data:text})
    })
    
}

exports.forgetPass = forgetPass;
exports.register = register;
exports.login = login;
exports.normalUserChangePass = normalUserChangePass;
exports.extractText = extractText;