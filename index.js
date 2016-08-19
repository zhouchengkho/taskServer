/**
 * Created by zhoucheng on 8/12/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var multer = require('multer'); // v1.0.5
// var upload = multer(); // for parsing multipart/form-data
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var task = require('./task');
var schedule = require('node-schedule');
var test = require('./test');
var config = require('./config');
var promise = require('bluebird');
promise.promisifyAll(task);
app.post('/requesttask', function(req,res) {
    console.log('request task');
    var key = 'task'
    var data = req.body
    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send('request failed: '+err)
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

app.post('/requestscript', function(req,res) {
    console.log('request script');
    var key = 'script';
    var data = req.body

    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send('request failed: '+err)
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

app.post('/requestboth', function(req,res) {
    console.log('request both');
    var key = 'both';
    var data = req.body

    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send('request failed: '+err)
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

app.post('/report', function(req, res) {
    console.log('incoming report')
    var data = req.body;
    task.report(data, function(err) {
        if(err)
            res.status(200).send('error: '+err);
        else
            res.status(200).send('success')
    });
})

app.post('/filltask', function(req, res) {
    console.log('fill task');
    task.initialize()
    res.status(200).send('success');
})

app.post('/customerrequest', function(req, res) {
    console.log('customer pickup')
    task.getResult(req.body, function(err, data) {
        if(err) {
            res.status(200).send('error: '+err)
        } else {
            res.status(200).send(data)
        }
    })
})
//var times = [];
//var rule = new schedule.RecurrenceRule();
//rule.second = times;
//for(var i=1; i<60; i=i+2){
//    times.push(i);
//}
//schedule.scheduleJob(rule, function() { // test pick up task
//    console.log('request task');
//    var key = 'task';
//    var data = {
//        customerData: {custId:'', verifyCode:''},
//        taskCount: 1
//    };
//    task.distributeAsync(key, data).then(function(res) {
//        console.log('item distributed: '+JSON.stringify(res));
//    }).catch(function (err) {console.log('error: '+err)});
//});
//
//schedule.scheduleJob({hour:0, minute:0, dayOfWeek:0}, function(){ // pick up task at sunday 00:00:00
//    console.log('pick up new task');
//});
console.log('server running at '+config.serverPort);
app.listen(config.serverPort);
