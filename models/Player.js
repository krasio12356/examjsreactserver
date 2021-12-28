const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    playername: String,
    token: String,
    rank: Number,
    consecutiveWins: Number,
    hashedPassword: String,
    gamesPlayed: [{type: Schema.Types.ObjectId, ref: 'Game', default: []}],
    gamesPlayingNow: [{type: Schema.Types.ObjectId, ref: 'Game', default: []}],
});

module.exports = model('Player', schema);