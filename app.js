var cons     = require('consolidate'),
    swig     = require('swig'),
    path     = require('path'),
    snake    = require('snake-server'),
    http     = require('http'),
    express  = require('express'),
    socketio = require('socket.io');

var app = express(),
    server = http.createServer(app),
    gameServer = new snake.GameServer(socketio.listen(server, { log: false }), '/games');

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('view options', { layout: false });
    app.engine('.html', cons.swig);
    app.use(express.favicon());
    app.use(express.logger('prod'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    swig.init({ cache: false, root: __dirname + '/views' });
});

app.configure('development', function(){
    app.use(express.errorHandler());
    app.use(express.logger('dev'));
});

app.get('/', function (req, res) {
    // Some kind of homepage
});

app.get('/games/:id', function (req, res) {
    res.render('game', {
        id: req.route.params.id
    });
});

app.post('/games', function (req, res) {
    // Create a new game
});

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Create game for testing
gameServer.createGame({
    width: 40,
    height: 40,
    speed: 30
}, 'test');
