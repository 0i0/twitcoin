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
/* Grnat 1000 coins */
app.get('/twitter/grant', function(req, res){
  var from = config.twitter.username
  , to = req.session.twitterScreenName.toLowerCase()
  , amount = 1000
  var body = {'status': '%d twitcoins sent from @%s to @%s'};
  body.status = util.format
    ( body.status
    , amount
    , from
    , to
    )
  twitter().post
    ( "https://api.twitter.com/1/statuses/update.json"
    , req.session.masteroauthAccessToken
    , req.session.masteroauthAccessTokenSecret
    , body
    , "application/json"
    , function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
          console.log("data is %j", data);
          data = JSON.parse(data);
          //req.session.twitterScreenName = data["screen_name"];
          res.redirect('/');
        }
      }
    )
});

app.get('/twitter/send/:to/:amount', function(req, res){
  var from = req.session.twitterScreenName.toLowerCase()
    , to = req.params.to.toLowerCase()
    , amount = parseFloat(req.params.amount)
  //TODO - verify to user exist
  //TODO - verify balance
  //TDOD - verify master
  var body = {'status': '%d twitcoins sent from @%s to @%s'};
  body.status = util.format
    (body.status
    ,amount
    ,from
    ,to
    )
  twitter().post
    ( "https://api.twitter.com/1/statuses/update.json"
    , req.session.masteroauthAccessToken
    , req.session.masteroauthAccessTokenSecret
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
          res.end()
        }  
      }
    )
});