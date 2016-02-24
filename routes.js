var fs = require('fs');
var Shortener = require('./models/Shortener.js');

module.exports = function(app){
    app.get('/', function(req, res){
        res.render('home');
    });
    
    app.get('/:id', function(req, res){
        Shortener.find({id: req.params.id}, function(err, results){
           if(err) return res.redirect(500, 'Database Error');
           if(results.length === 0) return res.send(JSON.stringify({url:null}));
           if(results.length > 0){
               res.redirect(results[0].address);
           }
        });
    });
    
    app.get('/shorten/*', function(req, res){
       //Check if valid url
       var regex = /(http\:\/\/www.\w+\.com?\/?\w+)/;
       if (req.params['0'].match(regex)){
           Shortener.find({address:req.params['0']}, function(err, results){
               if(err) return res.redirect(500, 'Database error');
               if(results.length === 0){
                   Shortener.find(function(err, result){
                       var newId = result.length+1;
                       var shortened = new Shortener({address: req.params['0'], id: newId, date: new Date()});
                        shortened.save(function(err){
                            if(err) return res.redirect(500, 'Database error');
                            res.send(JSON.stringify({url:"http://nh-fcc-shortify.herokuapp.com/"+newId}));
                        });
                   })
               } else {
                   res.send(JSON.stringify({url:"http://nh-fcc-shortify.herokuapp.com/"+results[0].id}));
               }
           })
       } else {
           res.send(JSON.stringify({error:'Invalid url'}));
           console.log(req.params.url);
       } 
    });
}