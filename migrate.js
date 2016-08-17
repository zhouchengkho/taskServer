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


sequelize.getQueryInterface().createTable('test', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: Sequelize.STRING,
        allowNull: false
    },
    data: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    }
})

