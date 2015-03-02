'use strict';

var MongoClient = require('mongodb').MongoClient;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var mongoEventer;
var config, logSender;

function MongoEventer(log,configValues) {
	
	config = configValues;
	logSender = log;

	MongoEventer.init.call(this);
}

MongoEventer.init = function() {
	EventEmitter.call(this);
	mongoEventer = this;

	mongoEventer.on('connectToDatabase', connect);
    mongoEventer.on('connectedToDatabase', getCollection);
    mongoEventer.on('hasDbCollection', function(eventObject) {
        var parentObj = mongoEventer;
        if (eventObject.parentObject) {
            parentObj = eventObject.parentObject;
        }
        parentObj.emit(eventObject.returnEvent, eventObject);
    });
};

util.inherits(MongoEventer, EventEmitter);


function getCollection(eventObject) {
    eventObject.db.collection(eventObject.collectionName, function(err, col) {
        if (err) {
            logSender.error(err);            
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
            return;
        }

        eventObject.db = db;
        mongoEventer.emit('connectedToDatabase', eventObject);
    });
}

module.exports = MongoEventer;
