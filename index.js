const express = require('express');
const connect = require('./database/connect');
const Question = require('./models/Question')
const PORT = 5000;

start();

async function start()
{
    const app = express();
    await connect();

    app.listen(PORT, () => 
    {
        console.log(`Application started at http://localhots:${PORT}`)
    });
}



  /*const question = new Question({ text: 'How many bits are there in 1 byte ?',
                                answer1: '4',
                                answer2: '8',
                                answer3: '12',
                                correct: '8'});
  await question.save();
  console.log(question)*/
