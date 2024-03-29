import { fs, parseArgs, config } from "../bot.js";

// gets the key params from cmdline and updates the configs
export default function updateFlagParams() {
    var argkeys = JSON.parse(fs.readFileSync('./json/flag-params.json', 'utf8'));
    var args = parseArgs(process.argv, argkeys);
    console.log("got argkeys");

    config.chorobotEnabled = args.c;
    config.airsoftSnipeEnabled = args.z;
    config.sassEnabled = args.s;
    config.fishingEnabled = args.f;
    config.pickingEnabled = args.p;
    config.killMode = args.k;
    config.mockingEnabled = args.m;
    config.allowanceEnabled = args.a;
    config.pickThreshold = args.hasOwnProperty('threshold') ? args.threshold : config.pickThreshold;
    config.resetTime = args.hasOwnProperty('reset') ? args.reset : config.resetTime;
    config.allowance = args.hasOwnProperty('allowance') ? args.allowance : config.allowance;
    config.url = args.hasOwnProperty('url') ? args.url : config.url;

    console.log("chorobot enabled: " + config.chorobotEnabled);
    console.log("airsoft snipe enabled: " + config.airsoftSnipeEnabled);
    console.log("sassy bot: " + config.sassEnabled);
    console.log("autofishing: " + config.fishingEnabled);
    console.log("autopicking: " + config.pickingEnabled);
    console.log("autopicking snipe probability: " + config.pickThreshold);
    console.log("kill mode: " + config.killMode);
    console.log("mocking: " + config.mockingEnabled);
    console.log("allowance: " + config.allowanceEnabled);
    console.log("reset time: " + config.resetTime);
    console.log("allowance amount: " + config.allowance);
    console.log("airsoft snipe URL: " + config.url);
    console.log("\n");
}
