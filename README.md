#TASK SERVER

##What does task server do
* Basically it retrieve task from server then distribute to users to finish and store feedback
* Uses Redis

##How to start
* Run `npm install` to install all the dependencies
* Make sure you configure in config.js first
* Run `nodemon index.js` to start server



##request data format
* request task format
```
{
  "taskCount": 2
}
```
* report format
```
{
  "status": "success",
  "data":[{
  	"taskId":"ec17fcb4-e1d3-4e7e-aaa0-c085eb0b46b0",
  	"customerData":{
  		"customerId":"keyun",
  		"uid":"dasdada"
  	},
  	"result":"dasdasdasdas"
  }]
}
```

> data can be array or json

* customer request format
```
{
	"customerId":"",
	"verifyCode":"",
	"uidSet":[]
}
```

> if !uidSet , default return all data


* general
```
{
  "taskCount": 2,
  "status": "fail",
  "data":[{
  	"taskId":"ec17fcb4-e1d3-4e7e-aaa0-c085eb0b46b0",
  	"customerData":{
  		"customerId":"keyun",
  		"uid":"dasdada"
  	},
  	"result":"dasdasdasdas"
  }],
  "customerId":"keyun",
  "verifyCode":"",
  "uidSet":["dasdada"]
}
```