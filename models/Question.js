const {Schema, model} = require('mongoose');

const schema = new Schema(
{
    text: String,
    answer1: String,
    answer2: String,
    answer3: String,
    correct: String
});

module.exports = model('Question', schema);