/**
 * Created by zhoucheng on 8/12/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
var test = require('./test');
var config = require('./config');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient({host: config.redisHost, port: config.redisPort});
var crawled_data = require('./model').crawled_data;
client.on('error', function(error) {
    console.log('error: '+error);
})



var high = config.high;
var low = config.low;
var handling = config.handling;
function task() {
    /**
     * right push for redis list
     * @param prior true for higher priority
     * @param value can be array or single value , can be string or json but always stored as string
     */
    this.rpush = function(prior, value) {
        var priority =  low; // default low
        if(prior) {
            priority = high;
        }

        if(value.constructor == Array) {
            var multi = client.multi();
            for (var i=0; i<value.length; i++) {
                //console.log(arr[i]);
                //將一個或多個值value插入到列表key的表尾。
                var result = value[i];
                if((typeof result) == 'object')
                {
                    result = JSON.stringify(result);
                }
                multi.rpush(priority, result);

            }
            multi.exec();
        } else {
            var result = value;
            if((typeof result) == 'object')
            {
                result = JSON.stringify(result);
            }
            client.rpush(priority, result);
        }
    }
    /**
     *  for test
     */
    this.initialize = function() {
        var high = test.getHighValue();
        var low = test.getLowValue();
        this.rpush(true, high);
        this.rpush(false, low);
    }
    /**
     * distribute task , first from high then low, if ran out of task
     * retrieve from server then recursively distribute
     * @param callback
     */
    this.distribute = function(callback) {
        // distribute high priority first
        var self = this;
        client.lrange(high, 0, -1, function(err, list) {
            if(list.length >= 1) { // exist high priority
                var result = JSON.parse(list[0]);
                client.hset(handling,result.key, list[0], function(err, res) {
                    client.lpop(high, function(err, res) {
                        callback(result);
                    })
                })
            } else { //get from low
                client.lrange(low, 0, -1, function(err, list) {
                    if(list.length >= 1) {
                      var result = JSON.parse(list[0]);
                      client.hset(handling,result.key, list[0], function(err, res) {
                          client.lpop(low, function(err, res) {
                              callback(result);
                          })
                      })

                  }  else { // task empty, refill
                      console.log('task ran out pick up new task');
                      self.initialize();
                      self.distribute(callback);
                  }
                })
            }
        })
    }
    /**
     * receive report from user, if success, store data in mysql
     * else put task back to waiting queue with low priority
     * @param key
     * @param status
     * @param data
     */
    this.report = function(key, status, data) {
        var self = this;
        if(status == 'success') { // store data in sql, delete key from handling
            console.log('store in sql');
            if((typeof data) == 'object')
                data = JSON.stringify(data);

            var toCreate = {};
            toCreate.key = key;
            toCreate.data = data;
            crawled_data.create(toCreate, function (err, res) {
                console.log(res);
                client.hdel(handling, key);
            })
        } else { // move key from handling to low
            client.hgetall(handling, function(err, res) {
                var result = res[key];
                if (result) {
                    self.rpush(false, result);
                    client.hdel(handling, key);
                }
            })
        }

    }
}


module.exports = new task();