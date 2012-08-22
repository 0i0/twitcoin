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
      console.log(oauthAccessToken);
      console.log(oauthAccessTokenSecret);
      // Right here is where we would write out some nice user stuff
      twitter().get("http://twitter.com/account/verify_credentials.json"
        , req.session.oauthAccessToken
        , req.session.oauthAccessTokenSecret
        , function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
          //console.log("data is %j", data);
          data = JSON.parse(data);
          req.session.twitterScreenName = data["screen_name"];      
          if(req.session.twitterScreenName.toLowerCase() == config.twitter.username.toLowerCase()){
            console.log('eq:'+req.session.twitterScreenName);
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

app.get('/twitter/update', function(req, res){
  var body = {
    'status': '1000 to @'+req.session.twitterScreenName.toLowerCase()
  };
  var oauthAccessToken,oauthAccessTokenSecret;
  redis.get("oauthAccessToken",function(err, reply) {
    oauthAccessToken = reply
  })
  redis.get("oauthAccessTokenSecret",function(err, reply) {
    oauthAccessTokenSecret = reply
  })
  console.log(oauthAccessToken);
  console.log(oauthAccessTokenSecret);
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