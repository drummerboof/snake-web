module('Players Collection', {

    setup: function () {
        this.players = new Snake.Collections.Players();
    }
});

test('the comparator function returns the player score negated', function () {
    this.players.reset();
    equal(this.players.comparator(new Backbone.Model({ score: 10 })), -10, 'The score was negated');
});

test('The correct model with the correct ID attribute is used', function () {
    var model = new Backbone.Model({
        name: 'Bob',
        score: 10
    });
    this.players.reset([model.toJSON()]);
    deepEqual(this.players.get('Bob').toJSON(), model.toJSON(), 'The name should be the ID attribute');
});