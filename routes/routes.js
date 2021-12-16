const Player = require('../models/Player');
const Challenge = require('../models/Challenge');
const Game = require('../models/Game');
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
    app.post('/challengesOut', async (req, res) =>
    {
        console.log(req.body);
        let challenger = await getPlayerByToken(req.body.authorization);
        if (challenger)
        {
            let challenges = await getChallengesByChallengerId(challenger._id);
            let answer = [];
            for (let i = 0; i < challenges.length; i++)
            {
                let obj = {};
                let enemy = await getPlayerById(challenges[i].enemy);
                obj.playername = enemy.playername;
                obj.rank = enemy.rank;
                obj.gamecount = enemy.gamesPlayed.length;
                obj._id = enemy._id;
                answer.push(obj);
            }
            res.json(answer);
        }
        else res.json('');
    });

    app.post('/challengesIn', async (req, res) =>
    {
        console.log(req.body);
        let enemy = await getPlayerByToken(req.body.authorization);
        if (enemy)
        {
            let challenges = await getChallengesByEnemyId(enemy._id);
            let answer = [];
            for (let i = 0; i < challenges.length; i++)
            {
                let obj = {};
                let challenger = await getPlayerById(challenges[i].challenger);
                obj.playername = challenger.playername;
                obj.rank = challenger.rank;
                obj.gamecount = challenger.gamesPlayed.length;
                obj._id = challenger._id;
                answer.push(obj);
            }
            res.json(answer);
        }
        else res.json('');
    });

    app.post('/deleteChallenge', async (req, res) =>
    {
        console.log(req.body);
        let player = await getPlayerByToken(req.body.authorization);
        if (player)
        {
            let result = await Challenge.deleteMany({challenger: player._id, enemy: req.body._id});
            res.json(result);
        }
        else res.json({unauthorized: 'yes'});
    });
    app.post('/acceptChallenge', async (req, res) =>
    {
        console.log(req.body);
        let player = await getPlayerByToken(req.body.authorization);
        if (player)
        {
            let result = await Challenge.deleteMany({enemy: player._id, challenger: req.body._id});
            let game = await createGame(req.body._id, player._id);
            let challenger = await getPlayerById(req.body._id);
            let answer = {};
            answer.enemyName = player.playername;
            answer.challengerName = challenger.playername;
            answer._id = game._id;
            answer.isCurrent = game.isCurrent;
            answer.notation = game.notation;
            res.json(answer);
        }
        else res.json({unauthorized: 'yes'});
    });
    app.post('/rejectChallenge', async (req, res) =>
    {
        console.log(req.body);
        let player = await getPlayerByToken(req.body.authorization);
        if (player)
        {
            let result = await Challenge.deleteMany({enemy: player._id, challenger: req.body._id});
            res.json(result);
        }
        else res.json({unauthorized: 'yes'});
    });
    app.post('/currentGames', async (req, res) =>
    {
        console.log(req.body);
        let player = await getPlayerByToken(req.body.authorization);
        if (player)
        {
            let white = await getCurrentGamesByWhitesId(player._id);
            let black = await getCurrentGamesByBlacksId(player._id);
            let whiteanswer = [];
            let blackanswer = [];
            let answer = [];
            for (let i = 0; i < white.length; i++)
            {
                let obj = {};
                let blackplayer = await getPlayerById(white[i].blacks);
                obj._id = white[i]._id.toString();
                obj.whites = player.playername;
                obj.blacks = blackplayer.playername;
                whiteanswer.push(obj);
            }
            for (let i = 0; i < black.length; i++)
            {
                let obj = {};
                let whiteplayer = await getPlayerById(black[i].whites);
                obj._id = black[i]._id.toString();
                obj.blacks = player.playername;
                obj.whites = whiteplayer.playername;
                if (whiteanswer.findIndex(x => x._id == obj._id) < 0)
                {
                    blackanswer.push(obj);
                }
            }
            answer = whiteanswer.concat(blackanswer);
            res.json(answer);
        }
        else res.json('');
    });
}

async function getCurrentGamesByWhitesId(id)
{
    let games = await Game.find({whites: id, isCurrent: true});
    return games;
}

async function getCurrentGamesByBlacksId(id)
{
    let games = await Game.find({blacks: id, isCurrent: true});
    return games;
}

async function getChallengesByChallengerId(id)
{
    let challenges = await Challenge.find({challenger: id});
    return challenges;
}

async function getChallengesByEnemyId(id)
{
    let challenges = await Challenge.find({enemy: id});
    return challenges;
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

async function createGame(challenger, enemy)
{
    const game = new Game({
        whites: enemy,
        blacks: challenger,
        isCurrent: true,
        notation: '/',
    });
    await game.save();
    return game;
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