Snake.Models.GameClient = (function () {

    var GameClient = Backbone.Model.extend({

        respawnTime: 3000,

        _socketEvents: [
            'connect:success',
            'connect:error',
            'game:tick',
            'game:over',
            'game:start:success',
            'game:pause:success',
            'game:reset:success',
            'game:start:error',
            'player:respawn:success',
            'player:join:success',
            'player:leave:success',
            'player:join:error'
        ],

        initialize: function (options) {
            this.socket = options.socket;
            this.player = options.player;
            this.players = new Snake.Collections.Players();

            this.on('change', this._onChange, this);

            this.on('player:join:error', function () {
                this.player.unset('name');
            }, this);

            this.on('player:respawn:success', function () {
                this.player.unset('direction', { silent: true });
            }, this);

            this.player.on('join', function () {
                this.join(this.player.get('name'));
            }, this);

            this.player.on('change:direction', function () {
                if (this.isRunning() && this.player.get('alive')) {
                    this.sendPlayerDirection(this.player.get('direction'));
                }
            }, this);

            this._initializeSocket();
        },

        _initializeSocket: function () {
            _.each(this._socketEvents, function (event) {
                this.socket.on('connect', function () {

                });
                this.socket.on(event, _.bind(function (data) {
                    if (event !== 'game:tick') {
                        console.log('received', event, data);
                    }
                    if (data.game) {
                        this.set(data.game);
                    }
                    if (event.indexOf(':error') > 0 && data.message) {
                        Snake.App.trigger('error:flash', data.message, 2000);
                    }
                    this.trigger(event, data, this);
                }, this));
            }, this);
        },


        _onChange: function (model) {
            var serverPlayer;
            if (this.get('players')) {
                this.players.reset(_.map(this.get('players'), function (player) {
                    player.id = player.name;
                    return player;
                }, this));
                serverPlayer = this.players.get(this.player.get('name'));
                if (serverPlayer) {
                    this.player.set(_.omit(serverPlayer.toJSON(), 'direction'));
                }
            }
        },

        respawn: function () {
            this.send('player:respawn');
        },

        play: function () {
            this.send('game:start');
        },

        pause: function () {
            this.send('game:pause');
        },

        reset: function () {
            this.send('game:reset');
        },

        join: function (name) {
            this.send('player:join', { name: name });
        },

        sendPlayerDirection: function (direction) {
            this.send('player:command', { direction: direction });
        },

        isRunning: function () {
            return this.get('status') === 'playing';
        },

        send: function (message, data) {
            this.socket.emit(message, data);
            console.log('sent', message, data);
        }
    });

    return GameClient;
}());