const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    playername: String,
    token: String,
    rank: Number,
    hashedPassword: String,
    gamesPlayed: [{type: Schema.Types.ObjectId, ref: 'Game', default: []}],
    gamePlayingNow: {type: Schema.Types.ObjectId, ref: 'Game'},
});

module.exports = model('Player', schema);