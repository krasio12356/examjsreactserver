const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    name: String,
    hashedPassword: String,
    subjects: [{type: Schema.Types.ObjectId, ref: 'Subject', default: []}],
});

module.exports = model('Creator', schema);