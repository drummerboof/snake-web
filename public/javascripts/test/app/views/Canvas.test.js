module('Canvas View', {

    setup: function () {
        this.model = new Backbone.Model();
        this.player = new Backbone.Model();
        this.canvas = new Snake.Views.Canvas({
            el: '#qunit-test',
            model: this.model,
            player: this.player
        });
    },

    teardown: function () {
        $('#qunit-test').empty();
    }
});

test('when the model changes, the canvas is rendered', function () {
    sinon.stub(this.canvas, 'render');
    this.model.trigger('change');
    ok(this.canvas.render.calledOnce, 'The render method was called once');
    ok(this.canvas.render.calledWithExactly(false), 'The render method was called with force set to false');
});

test('render() builds the game HTML matrix', function () {
    var width = 10,
        height = 10,
        provider = [{
            index: 0,
            expected: { x: 0, y: 0, top: 0, left: 0 }
        }, {
            index: 1,
            expected: { x: 0, y: 1, top: 10, left: 0 }
        }, {
            index: 2,
            expected: { x: 1, y: 0, top: 0, left: 10 }
        }, {
            index: 3,
            expected: { x: 1, y: 1, top: 10, left: 10 }
        }];

    sinon.stub(this.model, 'get')
        .withArgs('width').returns(2)
        .withArgs('height').returns(2);
    this.canvas.canvasSize = 20;

    this.canvas.render();

    equal(this.canvas.cells.length, 2, 'The cells array has been populated');
    equal(this.canvas.cells[0].length, 2, 'The cells array has been populated');
    equal(this.canvas.cells[1].length, 2, 'The cells array has been populated');
    equal(this.canvas.$el.children().length, 4, 'The cells should be appended to the view element');

    _.each(provider, function (data) {
        var cell = $(this.canvas.$el.children()[data.index]);
        equal(cell.width(), width, 'The cell width is correct');
        equal(cell.height(), width, 'The cell height is correct');
        equal(cell.position().top, data.expected.top, 'The cell top position is correct');
        equal(cell.position().left, data.expected.left, 'The cell left position is correct');
        equal(this.canvas.cells[data.expected.x][data.expected.y][0], cell[0], 'The cell is in the correct place in the matrix');
    }, this);
});

test('render() doesn\'t re-render unless force is true, but always calls update()', function () {
    var renderedSpy = sinon.spy();
    sinon.stub(this.canvas, 'update');
    sinon.spy(this.canvas.$el, 'append');
    this.canvas.on('rendered', renderedSpy);

    this.canvas.render();

    ok(this.canvas.$el.append.calledOnce, 'The contents of the render is appended to the $el');
    ok(this.canvas.update.calledOnce, 'update() was called');
    ok(renderedSpy.calledOnce, 'the rendered event was fired');

    this.canvas.render();

    ok(this.canvas.$el.append.calledOnce, 'The contents of the render are not re-appended');
    ok(this.canvas.update.calledTwice, 'update() was called');
    ok(renderedSpy.calledOnce, 'the rendered event was not fired again');

    this.canvas.render(true);

    ok(this.canvas.$el.append.calledTwice, 'The contents of the render are re-appended');
    ok(this.canvas.update.calledThrice, 'update() was called');
    ok(renderedSpy.calledTwice, 'the rendered event was fired');
});

test('update() removes all previous classes and ids from cells', function () {
    var getStub = sinon.stub(this.model, 'get')
        .withArgs('width').returns(3)
        .withArgs('height').returns(3)
        .withArgs('food').returns([{
            id: 'food',
            position: { x: 0, y: 0 }
        },{
            id: 'food',
            position: { x: 2, y: 2 }
        }]);
    sinon.spy($, 'attr');

    this.canvas.render();
    this.canvas.cells[0][0].attr('id', 'test');
    this.canvas.cells[2][2].attr('id', 'test');

    getStub.withArgs('food').returns([{
        id: 'food',
        position: { x: 1, y: 0 }
    },{
        id: 'food',
        position: { x: 0, y: 1 }
    }]);

    this.canvas.render();

    equal(this.canvas.cells[0][0].attr('class'), '', 'Previous class and id attributes are reset');
    equal(this.canvas.cells[0][0].attr('id'), '', 'Previous class and id attributes are reset');
    equal(this.canvas.cells[2][2].attr('class'), '', 'Previous class and id attributes are reset');
    equal(this.canvas.cells[2][2].attr('id'), '', 'Previous class and id attributes are reset');
});

test('update() renders players correctly', function () {
    var provider = [{
            fixture: { x: 0, y: 0 },
            expected: {
                classes: ['player', 'speed', 'points', 'head', 'current'],
                id: 'test'
            }
        }, {
            fixture: { x: 1, y: 0 },
            expected: {
                classes: ['player', 'speed', 'points', 'current'],
                id: 'test'
            }
        }, {
            fixture: { x: 1, y: 1 },
            expected: {
                classes: ['player', 'speed', 'points', 'current'],
                id: 'test'
            }
        }, {
            fixture: { x: 2, y: 1 },
            expected: {
                classes: ['player', 'head'],
                id: 'other'
            }
        }, {
            fixture: { x: 2, y: 2 },
            expected: {
                classes: ['player'],
                id: 'other'
            }
        }],
        empty = [
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 0 }
        ];

    sinon.stub(this.player, 'get').withArgs('name').returns('test');
    sinon.stub(this.model, 'get')
        .withArgs('width').returns(3)
        .withArgs('height').returns(3)
        .withArgs('players').returns([{
            name: 'test',
            alive: true,
            points: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: 1 }
            ],
            position: { x: 0, y: 0 },
            powerUps: [{
                id: 'speed'
            }, {
                id: 'points'
            }]
        },{
            name: 'other',
            alive: true,
            points: [
                { x: 2, y: 1 },
                { x: 2, y: 2 }
            ],
            position: { x: 2, y: 1 },
            powerUps: []
        }, {
            name: 'dead',
            alive: false,
            points: [
                { x: 2, y: 0 }
            ],
            position: { x: 2, y: 0 },
            powerUps: []
        }]);

    this.canvas.render();

    _.each(provider, function (data) {
        var cell = this.canvas.cells[data.fixture.x][data.fixture.y];
        ok(_.every(data.expected.classes, cell.hasClass, cell), 'The player cell has the correct classes');
        equal(cell.attr('class').split(' ').length, data.expected.classes.length, 'The player cell has no additional classes');
        equal(cell.attr('id'), data.expected.id, 'The player head has the correct id');
    }, this);

    _.each(empty, function (data) {
        var cell = this.canvas.cells[data.x][data.y];
        equal(cell.attr('class'), undefined, 'Empty cells have no classes');
        equal(cell.attr('id'), undefined, 'Empty cells have no id');
    }, this);
});

test('update() renders food correctly', function () {
    var provider = [{
            fixture: { x: 0, y: 0 },
            expected: {
                classes: 'food'
            }
        }, {
            fixture: { x: 2, y: 2 },
            expected: {
                classes: 'food'
            }
        }],
        empty = [
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 0 },
            { x: 2, y: 1 }
        ];

    sinon.stub(this.player, 'get').withArgs('name').returns('test');
    sinon.stub(this.model, 'get')
        .withArgs('width').returns(3)
        .withArgs('height').returns(3)
        .withArgs('food').returns([{
            id: 'food',
            points: [{ x: 0, y: 0 }],
            position: { x: 0, y: 0 }
        },{
            id: 'food',
            points: [{ x: 2, y: 2 }],
            position: { x: 2, y: 2 }
        }]);

    this.canvas.render();

    _.each(provider, function (data) {
        var cell = this.canvas.cells[data.fixture.x][data.fixture.y];
        equal(cell.attr('class'), data.expected.classes, 'The food cell has the correct class');
    }, this);

    _.each(empty, function (data) {
        var cell = this.canvas.cells[data.x][data.y];
        equal(cell.attr('class'), undefined, 'Empty cells have no classes');
        equal(cell.attr('id'), undefined, 'Empty cells have no id');
    }, this);
});

test('update() renders power-ups correctly', function () {
    var provider = [{
            fixture: { x: 2, y: 0 },
            expected: {
                classes: ['powerup', 'speed']
            }
        }, {
            fixture: { x: 0, y: 2 },
            expected: {
                classes: ['powerup', 'points']
            }
        }],
        empty = [
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 2, y: 1 }
        ];

    sinon.stub(this.player, 'get').withArgs('name').returns('test');
    sinon.stub(this.model, 'get')
        .withArgs('width').returns(3)
        .withArgs('height').returns(3)
        .withArgs('powerUps').returns([{
            id: 'speed',
            points: [{ x: 2, y: 0 }],
            position: { x: 2, y: 0 }
        },{
            id: 'points',
            points: [{ x: 0, y: 2 }],
            position: { x: 0, y: 2 }
        }]);

    this.canvas.render();

    _.each(provider, function (data) {
        var cell = this.canvas.cells[data.fixture.x][data.fixture.y];
        ok(_.every(data.expected.classes, cell.hasClass, cell), 'The power-up cell has the correct classes');
        equal(cell.attr('class').split(' ').length, data.expected.classes.length, 'The power-up cell has no additional classes');
    }, this);

    _.each(empty, function (data) {
        var cell = this.canvas.cells[data.x][data.y];
        equal(cell.attr('class'), undefined, 'Empty cells have no classes');
        equal(cell.attr('id'), undefined, 'Empty cells have no id');
    }, this);
});