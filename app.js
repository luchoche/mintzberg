// reads in our .env file and makes those values available as environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');

//const routes = require('./routes/main');
//const secureRoutes = require('./routes/secure');
//const passwordRoutes = require('./routes/password');
//const asyncMiddleware = require('./middleware/asyncMiddleware');
//const ChatModel = require('./models/chatModel');

// setup mongo connection
/*const uri = process.env.MONGO_CONNECTION_URL;
mongoose.connect(uri, { useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', function () {
  console.log('connected to mongo');
});
mongoose.set('useFindAndModify', false);*/

// create an instance of an express app
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const players = {};
const box = {};

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);
  // create a new player and add it to our players object
  players[socket.id] = {
    flipX: false,
    x: Math.floor(Math.random() * 400) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
  //presion del boton 1
  socket.on('pressbot1', function () {
    console.log('boton1 presionado');
    io.emit('boton1', socket.id);
  });
  //presion del boton 2
  socket.on('pressbot2', function () {
    console.log('boton2 presionado');
    io.emit('boton2', socket.id);
  });
  socket.on('pressbot3', function () {
    console.log('boton3 presionado');
    io.emit('boton3', socket.id);
  });
  socket.on('pressbot4', function () {
    console.log('boton4 presionado');
    io.emit('boton4', socket.id);
  });
  //presion del pizarron
  socket.on('presspiz', function () {
    console.log('pizarron presionado');
    io.emit('pizarron', socket.id);
  });
  socket.on('enviocaja', function () {
    console.log('caja enviada!');
    io.emit('cajaenviada');
  });
  socket.on('cajatomada', function () {
    console.log('caja tomada!');
    io.emit('notomarcaja');
  });

  // when a plaayer moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].flipX = movementData.flipX;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
  // when a plaayer moves, update the player data
  socket.on('boxMovement', function (movementDataBox) {
    box.x = movementDataBox.x;
    box.y = movementDataBox.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('boxMoved', box);
  });
});

// update express settings
/*app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());*/

// require passport auth
/*require('./auth/auth');*/

/*app.get('/game.html', passport.authenticate('jwt', { session : false }), function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});*/

/*app.get('/game.html', function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});*/

app.use(express.static(__dirname + '/public'));

app.get('/game.html', function (req, res) {
  res.sendFile(__dirname + '/game.html');
});

// main routes
/*app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session : false }), secureRoutes);*/

/*app.post('/submit-chatline', passport.authenticate('jwt', { session : false }), asyncMiddleware(async (req, res, next) => {
  const { message } = req.body;
  const { email, name } = req.user;
  await ChatModel.create({ email, message });
  io.emit('new message', {
    username: name,
    message,
  });
  res.status(200).json({ status: 'ok' });
}));*/

// catch all other routes
/*app.use((req, res, next) => {
  res.status(404).json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500).json({ error: err.message });
});*/

server.listen(process.env.PORT || 8082, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
