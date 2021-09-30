const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    questions: [{type: Schema.Types.ObjectId, ref: 'Question', default: []}]
});

module.exports = model('Subject', schema);