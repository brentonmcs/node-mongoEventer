'use strict';

var MongoClient = require('mongodb').MongoClient;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var mongoEventer;
var config, logSender;

function MongoEventer(log,configValues) {

	console.log(configValues);
	config = configValues;
	logSender = log;

	MongoEventer.init.call(this);
}

MongoEventer.init = function() {
	EventEmitter.call(this);
	mongoEventer = this;

	console.log('setting up events');
	mongoEventer.on('connectToDatabase', connect);
    mongoEventer.on('connectedToDatabase', getCollection);
    mongoEventer.on('hasDbCollection', function(eventObject) {
        mongoEventer.emit(eventObject.returnEvent, eventObject);
    });
};

util.inherits(MongoEventer, EventEmitter);


function getCollection(eventObject) {
    eventObject.db.collection(eventObject.collectionName, function(err, col) {
        if (err) {
            logSender.error(err);
            console.log(err);
            return;
        }
        eventObject.collection = col;
        mongoEventer.emit('hasDbCollection', eventObject);
    });
}


function connect(eventObject) {
    MongoClient.connect(config.mongoUri, function(err, db) {
        if (err) {
            logSender.error(err);
            console.log(err);
            return;
        }

        eventObject.db = db;
        mongoEventer.emit('connectedToDatabase', eventObject);
    });
}

module.exports = MongoEventer;
