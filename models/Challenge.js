const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    challenger: {type: Schema.Types.ObjectId, ref: 'Player'},
    enemy: {type: Schema.Types.ObjectId, ref: 'Player'}
});

module.exports = model('Challenge', schema);