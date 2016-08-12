/**
 * Created by zhoucheng on 8/12/16.
 */
var express = require('express');
var app = express();
var task = require('./task');
var schedule = require('node-schedule');

app.post('/set', function(req, res) {
    var key = req.query.key;
    var value = req.query.value;
    task.set(key ,value);
    res.status(200).send('success');
})

app.post('/hset', function (req, res) {
    var key = req.query.key;
    var value = req.query.value;
    task.hset(key ,value);
    res.status(200).send('success');
})

app.post('/hmset', function (req, res) {
    var key = req.query.key;
    var value = req.query.value;
    console.log(key+' '+value);
    task.hmset(key ,value);
    res.status(200).send('success');
})

app.get('/get', function(req, res) {
    var key = req.query.key;
    task.get(key, function(result){
        res.status(200).send(result);
    });
})

app.delete('/del', function(req, res) {
    var key = req.query.key;
    task.del(key);
    res.status(200).send('success');
})

app.delete('/hdel', function (req, res) {
    var key = req.query.key;
    var field = req.query.field;
    task.hdel(key, field);
})
app.post('/requesttask', function(req,res) {
    res.status(200).send('get request task');
})

schedule.scheduleJob({hour:0, minute:0, dayOfWeek:0}, function(){ // pick up task at sunday 00:00:00
    console.log('pick up new task');
});
app.listen(3000);