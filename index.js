const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const bodyParser = require("body-parser");

var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(bodyParser.json());

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory

    if (req.file) {
        const s3 = require("./config.json");
        var fileurl = s3.s3Url + req.file.filename;

        db.uploadPicture(
            fileurl,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(results => {
                if (req.body.tags != "") {
                    var tagArray = req.body.tags.split(", ");

                    for (var i = 0; i < tagArray.length; i++) {
                        db.setTags_name(tagArray[i])
                            .then(tags => {
                                db.setTag_map(
                                    results.rows[0].id,
                                    tags.rows[0].id
                                )
                                    .then(() => {
                                        console.log("ready");
                                    })
                                    .catch(err => {
                                        console.log("error by tagmap: ", err);
                                    });
                            })
                            .catch(err => {
                                console.log("erro by tagname: ", err);
                            });
                    }
                }

                res.json({
                    results: results.rows,
                    success: true
                });
            })
            .catch(err => {
                console.log("error here: ", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/get-single-image", (req, res) => {
    db.getSinglePicture(req.query.id)
        .then(results => {
            db.getComments(req.query.id).then(comments => {
                var forJson = results.rows;

                for (var i = 0; i < comments.rows.length; i++) {
                    forJson.push(comments.rows[i]);
                }
                res.json(forJson);
            });
        })
        .catch(err => {
            res.json({ success: "false" });
            console.log(err);
        });
});

app.post("/get-single-image", (req, res) => {
    db.sendComment(req.body.c_username, req.body.comment, req.body.imgid)
        .then(results => {
            res.json({
                results: results.rows,
                success: true
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/get-images", (req, res) => {
    db.getPictureUrl(req.query.limit)
        .then(results => {
            db.getAllTagId().then(tags => {
                var forJson = results.rows;
                for (var i = 0; i < tags.rows.length; i++) {
                    forJson.push(tags.rows[i]);
                }
                res.json(forJson);
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/more-picture", (req, res) => {
    db.getMorePicture(req.query.id, req.query.limit)
        .then(results => {
            res.json(results.rows);
        })
        .catch(err => {
            console.log("!", err);
        });
});

app.get("/load-tags", (req, res) => {
    var forJson = [];

    db.getTagsImgId(req.query.id)
        .then(results => {
            for (var i = 0; i < results.rows.length; i++) {
                db.getImageByTag(results.rows[i].img_id).then(images => {
                    forJson.push(images.rows[i]);
                    // console.log("images.rows", images.rows);
                });
                console.log("atadva: ", forJson);
            }
            // res.json(results.rows);
        })

        .catch(err => {
            console.log(err);
        });
});

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.listen(8080, () => console.log("its run"));
