var restify = require('restify');

var socketio = require('socket.io');

var server = restify.createServer({
  name: 'sockets',
});

var io = socketio.listen(server.server);


var fs = require('fs');

var path = require('path');
const BASE = path.normalize(__dirname + '/../');


/*
server.get(/., function indexHTML(req, res, next) {
  console.log(req.url, BASE);


  fs.stat(path.join(BASE, req.url), function (err, stat){
    if (err){
      return next(err);
    }
    console.log(err, stat)
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end('asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf');
    return next();

  })

});*/



server.get(/.*/, restify.serveStatic({
  directory: BASE,
  default: 'index.html'
}));

var clients = {};

io.sockets.on('connection', function (socket) {
  var socketID = socket.id;
  clients[socketID] = socket;
  //socket.emit('webSocketProxy', { name : 'sar::record', data : { foo : 'bar'} }, 'Some string');
  socket.on('webSocketProxy', function (eventName, eventData) {
    var d = new Date().toISOString();

    // Get all sockets exepts the one that sent the message;
    var list = getClientsForBroadCast(clients, socketID);
    var len = list.length;
    console.log(`${d} - Got event from ${socketID}, sending broadcast to ${len} clients`);

    broadCast(clients, list, eventName, eventData)
  });
  socket.on('disconnect', function (a,b,c) {
    var d = new Date().toISOString();

    console.log(`${d} - Client disconnect ${socketID}`);

    delete clients[socketID];
  });

});

function getClientsForBroadCast(clients, clientID){
  var arr = Object.keys(clients);
  return arr.filter(function (id){
    return (id !== clientID);
  });
}


function broadCast(clients, list, eventName, eventData){
  list.forEach(function (socketID){
    var socket = clients[socketID]

    console.log('Broadcasting to client', eventName,  socket.id);
    socket.emit('webSocketProxy', eventName, eventData);
  });
}

server.listen(9000, function () {
    console.log('socket.io server listening at %s', server.url);
});
