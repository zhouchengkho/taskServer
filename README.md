#TASK SERVER

##What does task server do
* Basically it retrieve task from server then distribute to users to finish and store feedback
* Uses Redis & MySql

##How to start
* Run `npm install` to install all the dependencies
* Make sure you configure in config.js first
* Run `node migrate.js` to migrate mysql database
* Run `nodemon index.js` to start server
