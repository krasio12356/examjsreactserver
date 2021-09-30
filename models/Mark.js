const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    subject: {type: Schema.Types.ObjectId, ref: 'Subject', required: true},
    value: Number
});

module.exports = model('Mark', schema);