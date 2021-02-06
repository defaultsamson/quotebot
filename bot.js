
const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const sim = require('string-similarity');
const random = require('random')

const PREFIX = "!"

const QUOTES_FILE = __dirname + "/quotes.json"
const PRETTY_QUOTES_FILE = __dirname + "/quotes.txt"
const REMOVED_FILE = __dirname + "/removed.json"
const TOKEN_FILE = __dirname + "/token.txt"
const QUOTES_CHANNEL_ID = "622277602782085120"
const BOT_ID = "622290044287188993"
const EMILY_ID = "158303370182918144"
const ERROR_TIME = 20000

let QUOTES = []
let REMOVED = []
let INSULTS = []

function startBot() {
    loadFile()

    // Starts client from token file
    fs.readFile(TOKEN_FILE, (err, data) => {
        if (err) {
            console.log(err)
            return
        } else {
            client.login(JSON.parse(data))
        }
    })
}

let COMMANDS = []

COMMANDS.push({
    aliases: ["quote", "q", "addquote", "add quote", "quote add", "create"],
    usage: ["!quote", "!quote <message_to_quote>", "!quote <quote_number>"],
    func: (m, mess) => {
        console.log("quote")
    }
})

function saveFile() {
	fs.writeFile(QUOTES_FILE, JSON.stringify(QUOTES), (err) => {
		if (err) {
			console.log(err)
		} else {
            // console.log('File written!')
		}
	})

	let tempquotes = []
	for (i in QUOTES) {
		var num = parseInt(i) + 1
		tempquotes.push("#" + num + ": " + QUOTES[i])
	}

	fs.writeFile(PRETTY_QUOTES_FILE, tempquotes.join("\n"), (err) => {})

	fs.writeFile(REMOVED_FILE, JSON.stringify(REMOVED), (err) => {})
}


function loadFile() {
	fs.readFile(QUOTES_FILE, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			try {
				QUOTES = JSON.parse(data)
				console.log("Loaded quotes: " + QUOTES.length)
			} catch (e) {
				QUOTES = []
				console.log("No quotes found")
			}
		}
	})
	fs.readFile(REMOVED_FILE, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			try {
				REMOVED = JSON.parse(data)
				console.log("Loaded removed quotes: " + REMOVED.length)
			} catch (e) {
				REMOVED = []
				console.log("No removed quotes found")
			}
		}
	})
}

function getInsult() {
	return INSULTS[random.int(0, INSULTS.length - 1)]
}

function parseNumber(num, m) {
	num = parseInt(num, 10)
	if (isNaN(num)) {
		m.reply(getInsult() + " That wasn't a number.").catch(console.error)
		return -1
	}
	if (num <= 0) {
		m.reply(getInsult() + " Give a number greater than zero.").catch(console.error)
		return -1
	}
	return num
}

function parseQuoteSyntax(m, mess) {
	let splitMess = mess.split(" ")
	// If there's nothing after the first @ or !q, must be requesting a random quote
	if (splitMess.length == 1) {

		if (QUOTES.length == 0) {
			console.log("ERROR: No quotes found")
			m.reply("No quotes found.").catch(console.error)
		} else {
			let n = random.int(0, QUOTES.length - 1)
			m.reply("#" + (n + 1) + ": " + QUOTES[n]).catch(console.error)
		}
	// If there's only one thing after the command, find that numbered quote
	} else if (splitMess.length == 2) {

		let num = parseNumber(splitMess[1], m) - 1
		if (num >= QUOTES.length) {
        	        m.reply(getInsult() + "Quote #" + num + " doesn't exist.").catch(console.error)
        	        return
        	}
		if (num < 0) return
		m.reply("#" + (num + 1) + ": " + QUOTES[num]).catch(console.error)

	// Else it must be a quote
	} else {
		// puts all the quote into one big string
		let quote = ""
		for (let i = 1; i < splitMess.length; i++) quote += splitMess[i] + (i != splitMess.length -1 ? " " : "")

		QUOTES.push(quote)
		saveFile()

		// Find the quotes channel based on the ID
		let quotesChannel = m.guild.channels.resolve(QUOTES_CHANNEL_ID)
		// for (let c in m.guild.channels) if (c.id === QUOTES_CHANNEL_ID) quotesChannel = c

		if (quotesChannel) {
			quotesChannel.send("#" + QUOTES.length + ": " + quote).catch(console.error)
		} else {
			m.reply("Couldn't find quotes channel (ID: " + QUOTES_CHANNEL_ID + ").").catch(console.error)
			console.log("ERROR: Couldn't find quotesChannel")
		}
		m.delete().catch(console.error)
		m.reply("#" + QUOTES.length + " added.").then(msg => msg.delete({ timeout: ERROR_TIME })).catch(console.error)
	}
}

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag + "!")
})

client.on("message", m => {
	var mess = m.content
	if (m.author.id == BOT_ID) return;
    mess = mess.replaceAll("“","\"")

    // Return if there's no prefix (and check that it's not something like "!!!!")
    if (mess.charAt(0) != PREFIX || mess.charAt(1) == PREFIX) {
        return
    }
    // Remove the prefix
    mess = mess.replace(PREFIX, "")

    // Test the input against all prefixes for all commands
    for (c in COMMANDS) {
        let command = COMMANDS[c];
        for (a in command.aliases) {
            let cAlias = command.aliases[a];
            // If the message begins with the alias
            if (mess.indexOf(cAlias) == 0) {
                // This is the command!
                // remove the alias from mess
                mess = mess.replace(cAlias, "")
                // Execute the command
                command.func(m, mess);
            }
        }
    }

    return

	// If there's an exclaimation point, we know it's a command
	if (mess.includes("uwu")) {
		m.reply("<@" + EMILY_ID + "> uwu")

	} else if (mess.charAt(0) == '!' && mess.charAt(1) != '!') { //mess.indexOf("!") == 0) {
		if (mess.indexOf("h") == 1 || mess.indexOf("help") == 1) {
			m.reply("You can use `!q`, `!quote` or you can @me.\n" +
				"`!q <message>` to add a new quote\n" +
				"`!q <number>` to get a specific quote\n" +
				"`!q` to get a random quote\n" +
				"`!find <message>` to search for a quote with a similar `message`\n" +
				"`!remove <number>` to remove a quote" +
				"`!roll [number] [number] ...` to roll any 'number' sided dice. Give no numbers to roll a D20."
				).catch(console.error)

		} else if (mess.indexOf("roll") == 1) {
			let splitMess = mess.split(" ")
			if (splitMess.length <= 1) {
				m.reply(random.int(1, 20))
			} else {
				let replyMess = ""
				for (let i = 1; i < splitMess.length; i++) {
					let num = parseNumber(splitMess[i], m)
					if (num < 0) return
					replyMess += random.int(1, num) + " "
				}
				m.reply(replyMess)
			}
		} else if (mess.indexOf("remove") == 1 || mess.indexOf("quoteremove") == 1 || mess.indexOf("removequote") == 1) {

			let splitMess = mess.split(" ")
			if (splitMess.length == 2) {

				let num = parseNumber(splitMess[1], m) - 1
				if (num >= QUOTES.length) {
       	                		m.reply(getInsult() + "Quote #" + num + " doesn't exist.").catch(console.error)
       	                		return
	                	}
				if (num < 0) return
				REMOVED.push(QUOTES[num])
				QUOTES.splice(num, 1) // Delete the quote from the array
				saveFile() // Save the new array to the file

				m.delete().catch(console.error)
				m.reply("#" + (num + 1) + " removed.").then(msg => msg.delete({ timeout: ERROR_TIME })).catch(console.error)

			} else {
				m.reply(getInsult() + " I only expected a single number afterwards.").catch(console.error)
			}

		} else if (mess.indexOf("f") == 1 || mess.indexOf("find") == 1 || mess.indexOf("s") == 1 || mess.indexOf("search") == 1) {

			if (QUOTES.length == 0) {
				console.log("ERROR: No quotes found")
				m.reply("No quotes found.").catch(console.error)
			} else {
				let splitMess = mess.split(" ")
				let quote = ""
				for (let i = 1; i < splitMess.length; i++) quote += splitMess[i] + (i != splitMess.length -1 ? " " : "")
				var matches = sim.findBestMatch(quote, QUOTES)
				var result = matches.bestMatch.target
				m.reply("#" + (matches.bestMatchIndex + 1) + ": " + result).catch(console.error)
			}

		} else if (mess.indexOf("q") == 1 || mess.indexOf("quoteadd") == 1 || mess.indexOf("addquote") == 1 || mess.indexOf("quote") == 1) {
			parseQuoteSyntax(m, mess)
		} else {
			m.reply(getInsult() + " Use `!help`.").catch(console.error)
		}
	// if bot is mentioned
	} else if (m.mentions.users.has(client.user.id)) {
		parseQuoteSyntax(m, mess)
	}
})

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

startBot()

// https://discordapp.com/oauth2/authorize?&client_id=622290044287188993&scope=bot&permissions=75776
