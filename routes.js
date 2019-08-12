var fs = require('fs');
var Shortener = require('./models/Shortener.js');
var http = require('http');
var https = require('https');

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
        var url = req.params['0'];
        if(testUrlSyntax(url)){
            testUrlWorking(url,res, function(result){
                if(result.valid){
                    console.log("valid URL: "+url+" - Status code: "+result.status);
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
                            if(results[0].id === undefined){
                                Shortener.find(function(err, result){
                                    var newId = result.length+1;
                                    var shortened = new Shortener({address: req.params['0'], id: newId, date: new Date()});
                                        shortened.save({upsert:true},function(err){
                                            if(err) return res.redirect(500, 'Database error');
                                            res.send(JSON.stringify({url:"http://nh-fcc-shortify.herokuapp.com/"+newId}));
                                        });
                                })
                            }else{
                                res.send(JSON.stringify({url:"http://nh-fcc-shortify.herokuapp.com/"+results[0].id}));    
                            }
                        }
                    });
                } else {
                    console.log("Invalid URL: "+url+" - Status code: "+result.status);
                    res.send(JSON.stringify({error:'Invalid url - Status code: '+result.status}));
                }
            });
        } else {
            console.log("URL not valid; requires 'http://' :"+url);
            res.send(JSON.stringify({error:"Invalid url - requires 'http(s)://' at start - URL: "+url}));
        }
    });
    
    function testUrlSyntax(url){
        var urlRegex = /http(s)?:\/{2}.*/;
        if(url.match(urlRegex)){
            return true;
        } else {
            return false;
        }
    }
    
    function testUrlWorking(url, res, callback){
        
        var status = String(http_res.statusCode);
        var badStatusRegex = /(4|5)\d{2}/;
        
        if (url.substr(0,4) === "http") {
            http.get(url, function(http_res){
                status = String(http_res.statusCode);
            }).on('error', function(err){
               console.log(err);
               res.send({error:"Invalid URL"})
            });
        else if (url.substr(0,5) === "https") {
            https.get(url, function(http_res){
                status = String(http_res.statusCode);
            }).on('error', function(err){
               console.log(err);
               res.send({error:"Invalid URL"})
            });
        } else { 
          status = "500";   
        }
            
        if(!status.match(badStatusRegex)){
            callback({valid:true,status:status});
        } else {
            callback({valid:false,status:status});
        }
    }
}
