// require
require('babel-register');

export var Discord = require('discord.io');
export var fs = require('fs');
export var parseArgs = require('minimist');
export var _ = require('lodash');

import updateFlagParams from "./js/utils.js";
import getFishy from "./js/fishing.js";
import getSassy from "./js/sassing.js";
import refreshScanLoop from "./js/airwatch.js";
import pickFlower from "./js/flowerPicking.js";
import mockify from "./js/spongebob.js";
import handleChannels from "./js/channels.js";
// import triviaSolver from "./js/triviaSolver.js";
import handleAllowance, {
    allowanceTimer
}
from "./js/allowance.js";
import handleUsers from "./js/users.js";

// read json files - config, creds, users
var creds = JSON.parse(fs.readFileSync('./json/credentials.json', 'utf8'));
export var config = JSON.parse(fs.readFileSync('./json/config.json', 'utf8'));
export var channels = (JSON.parse(fs.readFileSync('./json/channels.json', 'utf8'))).channels;
export var users = (JSON.parse(fs.readFileSync('./json/users.json', 'utf8'))).users;
export var permissions = (JSON.parse(fs.readFileSync('./json/permissions.json', 'utf8'))).permissions;
export var allowance = (JSON.parse(fs.readFileSync('./json/allowance.json', 'utf8'))).allowance;
export var triviaQuestions = (JSON.parse(fs.readFileSync('./json/trivia_questions.json', 'utf8')));

// bots
var discordToken = creds.token;
export var channelID = creds.channelID;
export var discordBot;

var startedTrivia = false;
// bot uptime tracking
var startTime = new Date();

// gogogogogogo
init();

// init client
function init() {
    updateFlagParams();
    createDiscordBot();

    if (config.allowanceEnabled) {
        allowanceTimer();
    }
}

// init discord bot
function createDiscordBot() {
    // get discord client
    console.log("initializing discord bot");
    discordBot = new Discord.Client({
        autorun: true,
        token: discordToken
    })
    console.log("-> discord bot initialized");
    // start bot
    discordBot.on('ready', function (event) {
        console.log('-> logged in as %s - %s\n', discordBot.username, discordBot.id);

        // begin fishing
        if (config.fishingEnabled) {
            console.log('starting to fish');
            getFishy();
        }

        // start primary text listeners
        discordBot.on('message', processTextMessage);

        // airsoft deal sniping modules
        if (config.airsoftSnipeEnabled) {
            refreshScanLoop();
        }
        if (config.triviaSolverEnabled) {
            console.log("start trivia");
            discordBot.sendMessage({
                channel: channelID,
                message: ".t"
            });
            startedTrivia = true;
        }
    });

    // Automatically reconnect if the bot disconnects due to inactivity
    discordBot.on('disconnect', function (err, code) {
        console.log('----- Bot disconnected from Discord with code', code, 'for reason:', err, '-----');
        discordBot.removeListener('message', processTextMessage);
        discordBot.connect();
    });
}

// run message watchers
function processTextMessage(user, userID, channelID, message, event) {
    // logging
    // console.log("user ", user);
    // console.log("userID ", userID);
    // console.log("channelID ", channelID);
    // console.log("message ", message);
    // // console.log("event ", event);
    // // console.log("event embeds" , event.d.embeds);
    // console.log("\n");

    if (config.chorobotEnabled) {
        handleChannels(channelID, userID, message);
        handleUsers(user, userID, channelID);
    }

    // sass when ppl mention user
    if (config.sassEnabled) {
        var mentions = event.d.mentions;
        mentions.forEach(function (mention) {
            // console.log(mention.username);
            if (mention.username === discordBot.username) {
                getSassy(channelID);
            }
        });
    }

    // take their life and their dreams
    if (config.pickingEnabled) {
        if (message.endsWith("`.pick`")) {
            pickFlower(channelID);
        }
    }


    // $mock
    if (config.mockingEnabled) {
        if (message.startsWith("$mock")) {
            mockify(message, channelID);
        }
    }

    // allowance
    if (config.allowanceEnabled) {
        handleAllowance(userID, channelID, message);
    }
    
    if (config.triviaSolverEnabled) {
        event.d.embeds.forEach((embed) => {
            console.log(embed);
            if (embed.title=="Trivia Game" && embed.fields) {
                var temp = embed.fields[1].value;
                var question = temp.replace(/\\/g,'');
                console.log(question);
                triviaQuestions.forEach(function(q) {
                    if (q.Question.replace(/\\/g,'') == question) {
                        discordBot.sendMessage({
                            to: channelID,
                            message: q.Answer.replace(/\\/g,'')
                        });
                    }
                });
            }
            if (embed.title == "Final Results" || !startedTrivia) {
                discordBot.sendMessage({
                    to: channelID,
                    message: '.t'
                });
                startedTrivia = true;
            }
        });
    }
}
