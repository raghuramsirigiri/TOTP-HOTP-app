const express = require('express');
const commons = require('./commons');
const mongoose = require('../database/mongoose');
const router = express.Router();

const users = require('../database/models/users');

router.post('/register', (req, res) => {
    console.log(`DEBUG: Received request to register user`);

    const result = req.body;
    console.log(result);
    if ((!result.uname && !result.upass) || (result.uname.trim() == "" || result.upass.trim() == "")) {
        return res.send({
            "status": 400,
            "message": "Username/password is required"
        });
    }

    new users({uname: result.uname, upass: result.upass})
        .save()
        .then((users) => res.send({
            "status": 200,
            "message": "User registered successfully"
        })).catch((error) => res.send({
            "status": 409,
            "message": "Username already exists"
        }));
});

module.exports = router;