Snake.Views.Canvas = (function () {

    var Canvas = Backbone.View.extend({

        el: '#canvas',

        canvasSize: 500,

        cells: null,

        rendered: false,

        _previous: null,

        initialize: function (options) {
            this.cells = [];
            this._previous = [];
            this.player = options.player;
            this.model.on('change', function () {
                this.render(false)
            }, this);
        },

        render: function (force) {
            if (!this.rendered || force) {
                this.cellSize = this.canvasSize / this.model.get('width');
                var fragment = $(document.createDocumentFragment());
                for (var x = 0; x < this.model.get('width'); x++) {
                    this.cells[x] = [];
                    for (var y = 0; y < this.model.get('height'); y++) {
                        this.cells[x][y] = this._createCell(x, y);
                        fragment.append(this.cells[x][y]);
                    }
                }
                this.$el.empty().append(fragment);
                this.rendered = true;
                this.trigger('rendered');
            }
            this.update();
            return this;
        },

        update: function () {
            _.each(this._previous, this._clearCell, this);
            this._previous = [];
            _.each(_.where(this.model.get('players') || [], { alive: true }),  this._renderPlayer,  this);
            _.each(this.model.get('food') || [],     this._renderFood,    this);
            _.each(this.model.get('powerUps') || [], this._renderPowerUp, this);
        },

        _createCell: function (x, y) {
            return $('<div/>').css({
                position: 'absolute',
                width: this.cellSize + 'px',
                height: this.cellSize + 'px',
                top: y * this.cellSize + 'px',
                left: x * this.cellSize + 'px'
            });
        },

        _clearCell: function (cell) {
            cell.attr({ 'class': '', 'id': '' });
        },

        _renderPlayer: function (player) {
            var classes = _.union(['player'], _.pluck(player.powerUps, 'id'));
            player.name === this.player.get('name') && classes.push('current');
            _.each(player.points, function (point, index) {
                this.cells[point.x][point.y].addClass(classes.join(' '));
                index === 0 && this.cells[point.x][point.y].addClass('head');
                this.cells[point.x][point.y].attr('id', player.name);
                this._previous.push(this.cells[point.x][point.y]);
            }, this);
        },

        _renderFood: function (food) {
            this.cells[food.position.x][food.position.y].addClass('food');
            this._previous.push(this.cells[food.position.x][food.position.y]);
        },

        _renderPowerUp: function (powerUp) {
            this.cells[powerUp.position.x][powerUp.position.y].addClass('powerup ' + powerUp.id);
            this._previous.push(this.cells[powerUp.position.x][powerUp.position.y]);
        }
    });

    return Canvas;
}());