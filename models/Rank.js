const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    value: Number,
    players: [{type: Schema.Types.ObjectId, ref: 'Player', default: []}]
});

module.exports = model('Rank', schema);