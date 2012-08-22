var Events = module.exports = function (socket) {
  var hs = socket.handshake;

  socket.join(hs.sessionID);
  socket.join('public');

  var intervalID = setInterval(function () {
    hs.session.reload(function () { 
      hs.session.touch().save();
    });
  }, 60 * 1000);

  socket.on('message.send', function (data) {
      socket.broadcast
            .to('public')
            .emit('message.recieved', { 
        author: hs.session.user
        ,content: data.content 
      });
      socket.emit('message.recieved', {
        author: hs.session.user
        ,content: data.content
      });
  });

  socket.on('user.joined', function (position) {
      hs.session.user.position = position;
      onlineUsers[hs.session.user.id] = hs.session.user
      socket.broadcast
            .to('public')
            .emit('user.joined', { 
        user: hs.session.user
      });
      socket.emit('user.joined', {
        user: hs.session.user
      });
  });

  socket.on('user.left', function (data) {
      socket.broadcast
            .to('public')
            .emit('user.left', { 
        author: hs.session.user
        ,content: data.content 
      });
      clearInterval(intervalID);
      if (typeof(hs.session.destroy)!='undefined')
        hs.session.destroy();
  });
}



    