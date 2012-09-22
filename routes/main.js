app.get('/', function(req, res) {
  res.render('main.jade'
    , {config: config
      ,req:req
    });
});

app.get('/twitter/logout', function(req, res){
  req.session.twitterScreenName = null;
  res.redirect('/');
});


// if(req.session.twitterScreenName.toLowerCase() == config.twitter.username.toLowerCase()){
// redis.set("oauthAccessToken", req.session.oauthAccessToken);
// redis.set("oauthAccessTokenSecret", req.session.oauthAccessTokenSecret);
// }