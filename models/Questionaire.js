const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    subject: {type: Schema.Types.ObjectId, ref: 'Subject', required: true},
    questions: [{type: Schema.Types.ObjectId, ref: 'Question', default: []}]
});

module.exports = model('Questionaire', schema);