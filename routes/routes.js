const Player = require('../models/Player');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PLAYER_SECRET = 'player';

function routes(app)
{
    
    app.post('/registerPlayer', async (req, res) =>
    {
        console.log(req.body);
        let invalid = false;
        let playername = req.body.playername;
        if (playername.length < 1) invalid = true;
        let password = req.body.password;
        if (password.length < 3) invalid = true;
        let playerexists = false;
        let player = await getPlayerByPlayername(playername);
        if (player) playerexists = true;
        if (invalid)
        {
            res.json({invalid: true});
        }
        else if (playerexists)
        {
            res.json({player: true});
        }
        else
        {
            const hashedPassword = await bcrypt.hash(password, 10);
            const player = await createPlayer(playername, hashedPassword);
            const token = generateToken({name: playername, _id: player._id}, PLAYER_SECRET);
            player.token = token;
            player.rank = 0;
            player.gamesPlayed = [];
            player.gamePlayingNow = null;
            await player.save();
            res.json(player);
        }
    });
}

async function getPlayerByPlayername(playername)
{
    const pattern = new RegExp(`^${playername}$`, 'i');
    const player = await Player.findOne({playername: {$regex: pattern}});
    return player;
}

async function createPlayer(playername, hashedPassword)
{
    const player = new Player({
        playername,
        hashedPassword,
    });
    await player.save();
    return player;
}

function generateToken(playerData)
{
    return jwt.sign({
        _id: playerData._id,
        playername: playerData.playername,
    },
    PLAYER_SECRET);
}

function parseToken(token)
{
    if (token)
    {
        try
        {
            const playerData = jwt.verify(token, PLAYER_SECRET);
            req.player = playerData;
            res.locals.player = playerData;
        }
        catch(err)
        {
            return false;
        }
    }
    return true;
}

module.exports =
{
    routes
}