(function() {
    Vue.component("some-component", {
        template: "#my-template",
        props: ["imageid"],
        data: function() {
            return {
                singleimage: [],
                comments: [],
                left: "",
                right: "",
                nextImgId: "",
                prevImgId: "",
                form: {
                    username: "",
                    comment: "",
                    imgid: ""
                }
            };
        },

        watch: {
            imageid: function() {
                var self = this;
                this.singleimage = [];
                this.comments = [];
                this.$emit("prog");

                axios
                    .get("/get-single-image?id=" + this.imageid)
                    .then(function(resp) {
                        if (resp.data.length == 0) {
                            self.$emit("close");
                        }

                        self.nextImgId = resp.data[0].next_id;
                        self.prevImgId = resp.data[0].prev_id;

                        if (self.nextImgId) {
                            self.left = "right";
                        } else {
                            self.left = "";
                        }

                        if (self.prevImgId) {
                            self.right = "left";
                        } else {
                            self.right = "";
                        }

                        self.singleimage.push(resp.data[0]);
                        for (var i = 1; i < resp.data.length; i++) {
                            self.comments.push(resp.data[i]);
                        }
                    });
            }
        },

        mounted: function() {
            var self = this;
            this.comments = [];

            this.$emit("prog");
            axios
                .get("/get-single-image?id=" + this.imageid)
                .then(function(resp) {
                    if (resp.data.length == 0) {
                        self.$emit("close");
                    }
                    self.nextImgId = resp.data[0].next_id;
                    self.prevImgId = resp.data[0].prev_id;

                    if (self.nextImgId) {
                        self.left = "right";
                    } else {
                        self.left = "";
                    }

                    if (self.prevImgId) {
                        self.right = "left";
                    } else {
                        self.right = "";
                    }

                    self.singleimage.push(resp.data[0]);
                    for (var i = 1; i < resp.data.length; i++) {
                        self.comments.push(resp.data[i]);
                    }
                });
        },

        methods: {
            closeComponent: function() {
                this.$emit("close");
            },

            next: function() {
                // this.singleimage = [];
                location.hash = "#" + this.prevImgId;
                // this.imageid = this.prevImgId;
            },

            prev: function() {
                // this.singleimage = [];
                location.hash = "#" + this.nextImgId;
                // this.imageid = this.nextImgId;
            },
            sendComment: function(e) {
                var self = this;
                e.preventDefault();

                var formData = {
                    c_username: this.form.username,
                    comment: this.form.comment,
                    imgid: this.imageid
                };

                axios.post("/get-single-image", formData).then(function(resp) {
                    if (resp.data.success) {
                        self.comments.unshift(resp.data.results[0]);
                    }

                    self.form = {};
                });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            imageId: location.hash.slice(1) || 0,
            limit: 12,
            showId: [12, 24, 36, "All"],
            classShow: "active",
            progress: "",
            progressactive: [],
            boxclass: "texts",
            tags: [],
            form: {
                title: "",
                description: "",
                username: "",
                tags: "",
                file: null
            }
        },
        mounted: function() {
            // setInterval(function() {
            //     console.log("he");
            // }, 3000);

            var self = this;

            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });

            self.progress = "progress";
            self.progressactive = [
                "progressbox progressbox--one",
                "progressbox progressbox--two",
                "progressbox progressbox--three"
            ];

            axios.get("/get-images?limit=" + this.limit).then(function(resp) {
                for (var j = 0; j < resp.data.length; j++) {
                    if (j < self.limit) {
                        self.images.push(resp.data[j]);
                    } else {
                        self.tags.push(resp.data[j]);
                    }
                }

                let objImg = new Image();
                for (var i = 0; i < self.images.length; i++) {
                    objImg.src = self.images[i].url;
                    objImg.onload = function() {
                        self.progress = "progress progress-inactive";
                        self.progressactive = [];
                    };
                }
            });
        },
        methods: {
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },

            // loadTag: function(e) {
            //
            //     self.progress = "progress";
            //     self.progressactive = [
            //         "progressbox progressbox--one",
            //         "progressbox progressbox--two",
            //         "progressbox progressbox--three"
            //     ];
            //
            //     axios
            //         .get(
            //             "/load-tags?id=" +
            //                 e.currentTarget.id +
            //                 "&limit=" +
            //                 this.limit
            //         )
            //         .then(function(resp) {
            //
            //             let objImg = new Image();
            //             for (var i = 0; i < self.images.length; i++) {
            //                 objImg.src = self.images[i].url;
            //                 objImg.onload = function() {
            //                     self.progress = "progress progress-inactive";
            //                     self.progressactive = [];
            //                 };
            //             }
            //
            //         });
            // },

            uploadFile: function(e) {
                var self = this;
                e.preventDefault();
                self.progress = "progress";
                self.progressactive = [
                    "progressbox progressbox--one",
                    "progressbox progressbox--two",
                    "progressbox progressbox--three"
                ];
                var formData = new FormData();

                formData.append("file", this.form.file);
                formData.append("title", this.form.title);
                formData.append("username", this.form.username);
                formData.append("description", this.form.description);
                formData.append("tags", this.form.tags);

                axios.post("/upload", formData).then(function(resp) {
                    if (resp.data.success) {
                        self.images.unshift(resp.data.results[0]);

                        let objImg = new Image();

                        objImg.src = resp.data.results[0].url;
                        objImg.onload = function() {
                            self.progress = "progress progress-inactive";
                            self.progressactive = [];
                        };

                        document.getElementById("fileform").value = "";
                        self.form = {};
                    }
                });
            },

            showComp: function(e) {
                this.imageId = e.currentTarget.id;
            },

            closeComp: function() {
                this.imageId = "";
            },

            progressChild: function() {
                this.progress = "progress";
                this.progressactive = [
                    "progressbox progressbox--one",
                    "progressbox progressbox--two",
                    "progressbox progressbox--three"
                ];

                var self = this;
                var newImgUrl = "";

                if (this.imageId.url == undefined) {
                    axios
                        .get("/get-single-image?id=" + self.imageId)
                        .then(function(resp) {
                            newImgUrl = resp.data[0].url;
                            let objImg = new Image();

                            objImg.src = newImgUrl;
                            objImg.onload = function() {
                                self.progress = "progress progress-inactive";
                                self.progressactive = [];
                            };
                        });
                }
            },

            // showText: function(e) {
            //     console.log(e.currentTarget);
            //     e.currentTarget.boxclass = "texts hover";
            // },

            getMoreImgages: function(e) {
                var lastId = this.images[this.images.length - 1].id;
                var queryString = "";

                if (e.currentTarget.id) {
                    if (e.currentTarget.id === "All") {
                        queryString = "?id=" + lastId;
                        this.classShow = "inactive";
                    } else {
                        var newLimit = "";
                        console.log("a this:", this.limit);
                        console.log("a current:", e.currentTarget.id);
                        if (this.limi < e.currentTarget.id) {
                            newLimit = e.currentTarget.id;
                        } else {
                            newLimit = e.currentTarget.id - this.limit;
                        }

                        queryString = "?id=" + lastId + "&limit=" + newLimit;
                    }
                } else {
                    queryString = "?id=" + lastId + "&limit=" + this.limit;
                }

                var self = this;

                self.progress = "progress";
                self.progressactive = [
                    "progressbox progressbox--one",
                    "progressbox progressbox--two",
                    "progressbox progressbox--three"
                ];

                axios.get("/more-picture" + queryString).then(function(resp) {
                    // self.images.push.apply(self.images, resp.data);

                    var dataLength = resp.data.length;

                    for (var i = 0; i < dataLength; i++) {
                        self.images.push(resp.data[i]);

                        let objImg = new Image();
                        for (var j = 0; j < self.images.length; j++) {
                            objImg.src = self.images[j].url;
                            objImg.onload = function() {
                                self.progress = "progress progress-inactive";
                                self.progressactive = [];
                            };
                        }
                    }

                    //bug
                    // if (self.classShow != "inactive") {
                    if (resp.data[0].count - dataLength == 0) {
                        self.classShow = "inactive";
                    }
                    // }
                });
            }
        }
    });
})();
