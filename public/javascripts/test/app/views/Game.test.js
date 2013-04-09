module('Game View', {

    setup: function () {
        Snake.off();
        _.extend(window.Snake, Backbone.Events);

        this.socket = new (Backbone.Model.extend({
            emit: sinon.spy()
        }))();
        this.io = {
            connect: sinon.spy(_.bind(function () {
                return this.socket;
            }, this))
        };
        this.game = new Snake.Views.Game({
            el: '#qunit-test',
            io: this.io
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('socket connection is opened using current window location path', function () {
    ok(this.io.connect.calledWithExactly(window.location.pathname), 'the socket connection was opened');
});

test('socket is passed onto the Game model', function () {
    deepEqual(this.game.models.game.socket, this.socket);
});

test('keyListener events set the player direction if the game is running and the player is alive', function () {
    var isRunningStub = sinon.stub(this.game.models.game, 'isRunning'),
        playerGetStub = sinon.stub(this.game.models.player, 'get');

    sinon.spy(this.game.models.player, 'set');

    isRunningStub.returns(false);
    playerGetStub.withArgs('alive').returns(true);
    this.game.keyListener.trigger('press:north', 'north');
    ok(this.game.models.player.set.notCalled, 'The player direction is not set');

    isRunningStub.returns(true);
    playerGetStub.withArgs('alive').returns(false);
    this.game.keyListener.trigger('press:north', 'north');
    ok(this.game.models.player.set.notCalled, 'The player direction is not set');

    isRunningStub.returns(true);
    playerGetStub.withArgs('alive').returns(true);
    _.each(['north', 'south', 'east', 'west'], function (direction) {
        this.game.keyListener.trigger('press:' + direction, direction);
        ok(this.game.models.player.set.calledWithExactly({ direction: direction }), 'The player direction is set');
    }, this);
});

test('the game change event sets current player data on the player model and resets the players collection', function () {
    sinon.spy(this.game.models.player, 'set');
    sinon.spy(this.game.collections.players, 'reset');
    sinon.stub(this.game.models.player, 'get').withArgs('name').returns('test');
    this.game.models.game.set({
        players: [{
            name: 'test',
            something: 'value',
            direction: 'test'
        }]
    });
    ok(this.game.models.player.set.calledWithExactly({
        name: 'test',
        something: 'value'
    }));
    ok(this.game.collections.players.reset.calledWithExactly([{
        name: 'test',
        something: 'value',
        direction: 'test'
    }]));
});

test('an error message is displayed when the connect:error event is fired', function () {
    sinon.stub(Snake, 'trigger');
    this.game.models.game.trigger('connect:error');
    ok(Snake.trigger.calledWithExactly('error:show', 'Game could not be found'));
    Snake.trigger.restore();
});

test('messages are cleared when the game:start:success event is fired', function () {
    sinon.stub(Snake, 'trigger');
    this.game.models.game.trigger('game:start:success');
    ok(Snake.trigger.calledWithExactly('messages:clear'));
    Snake.trigger.restore();
});

test('the keyListener starts listening when the player:join:success event is fired', function () {
    sinon.stub(this.game.keyListener, 'listen');
    this.game.models.game.trigger('player:join:success');
    ok(this.game.keyListener.listen.calledOnce);
});

test('the player name is unset when the player:join:error event is fired', function () {
    sinon.stub(this.game.models.player, 'unset');
    this.game.models.game.trigger('player:join:error');
    ok(this.game.models.player.unset.calledWithExactly('name'));
});

test('the correct message is displayed when the player dies', function () {
    var getStatusStub = sinon.stub(this.game.models.game, 'get').withArgs('status');
    sinon.stub(Snake, 'trigger');

    this.game.models.player.trigger('change:alive', this.game.models.player, true);
    ok(Snake.trigger.notCalled, 'The message is not displayed because the player is alive');

    getStatusStub.returns(Snake.Models.Game.STATUS_PLAYING);
    this.game.models.player.trigger('change:alive', this.game.models.player, false);
    ok(Snake.trigger.calledWithExactly(
        'message:flash',
        'You died! Respawning in 3 seconds...',
        this.game.models.game.respawnTime
    ), 'The correct message is displayed');

    getStatusStub.returns(Snake.Models.Game.STATUS_OVER);
    this.game.models.player.trigger('change:alive', this.game.models.player, false);
    ok(Snake.trigger.calledWithExactly(
        'message:flash',
        'You died!',
        this.game.models.game.respawnTime
    ), 'The correct message is displayed');

    Snake.trigger.restore();
});

test('the player is respawned after a set delay when they die if there are other players still in the game', function () {
    var clock = sinon.useFakeTimers(),
        getStatusStub = sinon.stub(this.game.models.game, 'get').withArgs('status');
    sinon.spy(this.game.models.game, 'respawn');

    getStatusStub.returns(Snake.Models.Game.STATUS_PLAYING);
    this.game.models.player.trigger('change:alive', this.game.models.player, false);
    ok(this.game.models.game.respawn.notCalled);

    clock.tick(this.game.models.game.respawnTime);
    ok(this.game.models.game.respawn.calledOnce, 'The player is respawned');

    this.game.models.game.respawn.reset();

    getStatusStub.returns(Snake.Models.Game.STATUS_OVER);
    this.game.models.player.trigger('change:alive', this.game.models.player, false);
    clock.tick(this.game.models.game.respawnTime);
    ok(this.game.models.game.respawn.notCalled, 'The player is not respawned');

    clock.restore();
});

test('the player direction is unset when the player dies', function () {
    sinon.stub(this.game.models.player, 'unset');
    this.game.models.player.trigger('change:alive', this.game.models.player, false);
    ok(this.game.models.player.unset.calledWithExactly('direction', { silent: true }));

});

test('the player joins the game when their name is changed', function () {
    sinon.stub(this.game.models.game, 'join');
    this.game.models.player.trigger('change:name', this.game.models.player, 'test');
    ok(this.game.models.game.join.calledWithExactly('test'));
});

test('when the player direction changes the sendPlayerDirection method on the game is called', function () {
    sinon.stub(this.game.models.game, 'sendPlayerDirection');
    this.game.models.player.trigger('change:direction', this.game.models.player, 'north');
    ok(this.game.models.game.sendPlayerDirection.calledWithExactly('north'));
});

test('when the canvas triggers the render event, messages are cleared', function () {
    sinon.stub(Snake, 'trigger');
    this.game.views.canvas.trigger('rendered');
    ok(Snake.trigger.calledWithExactly('messages:clear'));
    Snake.trigger.restore();
});

test('global event bindings are set up', function () {
    sinon.spy(this.game.views.messages, 'render');
    sinon.spy(this.game.views.messages, 'flash');

    Snake.trigger('message:flash', 'test', 1000);
    ok(this.game.views.messages.flash.calledWithExactly('test', 1000), 'The message is flashed');

    Snake.trigger('error:flash', 'test', 2000);
    ok(this.game.views.messages.flash.calledWithExactly('test', 2000, Snake.Views.Messages.ERROR), 'The error is flashed');

    Snake.trigger('message:show', 'test');
    ok(this.game.views.messages.render.calledWithExactly('test'), 'The message is rendered');

    Snake.trigger('error:show', 'test');
    ok(this.game.views.messages.render.calledWithExactly('test', Snake.Views.Messages.ERROR), 'The error is rendered');

    sinon.spy(this.game.views.messages, 'clear');
    console.log('spyed');
    Snake.trigger('messages:clear');
    equal(this.game.views.messages.clear.callCount, 1, 'The messages are cleared');
});