var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path')
var credentials = require('./credentials.js');

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
mongoose.connect(credentials.mongo.development.connectionString, {server : {keepAlive:1,}});

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