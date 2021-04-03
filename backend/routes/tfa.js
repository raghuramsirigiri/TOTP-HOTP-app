
const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const commons = require('./commons');
const mongoose = require('../database/mongoose');
const users = require('../database/models/users');
const router = express.Router();

router.post('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received TFA setup request`);

    const tfa_req = req.body;

    users.find({ uname: tfa_req.uname })
        .then(find_user => {
            if(find_user[0].temp_login == tfa_req.temp_login){

                const secret = speakeasy.generateSecret({
                    length: 30,
                    name: tfa_req.uname,
                    issuer: 'Raghuram9758'
                });
                var url = speakeasy.otpauthURL({
                    secret: secret.base32,
                    label: tfa_req.uname,
                    issuer: 'Raghuram9758',
                    encoding: 'base32' //only for HOTP
                    // type: "hotp",
                    // counter: 9758
                });
                QRCode.toDataURL(url, (err, dataURL) => {
                    
                    const tfa_obj = {
                        secret: secret.base32,
                        tempSecret: "Not verified",
                        dataURL: dataURL,
                        tfaURL: url//for HOTP
                        // counter: 0
                    };
            
                    console.log(tfa_req);
                    console.log(tfa_obj);
            
                    users.findOneAndUpdate({ uname: tfa_req.uname }, {tfa: tfa_obj }, {new: true})
                        .then(user_new => res.send({
                            "status": 200,
                            "message": "TFA created",
                            "uname": user_new.uname,
                            "user_tfa": user_new.tfa
                        }))
                        .catch((error) => console.log(error));
                });

            }else{
                res.send({
                    "status": 400,
                    "message": "Invalid Login"
                })
            }
        })
        .catch((error) => {
            console.log(error);
            res.send({
                "status": 400,
                "message": "Invalid Login"
            })
        });


    
});

router.get('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received FETCH TFA request`);

    const tfa_req = req.body;

    users.find({ uname: tfa_req.uname })
    .then(find_user => {
        if(find_user[0].temp_login == tfa_req.temp_login){

            res.send({
                "status": 200,
                "uname": find_user[0].uname,
                "TFA": find_user[0].tfa
            })

        }else{
            res.send({
                "status": 400,
                "message": "Invalid Login"
            })
        }
    })
    .catch((error) => {
        console.log(error);
        res.send({
            "status": 400,
            "message": "Invalid Login"
        })
    });
});

router.delete('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received DELETE TFA request`);

    delete commons.userObject.tfa;
    res.send({
        "status": 200,
        "message": "success"
    });
});

router.post('/tfa/verify', (req, res) => {

    console.log(`DEBUG: Received TFA Verify request`);

    const tfa_req = req.body;

    users.find({ uname: tfa_req.uname })
    .then(find_user => {
        if(find_user[0].tfa.tempSecret == "Enabled"){

            let isVerified = speakeasy.totp.verify({
                secret: find_user[0].tfa.secret,
                encoding: 'base32',
                token: tfa_req.token,
                window:2
            });
        

            // let isVerified = speakeasy.hotp.verify({
            //     secret: find_user[0].tfa.secret,
            //     counter: find_user[0].tfa.counter,
            //     encoding: 'base32',
            //     token: tfa_req.token,
            //     window:2
            // });
            // console.log(isVerified);


            if (isVerified) {
                console.log(`DEBUG: TFA is verified`);
                // find_user[0].tfa.counter+= 1; //only for HOTP
                // console.log(find_user[0].tfa.counter);
                // users.findOneAndUpdate({ uname: tfa_req.uname }, {tfa: find_user[0].tfa }, {new: true})
                //         .then(res.send({
                //             "status": 200,
                //             "message": "Two-factor Auth verified successfully"
                //         }))
                //         .catch((error) => console.log(error));

                return res.send({
                            "status": 200,
                            "message": "Two-factor Auth verified successfully"
                        });
            }
        
            console.log(`ERROR: TFA is verified to be wrong`);
        
            return res.send({
                "status": 403,
                "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time or Enable TFA first."
            });

        }else{
            res.send({
                "status": 400,
                "message": "Invalid Login"
            })
        }
    })
    .catch((error) => {
        console.log(error);
        res.send({
            "status": 400,
            "message": "Invalid Login"
        })
    });

    
});

router.post('/tfa/enable', (req, res) => {

    console.log(`DEBUG: Received TFA Enable request`);

    const tfa_req = req.body;

    users.find({ uname: tfa_req.uname })
    .then(find_user => {
        if(find_user[0].temp_login == tfa_req.temp_login){

            let isVerified = speakeasy.totp.verify({
                secret: find_user[0].tfa.secret,
                encoding: 'base32',
                token: tfa_req.token,
                window:2
            });

            // let isVerified = speakeasy.hotp.verify({
            //     secret: find_user[0].tfa.secret,
            //     counter: 0,
            //     encoding: 'base32',
            //     token: tfa_req.token,
            //     window:2
            // });


            console.log(isVerified);

            find_user[0].tfa.tempSecret="Enabled";

            console.log(find_user[0]);
        
            if (isVerified) {
                // find_user[0].tfa.counter+= 1; //only for HOTP
                users.findOneAndUpdate({ uname: tfa_req.uname }, {tfa: find_user[0].tfa }, {new: true})
                        .then(user_new => res.send({
                            "status": 200,
                            "message": "TFA Enabled",
                            "uname": user_new.uname,
                        }))
                        .catch((error) => console.log(error));
                
                console.log(`DEBUG: TFA is Enabled`);
            }else{
                console.log(`ERROR: TFA is verified to be wrong`);
        
                return res.send({
                    "status": 403,
                    "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
                });
            }

        }else{
            res.send({
                "status": 400,
                "message": "Invalid Login"
            })
        }
    })
    .catch((error) => {
        console.log(error);
        res.send({
            "status": 400,
            "message": "Invalid Login"
        })
    });

    
});


module.exports = router;