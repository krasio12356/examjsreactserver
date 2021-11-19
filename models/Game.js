const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    whites: {type: Schema.Types.ObjectId, ref: 'Player'},
    blacks: {type: Schema.Types.ObjectId, ref: 'Player'},
    isCurrent: Boolean,
    notation: String
});

module.exports = model('Game', schema);