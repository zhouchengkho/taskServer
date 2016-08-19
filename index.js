/**
 * Created by zhoucheng on 8/12/16.
 */
var express = require('express');
var app = express();
var task = require('./task');
var schedule = require('node-schedule');
var test = require('./test');
var config = require('./config');
var promise = require('bluebird');
promise.promisifyAll(task);
app.post('/requesttask', function(req,res) {
    console.log('request task');
    var key = req.query.key; // template script both
    var customerData = req.query.data;
    var data = {
        customerData:{
            custId:'',
            verifyCode:''
        },
        taskCount: 5
    }

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
    var status = req.query.status;
    var key = req.query.key;
    var customerData = {
        custId: 'custnjfkfkjwenfwknasdja',
        verifyCode: 'dkjasndjkak'
    }
    var data = {
        result: {
            content: 'test'
        },
        task: {
            taskId: key,
            template: {
                templateId: '',
                content: ''
            }
        }
    }
    task.report(status, data, customerData, function(err) {
        console.log('incoming report')
        if(err)
            res.status(200).send('error: '+err);
        else
            res.status(200).send('success')
    });
})

app.post('/filltask', function(req, res) {
    console.log('fill task')
    task.initialize(function(){})
    res.status(200).send('success');
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
