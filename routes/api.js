/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
var dotenv = require("dotenv");

const CONNECTION_STRING = process.env.MONGOLAB_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {



    app.route('/api/issues/:project')

        .get(function(req, res) {
            var project = req.params.project;
            var query = req.query;

            MongoClient.connect(CONNECTION_STRING, function(err, db) {
                var collection = db.collection(project)
                collection.find(query).toArray(function(err, doc) {
                    if (doc) {
                        res.json(doc)
                    }
                })
            })
        })

        .post(function(req, res) {
            var project = req.params.project;
            var issue = {
                _id: randomstring.generate(7),
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to,
                status_text: req.body.status_text,
                created_on: dateFormat(),
                status: "open"
            }
            //console.log(issue)
            if (!issue.issue_title) {
                res.send("Title of issue required")
            } else if (!issue.issue_text) {
                res.send("Please describe the issue")
            } else if (!issue.created_by) {
                res.send("Please enter in a name")
            } else {
                MongoClient.connect(CONNECTION_STRING, function(err, db) {
                    var collection = db.collection(project)
                    collection.insert(issue)
                    res.json(issue)
                })
            }
        })

        .put(function(req, res) {
            var project = req.params.project;
            var updateId = req.body._id;
            var status = !req.body.open ? "open" : "closed";
            var issue = {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to,
                status_text: req.body.status_text
            }

            if (!updateId) {
                res.send("Please enter in an Id ")
            } else if (!issue.issue_title && !issue.issue_text && !issue.assigned_to && !issue.status_text) {
                res.send("Nothing was updated")
            } else {
                MongoClient.connect(CONNECTION_STRING, function(err, db) {
                    var collection = db.collection(project)

                    collection.find({
                        _id: updateId
                    }, function(err, doc) {
                        if (updateId) {
                            collection.update({
                                _id: updateId
                            }, {
                                $set: {
                                    issue_title: req.body.issue_title,
                                    issue_text: req.body.issue_text,
                                    created_by: req.body.created_by,
                                    assigned_to: req.body.assigned_to,
                                    status_text: req.body.status_text,
                                    status: status,
                                    updated_on: dateFormat(),
                                }
                            })
                            res.json("Successfully updated on " + "ID " + updateId + " on " + dateFormat())
                        } else {
                            res.send("ID not found")
                        }
                    })

                })
            }
        })

        .delete(function(req, res) {
            var project = req.params.project;
            var deleteId = req.body._id

            if (deleteId === "") {
                res.send("Enter an Id")
            } else {
                MongoClient.connect(CONNECTION_STRING, function(err, db) {
                    var collection = db.collection(project)
                    collection.findOne({
                        _id: req.body._id
                    }, function(err, doc) {
                        if (doc) {
                            collection.remove(doc)
                            res.send("ID " + deleteId + " has been deleted.")
                        } else {
                            res.send("ID " + deleteId + " not found")
                        }

                    })

                })
            }


        });

};
