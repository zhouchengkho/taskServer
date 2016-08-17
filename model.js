/**
 * Created by zhoucheng on 8/17/16.
 */
var config = require('./config');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(config.mysqlDB, config.mysqlUser, config.mysqlPassword, {
    host: config.mysqlHost,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

var crawled_data = sequelize.define('crawled_data', {
    key: {
        type: Sequelize.STRING,
        field: 'key'
    },
    data:{
        type: Sequelize.STRING,
        field: 'data'
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

module.exports.crawled_data = crawled_data;
