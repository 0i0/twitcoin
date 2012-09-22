app.get('/twitter/setmaster', function(req, res){
  (new oauth.OAuth
    ( "https://twitter.com/oauth/request_token"
    , "https://twitter.com/oauth/access_token"
    , config.apis.twitter.consumer_key
    , config.apis.twitter.consumer_secret
    , "1.0A"
    , config.orign + "/twitter/mastercallback"
    , "HMAC-SHA1")
  ).getOAuthRequestToken
    ( function(error, oauthToken, oauthTokenSecret, results){
        if (error) {
          res.send("Error getting OAuth request token : " + util.inspect(error), 500);
        } else {
          console.log("*** Master twitter auth:");
          console.log('m oauthRequestToken: ' + oauthToken);
          console.log('m oauthRequestTokenSecret: ' + oauthTokenSecret);
          req.session.masteroauthRequestToken = oauthToken;
          req.session.masteroauthRequestTokenSecret = oauthTokenSecret;
          res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.masteroauthRequestToken);
        }
      }
    )
});

app.get('/twitter/mastercallback', function(req, res){
  console.log("*** Master twitter callback:");
  console.log('oauthRequestToken: ' + req.session.oauthRequestToken);
  console.log('oauthRequestTokenSecret: ' + req.session.oauthRequestTokenSecret);
  console.log('oauth_verifier: ' + req.query.oauth_verifier);

  twitter().getOAuthAccessToken
    ( req.session.masteroauthRequestToken
    , req.session.masteroauthRequestTokenSecret
    , req.query.oauth_verifier
    , function( error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
          res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
        } else {
          req.session.masteroauthAccessToken = oauthAccessToken;
          req.session.masteroauthAccessTokenSecret = oauthAccessTokenSecret;
          res.redirect('/');
        }
      }
    )
})