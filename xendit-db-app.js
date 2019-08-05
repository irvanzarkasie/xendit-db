const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const MongoClient = require('mongodb').MongoClient;

// Enable express app
const app = express();

// Initialize environment variables
dotenv.config();

// Enable express to parse json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize POST request to logger app
const logger = {
  "log": function(logData){
    logData["service"] = process.env.APP_NAME;
    var loggerApp = {
      uri: ["http://", process.env.KUBE_LOGGER_SERVICE_HOST, ":", process.env.KUBE_LOGGER_SERVICE_PORT, process.env.LOGGER_APP_PATH].join(""),
      body: JSON.stringify(logData),
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }
    console.log(new Date().toISOString() + " Publish HTTP POST request to " + ["http://", process.env.KUBE_LOGGER_SERVICE_HOST, ":", process.env.KUBE_LOGGER_SERVICE_PORT, process.env.LOGGER_APP_PATH].join(""));
    request(loggerApp, function(error, response){});
  }
};

app.post("/db/insert", (req, res) => {
  console.log(new Date().toISOString() + " " + req.method + " " + req.originalUrl + " invoked");
  logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connecting to database"});
  const client = new MongoClient(["mongodb://", process.env.MONGODB_SERVICE_HOST, ":", process.env.MONGODB_SERVICE_PORT + "/"].join(""), { useNewUrlParser: true });
  client.connect(async function(err){
    try {
      const db = await client.db(req.body.database);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connected to database"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Using " + req.body.database + " database"});
      const collection = await db.collection(req.body.collection);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Preparing to insert into " + req.body.collection + " collection"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Inserting data into database", payload: req.body.payload});
      const insertStatus = await collection.insertOne(req.body.payload, (err, result) => {});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Finish inserting into database", payload: insertStatus});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Closing database connection"});
      client.close();
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Database connection closed"});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": "Success"
      };
    } catch(error){
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Failure in database operation", payload: error});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": "Failed"
      };
    }
    res.json(response);
  });
});

app.post("/db/query", (req, res) => {
  console.log(new Date().toISOString() + " " + req.method + " " + req.originalUrl + " invoked");
  logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connecting to database"});
  const client = new MongoClient(["mongodb://", process.env.MONGODB_SERVICE_HOST, ":", process.env.MONGODB_SERVICE_PORT + "/"].join(""), { useNewUrlParser: true });
  client.connect(async function(err){
    try {
      const db = await client.db(req.body.database);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connected to database"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Using " + req.body.database + " database"});
      const collection = await db.collection(req.body.collection);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Preparing query from " + req.body.collection + " collection"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Querying data from database", payload: req.body.payload});
      const queryResult = await collection.find(req.body.payload).toArray();
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Finished query from database", payload: queryResult});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Closing database connection"});
      client.close();
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Database connection closed"});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": (queryResult.length) ? "Success" : "Not Found",
        "payload": queryResult
      };
    } catch (error) {
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Failure in database operation", payload: error});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": "Failed"
      };
    }
    res.json(response);
  });
});

app.post("/db/delete", (req, res) => {
  console.log(new Date().toISOString() + " " + req.method + " " + req.originalUrl + " invoked");
  logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connecting to database"});
  const client = new MongoClient(["mongodb://", process.env.MONGODB_SERVICE_HOST, ":", process.env.MONGODB_SERVICE_PORT + "/"].join(""), { useNewUrlParser: true });
  client.connect(async function(err){
    try {
      const db = await client.db(req.body.database);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Connected to database"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Using " + req.body.database + " database"});
      const collection = await db.collection(req.body.collection);
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Preparing to delete data from " + req.body.collection + " collection"});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Deleting data from database", payload: req.body.payload});
      const queryResult = await collection.updateMany(req.body.payload, {$set:{visible:false}}, err, result => {});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Finished delete data from database", payload: queryResult});
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Closing database connection"});
      client.close();
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Database connection closed"});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": "Success"
      };
    } catch (error) {
      logger.log({id: req.body.reqId, method: req.method + " " + req.originalUrl, message: "Failure in database operation", payload: error});
      var response = {
        "reqId": req.body.reqId,
        "service": process.env.APP_NAME,
        "status": "Failed"
      };
    }
    res.json(response);
  });
});

var server = app.listen(process.env.APP_PORT, function () {
  console.log(new Date().toISOString() + " " + process.env.APP_NAME + " running on server", server.address());
  console.log(new Date().toISOString() + " " + process.env.APP_NAME + " running on port", server.address().port);
});
