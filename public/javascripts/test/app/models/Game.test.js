module('Game Model', {

    setup: function () {
        this.player = new Backbone.Model();
        this.players = new Backbone.Collection();
        this.socket = new (Backbone.Model.extend({
            emit: sinon.spy()
        }))();
        this.game = new Snake.Models.Game({}, {
            socket: this.socket,
            player: this.player,
            players: this.players
        });
    }
});

test('Socket events are bubbled up and emitted by the model', function () {
    _.each(this.game.socketEvents, function (event) {
        var eventSpy = sinon.spy(),
            data = 'test';

        this.game.on(event, eventSpy);
        this.socket.trigger(event, data);
        ok(eventSpy.calledOnce, 'The event was fired once');
        ok(eventSpy.calledWithExactly(data), 'The event passed through socket data');
    }, this);
});

test('Socket game data is set onto the model when messages are received', function () {
    sinon.stub(this.game, 'set');
    this.socket.trigger(this.game.socketEvents[0], {
        game: 'test'
    });
    ok(this.game.set.calledWithExactly('test'), 'The game data was set on the model');
});

test('Socket error events (ending in :error) trigger the message overlay', function () {
    sinon.stub(Snake, 'trigger');
    this.socket.trigger('player:join:error', {
        message: 'player join error'
    });
    this.socket.trigger('game:start:error', {
        message: 'game start error'
    });
    this.socket.trigger('game:start:success');

    ok(Snake.trigger.calledTwice, 'The error overlay was triggered twice');
    ok(Snake.trigger.calledWithExactly('error:flash', 'player join error', 2000), 'The error overlay was triggered with the correct args');
    ok(Snake.trigger.calledWithExactly('error:flash', 'game start error', 2000), 'The error overlay was triggered with the correct args');
    Snake.trigger.restore();
});

test('send() emits the message over the socket', function () {
    this.game.send('test', 'data');
    ok(this.socket.emit.calledOnce, 'The message was sent once');
    ok(this.socket.emit.calledWithExactly('test', 'data'), 'The message and data was sent');
});

test('respawn() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.respawn();
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('player:respawn'), 'The correct message was sent');
});

test('play() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.play();
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('game:start'), 'The correct message was sent');
});

test('pause() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.pause();
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('game:pause'), 'The correct message was sent');
});

test('reset() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.reset();
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('game:reset'), 'The correct message was sent');
});

test('join() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.join('test');
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('player:join', { name: 'test' }), 'The correct message was sent');
});

test('sendPlayerDirection() sends the correct message over the socket', function () {
    sinon.stub(this.game, 'send');
    this.game.sendPlayerDirection('east');
    ok(this.game.send.calledOnce, 'The message was sent once');
    ok(this.game.send.calledWithExactly('player:command', { direction: 'east' }), 'The correct message was sent');
});

test('toggleStatus()', function () {
    var statusStub = sinon.stub(this.game, 'isRunning');

    sinon.spy(this.game, 'play');
    sinon.spy(this.game, 'pause');

    statusStub.returns(true);
    this.game.toggleStatus();
    ok(this.game.pause.calledOnce, 'pause() was called');

    statusStub.returns(false);
    this.game.toggleStatus();
    ok(this.game.play.calledOnce, 'play () was called');
});

test('isRunning() returns true if the game status is playing', function () {
    var getStub = sinon.stub(this.game, 'get'),
        provider = [{
            status: 'playing',
            isRunning: true
        }, {
            status: 'paused',
            isRunning: false
        }, {
            status: 'over',
            isRunning: false
        }];

    _.each(provider, function (data) {
        getStub.withArgs('status').returns(data.status);
        equal(this.game.isRunning(), data.isRunning, 'isRunning returns the correct value');
    }, this);

});
