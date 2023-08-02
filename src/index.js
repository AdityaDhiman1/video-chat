require("dotenv").config();
const http = require('http');
const express = require('express');
const { Server: SocketIO } = require('socket.io');
const path = require('path');
const app = express();
const bodyParser = require('body-parser')
const server = http.createServer(app);
const io = new SocketIO(server);
const hbs = require('hbs');
const PORT = process.env.PORT || 8000;
const router = require('../routes/routes');
const connectDB = require('../DB/connection');
const mongoose = require('mongoose')
const session = require("express-session")
const mongosesion = require('connect-mongodb-session')(session)
const mongoURI = process.env.MONGODB_URL;
mongoose.set('strictQuery', false)



app.use(express.json());
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public/socket')));
app.use(express.urlencoded({
  extended: true
}));
hbs.registerPartials(path.join(__dirname, "../partials"));
const storesession = new mongosesion({
  uri: mongoURI,
  collection: 'sessions'
})
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: storesession
}))


io.emit('some event',{someProperty:'some value',otherProperty:'other value'})

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    })
})

io.on('connection', (socket) => {
    socket.broadcast.emit('hi');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    })
})


const users = new Map();

io.on('connection', socket => {
  users.set(socket.id, socket.id);

  socket.broadcast.emit('users:joined', socket.id);
  socket.emit('hello', { id: socket.id });

  socket.on('outgoing:call', data => {
    const { fromOffer, to } = data;

    socket.to(to).emit('incomming:call', { from: socket.id, offer: fromOffer });
  });

  socket.on('call:accepted', data => {
    const { answere, to } = data;
    socket.to(to).emit('incomming:answere', { from: socket.id, offer: answere })
  });


  socket.on('disconnect', () => {
    users.delete(socket.id);
    socket.broadcast.emit('user:disconnect', socket.id);
  });
});



app.use('/', router);


app.get('/users', (req, res) => {
  return res.json(Array.from(users));
});



app.get("*", (req, res) => {
  res.send("This page is not available")
})

const serverStart = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
    await connectDB(mongoURI);
  } catch (error) {
    console.error(error.message);
  }
};

serverStart();
