function twitter() {
  return new oauth.OAuth
    ( "https://twitter.com/oauth/request_token"
    , "https://twitter.com/oauth/access_token"
    , config.apis.twitter.consumer_key
    , config.apis.twitter.consumer_secret
    , "1.0A"
    , config.orign + "/twitter/callback"
    , "HMAC-SHA1"
    )
}

app.get('/twitter/auth', function(req, res){
  twitter().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {
      console.log("*** twitter auth:");
      console.log('oauthRequestToken: ' + oauthToken);
      console.log('oauthRequestTokenSecret: ' + oauthTokenSecret);
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect
        ( util.format
          ( "https://twitter.com/oauth/authorize?oauth_token=%s"
          , req.session.oauthRequestToken
          )
        )
    }
  });
});

app.get('/twitter/callback', function(req, res){
  console.log("*** twitter callback:");
  console.log('oauthRequestToken: ' + req.session.oauthRequestToken);
  console.log('oauthRequestTokenSecret: ' + req.session.oauthRequestTokenSecret);
  console.log('oauth_verifier: ' + req.query.oauth_verifier);

  twitter().getOAuthAccessToken
    ( req.session.oauthRequestToken
    , req.session.oauthRequestTokenSecret
    , req.query.oauth_verifier
    , function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
          res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
        } else {
          req.session.oauthAccessToken = oauthAccessToken;
          req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
          twitter().get("http://twitter.com/account/verify_credentials.json"
            , req.session.oauthAccessToken
            , req.session.oauthAccessTokenSecret
            , function (error, data, response) {
            if (error) {
              res.send("Error getting twitter screen name : " + util.inspect(error), 500);
            } else {
              //TODO check first time, grant 1000 coins
              data = JSON.parse(data);
              req.session.twitterScreenName = data["screen_name"]
              res.redirect('/');
            }
          })
        }
      }
    )
})