const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    name: String,
    hashedPassword: String,
    marks: [{type: Schema.Types.ObjectId, ref: 'Mark', default: []}],
    subjects: [{type: Schema.Types.ObjectId, ref: 'Subject', default: []}]
});

module.exports = model('Student', schema);