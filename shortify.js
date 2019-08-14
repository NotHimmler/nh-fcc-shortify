var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path')

//handlebars config
var hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: '.hbs',
})
app.engine('.hbs', hbs.engine);
app.set('views', path.join(__dirname+"/views"));
app.set('view engine','.hbs');
app.use(express.static(__dirname + "/public"));

//mongoose config
let connectionString = null;
if(process.env.DEV === "true") {
    var credentials = require('./credentials.js');
    connectionString = credentials.mongo.development.connectionString;
} else {
    var user = process.env.MONGO_USER;
    var pass = process.env.MONGO_PASS;
    connectionString = `mongodb://${user}:${pass}@ds058548.mlab.com:58548/shortify`;
}

mongoose.connect(connectionString, {server : {keepAlive:1,}});

app.set('port', process.env.PORT || 5000);

require('./routes.js')(app);

app.use(function(req, res){
    res.status(404);
    res.render('404')
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(app.get('port'), function(){
    console.log("Shortify running at http://localhost:"+ app.get('port')+ "\nPress Ctrl+C to terminate.");
})