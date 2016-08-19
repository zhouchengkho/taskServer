/**
 * Created by zhoucheng on 8/12/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
var test = require('./test');
var config = require('./config');
var error = require('./error');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});
var crawled_data = require('./model').crawled_data;
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on('error', function(error) {
    console.log('error: '+error);
})


var high = config.high;
var low = config.low;
var handling = config.handling;
var script = config.script;
var scriptKey = config.scriptKey;
var maxTaskCount = config.maxTaskCount;
function task() {
    /**
     * right push for redis list
     * @param prior true for higher priority
     * @param value can be array or single value , can be string or json but always stored as string
     * @param callback
     */
    this.rpush = function(prior, value, callback) {
        var priority =  low; // default low
        if(prior) {
            priority = high;
        }

        if(value.constructor == Array) {
            var multi = client.multi();
            for (var i=0; i<value.length; i++) {
                //將一個或多個值value插入到列表key的表尾。
                var result = value[i];
                if((typeof result) == 'object')
                {
                    result = JSON.stringify(result);
                }
                multi.rpushAsync(priority, result).catch(function(err){return callback(err)});
            }
            multi.exec();
        } else {
            var result = value;
            if((typeof result) == 'object')
            {
                result = JSON.stringify(result);
            }
            client.rpushAsync(priority, result).catch(function(err){return callback(err)});
        }
    }
    /**
     *  for test
     */
    this.initialize = function(callback) {
        var high = test.getHighValue();
        var low = test.getLowValue();
        this.rpush(true, high);
        this.rpush(false, low);
        return callback()
    }
    /**
     * distribute task or script or both
     * @param key should be task, script, both
     * @param data include customerData & count
     * @param callback err, data  keep err null if no error
     */
    this.distribute = function(key, data, callback) {
        var customerData = data.customerData;
        var count = data.taskCount ? data.taskCount : 1;
        var self = this;
        self.verifyCustomer(customerData.custId, customerData.verifyCode, function(valid){
            if(!valid)
                return callback(new Error(error.verifyFail))
            switch (key) {
                case 'task':
                    self.getTask(count, function(err, res) {
                        return callback(err, res)
                    })
                    break;
                case 'script':
                    self.getScript(scriptKey, function (err, res) {
                        return callback(err, res)
                    })
                    break;
                case 'both':
                    self.getScript(scriptKey, function (scriptErr, scriptRes) {
                        if(scriptErr) return callback(scriptErr)
                        self.getTask(count, function(taskErr, taskRes) {
                            var res = {
                                taskRes: taskRes,
                                scriptRes: scriptRes
                            }
                            return callback(taskErr, res)
                        })
                    })

                    break;
                default:
                    return callback(new Error(error.unknownkey))
                    break;
            }})
    }
    this.getTask = function(count, callback) {
        if(count > maxTaskCount) {
            return callback(new Error(error.countToBig))
        }
        var result = [];

        client.lrangeAsync(high, 0, -1).then(function (highList) {
            var highLen = highList.length ?  highList.length : 0;
            if(highLen >= 1) { // get task from high priority
                // var result = JSON.parse(list[0]);
                var i = 0;
                while(i < highLen && count > 0 ) {
                    var res = JSON.parse(highList[i])
                    result.push(res)
                    client.hset(handling, res.taskId, highList[i]);
                    client.lpop(high);
                    i++; count--;
                }
            }
            return count;
        }).then(function(count) {
            if(count > 0) {
                client.lrangeAsync(low, 0, -1).then(function(lowList) {
                    var lowLen = lowList.length ? lowList.length : 0;
                    if(lowLen >= 1) { // get task from high priority
                        var i = 0;
                        while(i < lowLen && count > 0 ) {
                            var res = JSON.parse(lowList[i])
                            result.push(res)
                            client.hset(handling, res.taskId, lowList[i]);
                            client.lpop(low);
                            i++; count--;
                        }
                    }
                    return callback(null ,result)
                }).catch(function(err){ return callback(err)})
            } else {
                return callback(null, result)
            }
        }).catch(function(err){return callback(err)})
    }
    
    this.getScript = function(key, callback) {
        client.hgetallAsync(script).then(function (res) {
            return res[key];
        }).then(function(resScript){
            if(resScript)
                return callback(null, resScript)
            return callback(new Error(error.emptyScript))
        }).catch(function(err){return callback(err)})
    }
    /**
     * receive report from user, if success, store data as result_customerId
     * else put task back to waiting queue with low priority
     * @param status
     * @param data
     * @param customerData
     * @param callback
     * @returns {*}
     */
    this.report = function(status, data, customerData, callback) {

        var self = this;
        self.verifyCustomer(customerData.custId, customerData.verifyCode, function(valid) {
            if(!valid)
                return callback(new Error(error.verifyFail))

            switch(status) {
                case 'success':
                    var key = 'result_'+customerData.custId;
                    var field;
                    var result;
                    if(data.constructor == Array) {
                        var fieldAndResultArray = []
                        for (var i=0; i<data.length; i++) {
                            field = data[i].task.taskId;
                            result = data[i].result;
                            fieldAndResultArray.push(field)
                            fieldAndResultArray.push((typeof result == 'object') ? JSON.stringify(result) : result)
                            client.hdel(handling, field);
                        }
                        client.hmsetAsync(key, fieldAndResultArray).catch(function(err){return callback(err)})
                    } else {
                        field = data.task.taskId;
                        result = data.result;
                        if((typeof  result) == 'object')
                            result = JSON.stringify(result);
                        client.hset(key, field, result);
                        client.hdel(handling, field);
                    }
                    break;
                default:
                    if(data.constructor == Array) {
                        client.hgetallAsync(handling).then(function(res) {
                            return res;
                        }).then(function(res){
                            for (var i=0; i<data.length; i++) {
                                var taskId = data[i].task.taskId;
                                var result = res[data[i].task.taskId]
                                if (result) {
                                    self.rpush(false, result);
                                    client.hdel(handling, taskId);
                                }
                            }
                        }).catch(function(err){return callback(err)})
                    }
                    else {
                        client.hgetallAsync(handling).then(function(res) {
                            return res[data.task.taskId];
                        }).then(function(result){
                            if (result) {
                                self.rpush(false, result);
                                client.hdel(handling, data.task.taskId);
                            }
                        }).catch(function(err){return callback(err)})
                    }
                    break;
            }
        })
        return callback()
    }


    this.verifyCustomer = function(custId, verifyCode, callback) {
        callback(true)
    }
}


module.exports = new task();