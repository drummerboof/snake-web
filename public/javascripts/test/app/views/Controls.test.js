module('Controls View', {

    setup: function () {
        this.gameData = {
            status: 'playing',
            players: [{
                name: 'test'
            }]
        };
        this.players = new Snake.Collections.Players();
        this.model = new (Backbone.Model.extend({
            toggleStatus: sinon.spy(),
            reset: sinon.spy()
        }))();
        this.player = new Backbone.Model();
        this.controls = new Snake.Views.Controls({
            el: '#qunit-test',
            model: this.model,
            player: this.player,
            players: this.players
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('when the change:status event of the model is fired render() is called', function () {
    sinon.stub(this.controls, 'render');
    this.model.trigger('change:status');
    ok(this.controls.render.calledOnce, 'render() is called');
});

test('when the player:join:success event of the model is fired render() is called', function () {
    sinon.stub(this.controls, 'render');
    this.model.trigger('player:join:success');
    ok(this.controls.render.calledOnce, 'render() is called');
});

test('when the change:name event of the player model is fired render() is called', function () {
    sinon.stub(this.controls, 'render');
    this.player.trigger('change:name');
    ok(this.controls.render.calledOnce, 'render() is called once');
});

test('render() shows or hides #controls-join and #controls-game according to whether the player is playing', function () {
    sinon.stub(this.player, 'get').returns('test');
    this.players.reset([]);
    this.controls.render();
    ok(this.controls.$el.find('#controls-join').is(':visible'), 'The join controls are visible');
    ok(!this.controls.$el.find('#controls-game').is(':visible'), 'The game controls are not visible');

    this.players.reset([{
        name: 'test'
    }]);
    this.controls.render();
    ok(!this.controls.$el.find('#controls-join').is(':visible'), 'The join controls are not visible');
    ok(this.controls.$el.find('#controls-game').is(':visible'), 'The game controls are visible');
});

test('render() displays the correct button value for the status button', function () {
    this.model.set({ status: 'playing' });
    equal($.trim(this.controls.$el.find('#controls-status-button').text()), 'pause', 'The button text is correct');

    this.model.set({ status: 'paused' });
    equal($.trim(this.controls.$el.find('#controls-status-button').text()), 'play', 'The button text is correct');
});

test('render() displays the game status correctly', function () {
    this.model.set({ status: 'playing' });
    equal($.trim(this.controls.$el.find('#controls-status').text()), 'playing', 'The game status is displayed');

    this.model.set({ status: 'paused' });
    equal($.trim(this.controls.$el.find('#controls-status').text()), 'paused', 'The game status is displayed');
});

test('render() displays the player name input correctly', function () {
    this.player.set({ name: 'test' });
    equal($.trim(this.controls.$el.find('#controls-player-name').val()), 'test', 'The player name is the value of the player field');
});

test('when the #controls-status-button is clicked, the game status is set correctly', function () {
    var getPlayerStub = sinon.stub(this.players, 'get').withArgs('test');
    sinon.stub(this.player, 'get').withArgs('name').returns('test');
    this.model.set(this.gameData);

    getPlayerStub.returns(this.player);
    this.controls.$el.find('#controls-status-button').trigger('click');
    ok(this.model.toggleStatus.calledOnce, 'The game status is toggled');

    getPlayerStub.returns(undefined);
    this.controls.$el.find('#controls-status-button').trigger('click');
    ok(this.model.toggleStatus.calledOnce, 'The game status is not toggled');


    this.model.set({ status: 'over' });

    getPlayerStub.returns(this.player);
    this.controls.$el.find('#controls-status-button').trigger('click');
    ok(this.model.reset.calledOnce, 'The game is reset');

    getPlayerStub.returns(undefined);
    this.controls.$el.find('#controls-status-button').trigger('click');
    ok(this.model.reset.calledOnce, 'The game is not reset');
});

test('when the #controls-join-button is clicked and a name has been entered, the player name is set', function () {
    var getPlayerStub = sinon.stub(this.players, 'get').withArgs('test');
    sinon.stub(this.player, 'get').withArgs('name').returns('test');
    sinon.spy(this.player, 'set');
    this.model.set(this.gameData);
    this.controls.$el.find('#controls-player-name').val('test');

    getPlayerStub.returns(undefined);
    this.controls.$el.find('#controls-join-button').trigger('click');
    ok(this.player.set.calledWithExactly({ name: 'test' }), 'The player name is set');

    getPlayerStub.returns(this.player);
    this.controls.$el.find('#controls-join-button').trigger('click');
    equal(this.player.set.callCount, 1, 'The player name is not set');
});

test('when the #controls-join-button is clicked and the name field is blank, an error is shown', function () {
    sinon.stub(Snake, 'trigger');
    this.model.set(this.gameData);
    this.controls.$el.find('#controls-player-name').val('');
    this.controls.$el.find('#controls-join-button').trigger('click');
    ok(Snake.trigger.calledWithExactly('error:flash', 'Please enter a player name'), 'An error is displayed');
    Snake.trigger.restore();
});

test('when the enter key is clicked, the player is added to the game if not already playing', function () {
    // Cheating (sorry)
    sinon.spy(this.controls, '_onJoinClick');
    this.controls.keyListener.trigger('press:enter');
    equal(this.controls._onJoinClick.callCount, 1, 'The _onJoinClick event handler was called');
});

test('when the spacebar is pressed, the game is paused, played or reset', function () {
    // Cheating (sorry)
    sinon.spy(this.controls, '_onPlayPauseClick');
    this.controls.keyListener.trigger('press:space');
    equal(this.controls._onPlayPauseClick.callCount, 1, 'The _onPlayPauseClick event handler was called');
});