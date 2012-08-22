function twitter() {
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token"
    , "https://twitter.com/oauth/access_token"
    , config.apis.twitter.consumer_key
    , config.apis.twitter.consumer_secret
    , "1.0A"
    , config.orign + "/twitter/callback"
    , "HMAC-SHA1");   
}

app.get('/twitter/connect', function(req, res){
  twitter().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
    }
  });
});

app.get('/twitter/auth', function(req, res){
  twitter().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authenticate?oauth_token="+req.session.oauthRequestToken);      
    }
  });
});

app.get('/twitter/callback', function(req, res){
  console.log(req.session.oauthRequestToken);
  console.log(req.session.oauthRequestTokenSecret);
  console.log(req.query.oauth_verifier);

  twitter().getOAuthAccessToken(req.session.oauthRequestToken
                                , req.session.oauthRequestTokenSecret
                                , req.query.oauth_verifier
                                , function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      // Right here is where we would write out some nice user stuff
      twitter().get("http://twitter.com/account/verify_credentials.json"
        , req.session.oauthAccessToken
        , req.session.oauthAccessTokenSecret
        , function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
          //TODO check first time, grant 1000 coins
          data = JSON.parse(data);
          req.session.twitterScreenName = data["screen_name"];      
          if(req.session.twitterScreenName.toLowerCase() == config.twitter.username.toLowerCase()){
            redis.set("oauthAccessToken", req.session.oauthAccessToken);
            redis.set("oauthAccessTokenSecret", req.session.oauthAccessTokenSecret);
          }
          res.redirect('/');
        }  
      });  
    }
  });
});

app.get('/twitter/logout', function(req, res){
  req.session.twitterScreenName = null;
  res.redirect('/');
});


/* Grnat 1000 coins */
app.get('/twitter/grant', function(req, res){
  redis.get("oauthAccessToken",function(err, reply) {
    var oauthAccessToken = reply.toString()
    redis.get("oauthAccessTokenSecret",function(err, reply) {
      var oauthAccessTokenSecret = reply.toString()
      var from = config.twitter.username
      , to = req.session.twitterScreenName.toLowerCase()
      , amount = 1000
      var body = {
        'status': '%d twitcoins sent from @%s to @%s'
      };
      body.status = util.format(body.status
        ,amount
        ,from
        ,to
      )
      twitter().post("https://api.twitter.com/1/statuses/update.json"
                  , oauthAccessToken
                  , oauthAccessTokenSecret
                  , body
                  , "application/json"
                  , function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
          console.log("data is %j", data);
          data = JSON.parse(data);
          req.session.twitterScreenName = data["screen_name"];    
          res.redirect('/');
        }  
      }); 
    })
  })
});

app.get('/twitter/send/:to/:amount', function(req, res){
  var from = req.session.twitterScreenName.toLowerCase()
    , to = req.params.to.toLowerCase()
    , amount = parseFloat(req.params.amount)
  //TODO - verify to user exist
  //TODO - verify balance
  redis.get("oauthAccessToken",function(err, reply) {
    var oauthAccessToken = reply.toString()
    redis.get("oauthAccessTokenSecret",function(err, reply) {
      var oauthAccessTokenSecret = reply.toString()
      var body = {
        'status': '%d twitcoins sent from @%s to @%s'
      };
      body.status = util.format(body.status
        ,amount
        ,from
        ,to
      )
      twitter().post("https://api.twitter.com/1/statuses/update.json"
                  , oauthAccessToken
                  , oauthAccessTokenSecret
                  , body
                  , "application/json"
                  , function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
          data = JSON.parse(data); 
          res.writeHead(200, {"Content-Type": "application/json"});
          res.write(
            JSON.stringify(data)
          );
          res.end();
        }  
      }); 
    })
  })
});

app.get('/twitter/balance', function(req, res){
  getFulltimeline(req, res,config.twitter.username,[],null,function(error,twits){
    if (error) {
    }else{
      var sum = 0
      for (key in twits)
      {
        if(twits[key].text.match('to @'+req.session.twitterScreenName.toLowerCase()))
        sum += parseFloat(twits[key].text.match(/(\d*?\.?\d*) twitcoins/)[1])
        if(twits[key].text.match('from @'+req.session.twitterScreenName.toLowerCase()))
        sum -= parseFloat(twits[key].text.match(/(\d*?\.?\d*) twitcoins/)[1])
      }
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(
        JSON.stringify({balance:sum})
      );
      res.end();
    }
  })
});

app.get('/twitter/balance/:user', function(req, res){
  getFulltimeline(req, res,req.params.user,[],null,function(error,twits){
    if (error) {
    }else{
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(
        JSON.stringify(twits)
      );
      res.end();
    }
  })
});

function getFulltimeline(req, res,user,twits,max_id,callback){
  var url = 'https://api.twitter.com/1/statuses/user_timeline.json'
  url += '?trim_user=1&count=%d&screen_name=%s'//&exclude_replies=true
  var count = 200;
  url = util.format(url,count,encodeURIComponent(user))

  if(max_id){
    url += '&max_id='+max_id
  }
  console.log("url:" + url);
  twitter().get(url
                  , req.session.oauthAccessToken
                  , req.session.oauthAccessTokenSecret
                  , function (error, data, response) {
    if (error) {
      callback(error,twits)
    } else {
      data = JSON.parse(data);
      console.log("results:" + data.length);
      twits = twits.concat(data);
      if (data.length == 0){
        callback(null,twits)
      }else{     
        if(data.length == 1) console.log(data)
        var lastId = bignum(data[data.length-1].id_str)
        console.log("last_id:" + lastId);
        var max_id = lastId.sub(1)
        console.log("max_id:" + max_id);
        getFulltimeline(req, res,user,twits,max_id,callback)
      }
    }  
  }); 
}