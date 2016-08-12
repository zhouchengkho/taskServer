/**
 * Created by zhoucheng on 8/12/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient();

client.on('error', function(error) {
    console.log('error: '+error);
})

function task() {
    this.set = function (key, value) {
        client.set(key, value, redis.print);
    }
    this.hmset = function(key, value) {
        if((typeof value).toString() == 'string')
        {
            value = JSON.parse(value)
        }
        client.hmset(key, value, redis.print);
    }
    this.hset = function (key, value) {
        client.hset(key ,value, redis.print);
    }
    this.get = function (key, callback) {
        client.get(key, function(err, res) {
            // reply is null when the key is missing
            callback(res);
        });
    }
    this.hgetall = function (key, callback) {
        client.hgetall(key, function(err, res) {
            // reply is null when the key is missing
            callback(res);
        });
    }
    this.del = function(key) {
        client.del(key);
    }
    this.hdel = function(key, field) {
        client.hdel(key ,field);
    }




}


module.exports = new task();