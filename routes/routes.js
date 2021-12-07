const Player = require('../models/Player');
const Challenge = require('../models/Challenge');
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
            let data = {};
            data.playername = player.playername;
            data._id = player._id;
            data.token = player.token;
            data.rank = player.rank;
            res.json(data);
        }
    });
    app.post('/login', async (req, res) =>
    {
        let data = {};
        console.log(req.body);
        let player = await getPlayerByPlayername(req.body.playername);
        if (!player)
        {
            res.json({error: 'invalid'});
        }
        const hasMatch = await bcrypt.compare(req.body.password, player.hashedPassword);
        if (!hasMatch)
        {
            res.json({error: 'invalid'});
        }
        data.playername = player.playername;
        data._id = player._id;
        data.token = player.token;
        data.rank = player.rank;
        res.json(data);
    });
    app.post('/playerList', async (req, res) =>
    {
        console.log(req.body);
        let player = await getPlayerByToken(req.body.authorization);
        if (!player)
        {
            res.json({error: 'invalid'});
        }
        let all = await Player.find();
        res.json(all);
    });
    app.post('/challenge', async (req, res) =>
    {
        console.log(req.body);
        let challenger = await getPlayerByToken(req.body.authorization);
        if (!challenger)
        {
            res.json({status: 'no', error: 'invalidToken'});
        }
        let enemy = await getPlayerById(req.body._id);
        if (!enemy)
        {
            res.json({status: 'no', error: 'invalidId'});
        }
        let challenge = await createChallenge(challenger._id, enemy._id);
        res.json({status: 'yes', challenge});
    });
}

async function getPlayerByToken(token)
{
    const pattern = new RegExp(`^${token}$`, 'i');
    const player = await Player.findOne({token: {$regex: pattern}});
    return player;
}

async function getPlayerById(_id)
{
    const player = await Player.findOne({_id});
    return player;
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

async function createChallenge(_id1, _id2)
{
    const challenge = new Challenge({
        challenger: _id1,
        enemy: _id2
    });
    await challenge.save();
    return challenge;
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