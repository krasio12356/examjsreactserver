const {Question} = require('../models/Question');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authservice = require('../services/authservice');

function routes(app)
{
    
    app.post('/register', async (req, res) =>
    {
        console.log(req.body);
        //res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({foo: 'bar'});
        /*
        let invalid = false;
        let username = req.body.username;
        if (username.length < 1) invalid = true;
        let password = req.body.password;
        if (password.length < 3) invalid = true;
        let userexists = false;
        let user = await getUserByUsername(username);
        if (user) userexists = true;
        if (invalid)
        {
            
        }
        else if (userexists)
        {

        }
        else
        {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await createUser(username, email, hashedPassword);
            const token = generateToken(user);
            res.cookie(COOKIE_NAME, token);
            let context = {};
            context.user = username;
            
            res.render('/', context);
        }*/
    });
}

async function getUserByUsername(username)
{
    const pattern = new RegExp(`^${username}$`, 'i');
    const user = await User.findOne({username: {$regex: pattern}});
    return user;
}

async function getUserByEmail(email)
{
    const pattern = new RegExp(`^${email}$`, 'i');
    const user = await User.findOne({email: {$regex: pattern}});
    return user;
}

async function createUser(username, email, hashedPassword)
{
    const user = new User({
        username,
        email,
        hashedPassword
    });
    await user.save();
    return user;
}

function generateToken(userData)
{
    return jwt.sign({
        _id: userData._id,
        username: userData.username,
        email: userData.email,
    },
    TOKEN_SECRET);
}

module.exports =
{
    routes
}