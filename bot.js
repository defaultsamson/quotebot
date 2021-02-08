const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const sim = require('string-similarity');
const random = require('random');

const PREFIX = "!";
const ERROR_TIME = 20000;

let SETTINGS;
const SETTINGS_FILE = __dirname + "/settings.json";

let QUOTES;
const QUOTES_FILE = __dirname + "/quotes.json";
const PRETTY_QUOTES_FILE = __dirname + "/quotes.txt";
const REMOVED_FILE = __dirname + "/removed.json";

function startBot() {
    SETTINGS = loadSettings();
    QUOTES = loadQuotes();

    // Starts client from token
    client.login(SETTINGS.token);
}

let COMMANDS = [];

// Quote command
COMMANDS.push({
    aliases: ["quote", "q", "addquote", "quoteadd", "create"],
    usage: ["!quote",
            "!quote <message_to_quote>",
            "!quote <quote_number>"],
    func: (m, mess) => {
        parseQuoteSyntax(m, mess);
    }
});
// Remove command
COMMANDS.push({
    aliases: ["remove", "delete", "quoteremove", "removequote", "quotedelete", "deletequote"],
    usage: ["!remove <quote_number>"],
    func: (m, mess) => {
        let splitMess = mess.split(" ");
        if (splitMess.length === 1) {

            let num = parseNumber(splitMess[0], m) - 1;
            if (num >= QUOTES.length) {
                m.reply(getInsult() + "Quote #" + num + " doesn't exist.").catch(console.error);
                return;
            }
            if (num < 0) return;
            // Add the quote to the removed quotes list
            let removed = loadRemoved();
            removed.push(QUOTES[num]);
            saveRemoved(removed);
            // Remove the quote from the quotes list
            QUOTES.splice(num, 1); // Delete the quote from the array
            saveQuotes(); // Save the new array to the file


            // Delete the original message
            m.delete().catch(console.error);
            m.reply("#" + (num + 1) + " removed.").then(msg => msg.delete({ timeout: ERROR_TIME })).catch(console.error);

        } else {
            m.reply(getInsult() + " I only expected a single number afterwards.").catch(console.error);
        }
    }
});
// Search quote command
COMMANDS.push({
    aliases: ["search", "s", "find", "f", "findquote", "quotefind", "searchquote"],
    usage: ["!search <message_to_search>"],
    func: (m, mess) => {
        if (QUOTES.length === 0) {
            console.log("ERROR: No quotes found");
            m.reply("No quotes found.").catch(console.error);
        } else {
            var matches = sim.findBestMatch(mess, QUOTES);
            var result = matches.bestMatch.target;
            m.reply("#" + (matches.bestMatchIndex + 1) + ": " + result).catch(console.error);
        }
    }
});
// Roll command
COMMANDS.push({
    aliases: ["roll"],
    usage: ["!roll",
            "!roll <number>",
            "!roll [number] [number] ..."],
    func: (m, mess) => {
        let splitMess = mess.split(" ");
        // If nothing is given, roll a D20
        if (!mess) {
            m.reply(random.int(1, 20) + "/20");
        } else {
            let replyMess = "";
            for (i in splitMess) {
                let num = parseNumber(splitMess[i], m);
                if (num < 0) return;
                replyMess += random.int(1, num) + "/" + num + " ";
            }
            m.reply(replyMess);
        }
    }
});
// Reload command
COMMANDS.push({
    aliases: ["reload"],
    usage: ["!reload"],
    func: (m, mess) => {
        QUOTES = loadQuotes();
        m.reply("Reloaded quotes.");
    }
});
// Setting quotes channel command
COMMANDS.push({
    aliases: ["setchannel", "quoteschannel", "channel", "channelset"],
    admin: true,
    usage: ["!setchannel <channel_id>",
            "!setchannel <channel_name>"],
    func: (m, mess) => {
                      console.log("asdgoauisydtgaoiusdygbaisudyhygavbsoduyagsbdouaysdgvboiauytybg");
                      /** TODO test if the message is a valid channel
        if (mess) {

        }*/

        SETTINGS.quotesChannel = mess;
        saveSettings();
        m.reply("Set channel.");
    }
});

// Stores the command aliases for all commands
let COMMAND_ALIASES = [];
for (c in COMMANDS) {
    let com = COMMANDS[c];
    for (i in com.aliases) {
        COMMAND_ALIASES.push(com.aliases[i]);
    }
}

function findSimilarAlias(comm) {
    // Search through the aliases of every command to find the best fitting one
    var matches = sim.findBestMatch(comm, COMMAND_ALIASES);
    // console.log(JSON.stringify(matches, null, 4))
    return matches.bestMatch;
}

function commandFromAlias(cAlias) {
    for (c in COMMANDS) {
        let com = COMMANDS[c];
        for (i in com.aliases) {
            if (com.aliases[i] === cAlias) {
                return com;
            }
        }
    }
    return null;
}

function loadSettings() {
    try {
        let toRet = JSON.parse(fs.readFileSync(SETTINGS_FILE));
        console.log("Loaded settings");
        return toRet;
    } catch (err) {
        console.log("No settings found");
        return {};
    }
}

function saveSettings() {
    fs.writeFile(SETTINGS_FILE, JSON.stringify(SETTINGS, null, 4), (err) => {});
}

function loadRemoved() {
    try {
        let toRet = JSON.parse(fs.readFileSync(REMOVED_FILE));
        console.log("Loaded removed quotes: " + toRet.length);
        return toRet;
    } catch (err) {
        console.log("No removed quotes found");
        return [];
    }
}

function saveRemoved(removedQuotes) {
    fs.writeFile(REMOVED_FILE, JSON.stringify(removedQuotes, null, 4), (err) => {});
}

function loadQuotes() {
    try {
        let toRet = JSON.parse(fs.readFileSync(QUOTES_FILE));
        console.log("Loaded quotes: " + toRet.length);
        return toRet;
    } catch (err) {
        console.log("No quotes found");
        return [];
    }
}

function saveQuotes() {
    try {
        fs.writeFileSync(QUOTES_FILE, JSON.stringify(QUOTES, null, 4));
    } catch (err) {
        console.log(err);
    }

    let tempquotes = [];
	for (i in QUOTES) {
        var num = parseInt(i) + 1;
        tempquotes.push("#" + num + ": " + QUOTES[i]);
	}

    try {
        fs.writeFileSync(PRETTY_QUOTES_FILE, tempquotes.join("\n"));
    } catch (err) {
        console.log(err);
    }
}

function getInsult() {
    return INSULTS[random.int(0, INSULTS.length - 1)];
}

function parseNumber(num, m) {
    num = parseInt(num, 10);
	if (isNaN(num)) {
        m.reply(getInsult() + " That wasn't a number.").catch(console.error);
        return -1;
	}
	if (num <= 0) {
        m.reply(getInsult() + " Give a number greater than zero.").catch(console.error);
        return -1;
	}
    return num;
}

function parseQuoteSyntax(m, mess) {
    let splitMess = mess.split(" ");

	// If there's nothing after the first @ or !q, must be requesting a random quote
    if (!mess) {

        if (QUOTES.length === 0) {
            console.log("ERROR: No quotes found");
            m.reply("No quotes found.").catch(console.error);
		} else {
            let n = random.int(0, QUOTES.length - 1);
            m.reply("#" + (n + 1) + ": " + QUOTES[n]).catch(console.error);
		}
	// If there's only one thing after the command, find that numbered quote
    } else if (splitMess.length === 1) {

        let num = parseNumber(splitMess[0], m) - 1;
        if (num >= QUOTES.length) {
            m.reply(getInsult() + " Quote #" + (num + 1) + " doesn't exist.").catch(console.error);
            return;
        }
        if (num < 0) return;
        m.reply("#" + (num + 1) + ": " + QUOTES[num]).catch(console.error);

	// Else it must be a quote
    } else {
        QUOTES.push(mess);
        saveQuotes();

		// Find the quotes channel based on the ID
        let quotesChannel = m.guild.channels.resolve(SETTINGS.quotesChannel);

        // If there's a quotes channel, send the message there
		if (quotesChannel) {
            quotesChannel.send("#" + QUOTES.length + ": " + mess).catch(console.error);
		} else {
            m.reply("Couldn't find quotes channel (ID: " + SETTINGS.quotesChannel + ").").catch(console.error);
            console.log("ERROR: Couldn't find quotesChannel");
		}
        m.delete().catch(console.error);
        m.reply("#" + QUOTES.length + " added.").then(msg => msg.delete({ timeout: ERROR_TIME })).catch(console.error);
	}
}

client.on("ready", () => {
    console.log("Logged in as " + client.user.tag);
})

client.on("message", m => {
    // Ignore the bot's own messages
    if (m.author.id === client.user.id) return;

    // Capture the user's (whitespace-trimmed) message
    var mess = m.content.trim();
    // Filter out non-standard quotation marks
    mess = mess.replaceAll("“","\"");

    // If the bot is @'d, treat it as quote syntax
    if (m.mentions.users.has(client.user.id)) {
        let prefix = mess.split(" ")[0];
        parseQuoteSyntax(m, mess.replace(prefix, " ").trim());
    }

    // Return if there's no prefix (and check that it's not something like "!!!!")
    if (mess.charAt(0) !== PREFIX || mess.charAt(1) === PREFIX) {
        return;
    }
    // Remove the prefix
    mess = mess.replace(PREFIX, "");

    // Get the command with the best matching alias
    let originalAlias = mess.split(" ")[0];
    let bestMatchAlias = findSimilarAlias(originalAlias);
    // if above 50% similarity, assume that the best alias is the correct one
    if (bestMatchAlias.rating > 0.50) {
        let command = commandFromAlias(bestMatchAlias.target);
        // Remove the alias from the start of mess
        // Remmove any spaces at the beginning and end of mess
        command.func(m, mess.replace(originalAlias, "").trim());
    }
    // If <= 50% but above 25% similarity, suggest the change
    else if (bestMatchAlias.rating > 0.25) {
        m.reply("You sent `" + PREFIX + originalAlias + "`, did you mean `" + PREFIX + bestMatchAlias.target + "`?\nUse `" + PREFIX + "help` for more commands.");
    } else {
        m.reply(getInsult() + "\nUse `" + PREFIX + "help` for more commands.");
    }
})

let INSULTS = [];
INSULTS.push("What the fuck did you just fucking say to me, you little bitch?")
INSULTS.push("I hope someone forces you to shit out lego.")
INSULTS.push("I hope your kneecaps get stolen by an elf.")
INSULTS.push("Stop it, you absolute hobgoblin, unsatisfactory coitus with you isn't going to magically cure my fucking cronic migrane.")
INSULTS.push("Fuck you, I'm in searing pain you ingrate.")
INSULTS.push("Say it right next time, you cold corndog.")
INSULTS.push("I'll personally give you pinkeye.")
INSULTS.push("Go fuck yourself and put it on PornHub.")
INSULTS.push("Give your balls a tug, ya tit fucker.")
INSULTS.push("You're the used tissue that got left on the ground that nobody wants to pick up.")
INSULTS.push("You act like someone who orders a pizza with a mix of pineapples, onions, and chocolate, then eats it with a fucking spoon.")
INSULTS.push("You gave my rat aids.")
INSULTS.push("You're a modly piece of Life cereal that looks like it was dipped in a fresh steaming pile of Grinch shit.")
INSULTS.push("I will stick a banana so far up your ass that you'll be smelling it next morning.")
INSULTS.push("Your scalloped potatoes are fucked.")
INSULTS.push("You have the personality of mayonnaise in a ketchup bottle.")
INSULTS.push("Everyone knows the only thing you've fucked is your car exhaust.")
INSULTS.push("The last thing I want is a dialogue with this cold slice of leftover meatloaf.")
INSULTS.push("You're the thing you pull out of the sink drain that the disposal couldn't grind up.")

startBot();

// https://discordapp.com/oauth2/authorize?&client_id=622290044287188993&scope=bot&permissions=75776
