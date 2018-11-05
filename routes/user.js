var User = require('../models/user');

exports.getAllUsers = function (req, res) {
    User.find({}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(user));
    })
};

exports.getUserImage = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var image = user[0].image;
        if (err) {
            res.send(err);
        } else if (image === "") {
            res.send({message: "no image"});
        } else {
            res.json({message: image});
        }
    })
};

exports.register = function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    User.findOne({username: {"$regex": "^" + username + "\\b", "$options": "i"}}, function (err, user) {
        User.findOne({email: {"$regex": "^" + email + "\\b", "$options": "i"}}, function (err, mail) {
            if (user || mail) {
                res.json({message: "Username or email already exists", data: user});
            } else {
                var newUser = new User({
                    username: username,
                    password: password,
                    email: email,
                    name: name,
                    image: '',
                    userMusic: [],
                    events: []
                });

                User.createUser(newUser, function (err, user) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({message: "User info was saved.", data: user});
                        console.log(user);
                    }
                });
            }
        });
    });
};

exports.updateUser = function (req, res) {
    User.updateOne({_id: req.params._id}, {
        userEmail: req.body.userName,
        userName: req.body.userName,
        userPassword: req.body.userPassword
    }, function (err, num, raw) {
        if (err) {
            res.send(err);
        }
        res.json(num);
    });
};

exports.addUserEvent = function (req, res) {
    var event = {
        doctor: req.body.doctor,
        time: req.body.time,
        date: req.body.date,
        task: req.body.task
    };

    User.updateOne({username: req.params.username}, {
        $push: {
            events: event
        }
    }, function (err, task, raw) {
        if (err) {
            res.send(err);
        }
        res.json({task: task, message: "event added"});
    });
};

exports.deleteUser = function (req, res) {
    User.deleteOne({_id: req.params._id}, function (err) {
        if (err) {
            res.send(err);
        }
        res.json({message: "User was deleted"});
    });
};

exports.login = function (req, res, done) {
    User.findOne({username: req.body.username}, function (err, user) {
        if (err) {
            // res.json({message: err});
            res.send("error", err)
        }
        if (!user) {
            res.send("Not a valid user");
        } else {
            User.comparePassword(req.body.password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    res.send("success");
                } else {
                    res.send("Invalid password");
                }
            });
        }
    })
};

exports.logout = function (req, res) {
    req.logout();
    res.send("Logout success")
};

//----------------------------------USER IMAGE UPLOAD----------------------------------
const userImageUpload = require('../services/user-image-upload');
const userImgSingleUpload = userImageUpload.single('image');

exports.addUserImage = function (req, res) {
    userImgSingleUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            res.json({message: err})
        } else {
            User.updateOne({username: req.params.username}, {
                image: req.file.location
            }, function (err) {
                if (err) {
                    res.send(err);
                    res.json({message: "image upload failed"})
                } else {
                    res.json({message: "image saved", imageURL: req.file.location})
                }
            })
        }
    });
};

//----------------------------------GET ALL USERS UPLOADED MUSIC----------------------------------
exports.getAllMusic = function (req, res) {
    User.find({}, {username: 1, userMusic: 1}, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data)
        }
    })
};

//----------------------------------GET SINGLE USER UPLOADED MUSIC----------------------------------
exports.getSingleUserMusic = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.json({music: user[0].userMusic, listSize: user[0].userMusic.length})
        }
    })
};


//----------------------------------USER MUSIC UPLOAD----------------------------------
const userMusicUpload = require('../services/music-upload');
const userMusicSingleUpload = userMusicUpload.single('song');

exports.uploadMusic = function (req, res) {
    userMusicSingleUpload(req, res, function (err) {
        if (err) {
            res.json({message: err})
        } else {
            var currentIndex;
            User.findOne({username: req.params.username}).then((result) => {
                currentIndex = result.userMusic.length;
            }).then(function () {
                var uploadedMusic = {
                    id: currentIndex,
                    title: "",
                    genre: "",
                    description: "",
                    coverArtUrl: "https://music-on-app.s3.amazonaws.com/uploads/userImage/1541169939150no_cover.png",
                    songUrl: req.file.location
                };

                User.updateOne({username: req.params.username}, {
                    $push: {
                        userMusic: uploadedMusic
                    }
                }, function (err) {
                    if (err) {
                        res.send(err);
                        res.json({message: "music upload failed"})
                    } else {
                        res.json({message: "song saved", songURL: req.file.location, data: req.file})
                    }
                })
            });
        }
    });
};


//----------------------------------MUSIC DETAILS/COVER ART UPLOAD----------------------------------
const userCoverArtUpload = require('../services/cover-art-upload');
const userCoverArtSingleUpload = userCoverArtUpload.single('coverArtUrl');
var lastUploadIndex;
var lastUploadID;

exports.updateMusicDetailsImmediately = function (req, res) {
    userCoverArtSingleUpload(req, res, function (err) {
        if (err) {
            res.send(err);
            res.json({message: err})
        } else {
            var username = req.params.username;
            var title = req.body.title;
            var genre = req.body.genre;
            var description = req.body.description;
            var coverArtUrl = req.file.location;
            
            User.findOne({username: req.params.username}).then((result) => {
                lastUploadIndex = result.userMusic.length - 1;
                lastUploadID = result.userMusic[lastUploadIndex]._id;
            }).then(function () {
                User.updateOne({username: username, "userMusic.id": lastUploadIndex},
                    {
                        $set: {
                            "userMusic.$.title": title,
                            "userMusic.$.genre": genre,
                            "userMusic.$.description": description,
                            "userMusic.$.coverArtUrl": coverArtUrl
                        }
                    }, function (err) {
                        if (err) {
                            res.send(err);
                            res.json({message: "upload failed"})
                        } else {
                            res.json({message: "music details saved", lastUploadIndex: lastUploadIndex, lastUploadID: lastUploadID});
                        }
                    }
                )
            });
        }
    });
};
