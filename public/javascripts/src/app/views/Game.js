Snake.Views.Game = (function () {

    var Game = Backbone.View.extend({

        el: '#app',

        views: {},

        models: {},

        collections: {},

        keyMap: {
            37: 'west',
            38: 'north',
            39: 'east',
            40: 'south'
        },

        keyListener: null,

        initialize: function (options) {
            this.keyListener = new Snake.Models.KeyListener(this.keyMap);
            this.models.game = new Snake.Models.Game({}, {
                socket: options.io.connect(window.location.pathname)
            });
            this.collections.players = new Snake.Collections.Players();
            this.models.player = new Snake.Models.Player();
            this._initializeModels();
            this._initializeViews();
            this._initializeKeys();
            this._initializeGlobalEvents();
        },

        _initializeViews: function () {
            this.views.messages = new Snake.Views.Messages();

            this.views.scores = new Snake.Views.Scores({
                model: this.models.player
            });

            this.views.powerUps = new Snake.Views.PowerUps({
                model: this.models.player
            });

            this.views.controls = new Snake.Views.Controls({
                model: this.models.game,
                player: this.models.player,
                players: this.collections.players
            });

            this.views.players = new Snake.Views.Players({
                model: this.collections.players
            });

            this.views.canvas = new Snake.Views.Canvas({
                model: this.models.game,
                player: this.models.player
            });

            this.views.canvas.on('rendered', function () {
                Snake.trigger('messages:clear');
            });
        },

        _initializeModels: function () {

            this.models.game.on('change', this._onGameChange, this);
            this.models.game.on('connect:error', function () {
                Snake.trigger('error:show', 'Game could not be found');
            }, this);
            this.models.game.on('game:start:success', function () {
                Snake.trigger('messages:clear');
            }, this);
            this.models.game.on('player:join:success', function () {
                this.keyListener.listen();
            }, this);
            this.models.game.on('player:join:error', function () {
                this.models.player.unset('name');
            }, this);

            this.models.player.on('change:alive', this._onPlayerDeadOrAlive, this);
            this.models.player.on('change:name', function (model, name) {
                this.models.game.join(name);
            }, this);
            this.models.player.on('change:direction', function (model, direction) {
                this.models.game.sendPlayerDirection(direction);
            }, this);
        },

        _initializeKeys: function () {
            _.each(this.models.game.directions, function (direction) {
                this.keyListener.on('press:' + direction, function (direction) {
                    if (this.models.game.isRunning() && this.models.player.get('alive')) {
                        this.models.player.set({ direction: direction });
                    }
                }, this);
            }, this);
        },

        _initializeGlobalEvents: function () {
            Snake.on('message:flash', function (message, duration) {
                this.views.messages.flash(message, duration);
            }, this);

            Snake.on('error:flash', function (error, duration) {
                this.views.messages.flash(error, duration, Snake.Views.Messages.ERROR);
            }, this);

            Snake.on('message:show', function (message) {
                this.views.messages.render(message);
            }, this);

            Snake.on('error:show', function (error) {
                this.views.messages.render(error, Snake.Views.Messages.ERROR);
            }, this);

            Snake.on('messages:clear', function () {
                this.views.messages.clear();
            }, this);
        },

        _onGameChange: function () {
            this.collections.players.reset(this.models.game.get('players'));
            var player = this.collections.players.get(this.models.player.get('name'));
            if (!_.isUndefined(player)) {
                this.models.player.set(_.omit(player.toJSON(), 'direction'));
            }
        },

        _onPlayerDeadOrAlive: function (model, alive) {
            if (!alive) {
                this.models.player.unset('direction', { silent: true });
                var message = 'You died!';
                if (this.models.game.get('status') !== Snake.Models.Game.STATUS_OVER) {
                    message += ' Respawning in ' + (this.models.game.respawnTime / 1000) + ' seconds...';
                    setTimeout(_.bind(function () {
                        this.models.game.respawn();
                    }, this), this.models.game.respawnTime);
                }
                Snake.trigger('message:flash', message, this.models.game.respawnTime);
            }
        }
    });

    return Game;
}());
