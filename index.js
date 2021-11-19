const express = require('express');
const connect = require('./database/connect');
const {routes} = require('./routes/routes');
const middlewares = require('./middlewares/midlewares')
const PORT = 5000;

start();

async function start()
{
    const app = express();
    middlewares(app);
    await connect();
    app.use(express.json());
    routes(app);

    app.listen(PORT, () => 
    {
        console.log(`Application started at http://localhost:${PORT}`)
    });
}



  /*const question = new Question({ text: 'How many bits are there in 1 byte ?',
                                answer1: '4',
                                answer2: '8',
                                answer3: '12',
                                correct: '8'});
  await question.save();
  console.log(question)*/
