/**
 * Created by zhoucheng on 8/12/16.
 */
var express = require('express');
var app = express();
var task = require('./task');
var schedule = require('node-schedule');
var test = require('./test');

app.post('/requesttask', function(req,res) {
    console.log('request task');
    task.distribute(function(data) {
        console.log('item distributed: '+JSON.stringify(data));
    });
    res.status(200).send('get request task');
})

app.post('/report', function(req, res) {
    var key = req.query.key;
    var status = req.query.status;
    var data = req.query.data;
    task.report(key, status, data);
    res.status(200).send('get request task');

})

var times = [];
var rule = new schedule.RecurrenceRule();
rule.second = times;
for(var i=1; i<60; i=i+2){
    times.push(i);
}
schedule.scheduleJob(rule, function() { // test pick up task
    console.log('request task');
    task.distribute(function(res) {
        console.log('item distributed: '+JSON.stringify(res));
    });
});

schedule.scheduleJob({hour:0, minute:0, dayOfWeek:0}, function(){ // pick up task at sunday 00:00:00
    console.log('pick up new task');
});
app.listen(3000);
