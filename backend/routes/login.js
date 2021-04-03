const express = require('express');
const speakeasy = require('speakeasy');
const commons = require('./commons');
const mongoose = require('../database/mongoose');
const router = express.Router();

const users = require('../database/models/users');

router.post('/login', (req, res) => {
    console.log(`DEBUG: Received login request 1`);

    const login_request = req.body;

    console.log(login_request.uname);

    users.find({ uname: login_request.uname })
        .then(user => {
            if(user.length==0){
                res.send({
                    "status": 400,
                    "message": "No User Found"
                });
            }

            if(user[0].upass==login_request.upass){
                let tfa_enabled = false;
                if(user[0].tfa.tempSecret=="Enabled"){
                    tfa_enabled = true;
                }
                
                user[0].temp_login = user[0].uname+Date.now();
                console.log(user[0].tfa.tempSecret)
                users.findOneAndUpdate({ uname: user[0].uname }, { $set: user[0] },{new: "true"})
                    .then(user_new => res.send({
                        "status": 200,
                        "message": "Password Macthed",
                        "uname": user_new.uname,
                        "temp_login": user_new.temp_login,
                        "tfa_enabled": tfa_enabled
                    }))
                    .catch((error) => console.log(error));
                
            }else{
                res.send({
                    "status": 400,
                    "message": "Password Didn't Match"
                })
            }
        }).catch((error) => {console.log(error); res.send(error)});


    // if (commons.userObject.uname && commons.userObject.upass) {
    //     if (!commons.userObject.tfa || !commons.userObject.tfa.secret) {
    //         if (req.body.uname == commons.userObject.uname && req.body.upass == commons.userObject.upass) {
    //             console.log(`DEBUG: Login without TFA is successful`);

    //             return res.send({
    //                 "status": 200,
    //                 "message": "success"
    //             });
    //         }
    //         console.log(`ERROR: Login without TFA is not successful`);

    //         return res.send({
    //             "status": 403,
    //             "message": "Invalid username or password"
    //         });

    //     } else {
    //         if (req.body.uname != commons.userObject.uname || req.body.upass != commons.userObject.upass) {
    //             console.log(`ERROR: Login with TFA is not successful`);

    //             return res.send({
    //                 "status": 403,
    //                 "message": "Invalid username or password"
    //             });
    //         }
    //         if (!req.headers['x-tfa']) {
    //             console.log(`WARNING: Login was partial without TFA header`);

    //             return res.send({
    //                 "status": 206,
    //                 "message": "Please enter the Auth Code"
    //             });
    //         }
    //         let isVerified = speakeasy.totp.verify({
    //             secret: commons.userObject.tfa.secret,
    //             encoding: 'base32',
    //             token: req.headers['x-tfa']
    //         });

    //         if (isVerified) {
    //             console.log(`DEBUG: Login with TFA is verified to be successful`);

    //             return res.send({
    //                 "status": 200,
    //                 "message": "success"
    //             });
    //         } else {
    //             console.log(`ERROR: Invalid AUTH code`);

    //             return res.send({
    //                 "status": 206,
    //                 "message": "Invalid Auth Code"
    //             });
    //         }
    //     }
    // }

    // return res.send({
    //     "status": 404,
    //     "message": "Please register to login"
    // });
});

router.post('/login_tfa', (req, res) => {
    console.log(`DEBUG: Received login request 2`);

    const login_request = req.body;

    users.find({ uname: login_request.uname })
        .then(user => {
            if(user.length==0){
                res.send({
                    "status": 400,
                    "message": "No User Found"
                });
            }
            
            if(user[0].upass==login_request.upass){
                
                
                res.send({
                    "status": 200,
                    "message": "Password Matched"
                });
            }
        }).catch((error) => res.send(error));

});


module.exports = router;