module('Players View', {

    setup: function () {
        this.model = new Backbone.Collection();
        this.players = new Snake.Views.Players({
            el: '#qunit-test',
            model: this.model
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('when the reset event of the collection is fired render() is called', function () {
    sinon.stub(this.players, 'render');
    this.model.trigger('reset');
    ok(this.players.render.calledOnce, 'render() was called once');
});

test('the player list is displayed when the view is rendered', function () {
    var players = [{
        name: 'Player 1',
        score: 10,
        alive: true
    }, {
        name: 'Player 2',
        score: 5,
        alive: false
    }, {
        name: 'Player 3',
        score: 15,
        alive: true
    }];
    this.model.reset(players);

    equal(this.players.$el.children('.player').length, 3, 'All players are rendered');
    equal(this.players.$el.children('.player.alive').length, 2, 'Alive players have the alive class');
    equal(this.players.$el.children('.player.dead').length, 1, 'Dead players have the dead class');

    _.each(players, function (data, index) {
        equal(this.players.$el.children().eq(index).find('.player-name').text(), data.name, 'Player name should be correct');
        equal(this.players.$el.children().eq(index).find('.player-score').text(), 'Score: ' + data.score, 'Player score should be correct');
    }, this);
});