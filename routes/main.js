app.get('/', function(req, res){
  var user = {
    name:'Anonymous',
    image:'http://userserve-ak.last.fm/serve/64s/58115331.gif',
    id: 0,
    balance: 42
  };
  if (typeof(req.session.user) != 'undefined' || req.session.user)
    user = req.session.user;
  else
    req.session.user = user;
  res.render('main.jade', { 
      config: config
      ,req:req
  });
});