const jwt = require('jsonwebtoken');

const TOKEN_SECRET = 'verysecret';

function generateToken(userData)
{
    return jwt.sign({
        _id: userData._id,
        username: userData.username,
    },
    TOKEN_SECRET);
}

function parseToken(token)
{
    if (token)
    {
        try
        {
            const userData = jwt.verify(token, TOKEN_SECRET);
            req.user = userData;
            res.locals.user = userData;
        }
        catch(err)
        {
            //res.clearCookie(COOKIE_NAME);
            //res.redirect('/auth/login');
            
            return false;
        }
    }
    return true;
}

module.exports =
{
    generateToken,
    parseToken,
    TOKEN_SECRET
}