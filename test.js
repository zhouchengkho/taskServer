/**
 * Created by zhoucheng on 8/16/16.
 */
var uuid = require('uuid');

function test() {

    this.getHighValue = function() {
        var high = [{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        }
        ];
        return high;
    }
    this.getLowValue = function() {
        var low = [{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        },{
            taskId: uuid.v4(),
            template: {
                templateId:'test',
                content:'test'
            }
        }];
        return low;
    }
}

module.exports = new test();