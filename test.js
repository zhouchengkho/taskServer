/**
 * Created by zhoucheng on 8/16/16.
 */
var uuid = require('uuid');

function test() {

    this.getHighValue = function() {
        var high = [{
            key: uuid.v4(),
            url:'dasda'
        },{
            key: uuid.v4(),
            url:'sas'
        },{
            key: uuid.v4(),
            url:'dasda'
        },{
            key: uuid.v4(),
            url:'dasda'
        },{
            key: uuid.v4(),
            url:'dasdaff'
        }
        ];
        return high;
    }
    this.getLowValue = function() {
        var low = [{
            key: uuid.v4(),
            url:'fdfg'
        },{
            key: uuid.v4(),
            url:'utyh'
        },{
            key: uuid.v4(),
            url:'poggfd'
        },{
            key: uuid.v4(),
            url:'dasda'
        },{
            key: uuid.v4(),
            url:'dasjdaj'
        }];
        return low;
    }
}

module.exports = new test();