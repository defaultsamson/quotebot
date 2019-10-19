const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")

const QUOTES_FILE = "quotes.txt"
const TOKEN_FILE = "token.txt"
const QUOTES_CHANNEL_ID = "635032935828815882"//"622277602782085120"
const BOT_ID = "622290044287188993"
const ERROR_TIME = 20000

let QUOTES = []
let INSULTS = []

function saveFile() {
	fs.writeFile(QUOTES_FILE, JSON.stringify(QUOTES), (err) => {
		if (err) {
			console.log(err)
		} else {
			// console.log('File written!');
		}
	})
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
}

function getInsult() {
	return INSULTS[Math.floor(Math.random()*INSULTS.length)]
}

function parseNumber(num, m) {
	num = parseInt(num, 10) - 1
	if (isNaN(num)) {
		m.reply(getInsult() + " That wasn't a number.").catch(console.error)
		return -1
	}
	if (num < 0 || num >= QUOTES.length) {
		m.reply(getInsult() + " That quote doesn't exist.").catch(console.error)
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
			let n = Math.floor(Math.random()*QUOTES.length)
			m.reply("Quote #" + (n + 1) + ": " + QUOTES[n]).catch(console.error)
		}
	// If there's only one thing after the command, find that numbered quote
	} else if (splitMess.length == 2) {

		let num = parseNumber(splitMess[1], m)
		if (num < 0) return
		m.reply("Quote #" + (num + 1) + ": " + QUOTES[num]).catch(console.error)

	// Else it must be a quote
	} else {
		// puts all the quote into one big string
		let quote = ""
		for (let i = 1; i < splitMess.length; i++) quote += splitMess[i] + (i != splitMess.length -1 ? " " : "")

		QUOTES.push(quote)
		saveFile()

		let quotesChannel = m.guild.channels.find(c => c.id === QUOTES_CHANNEL_ID);
		if (quotesChannel) {
			quotesChannel.send(quote).catch(console.error)
		} else {
			m.reply("Couldn't find quotes channel (ID: " + QUOTES_CHANNEL_ID + ").").catch(console.error)
			console.log("ERROR: Couldn't find quotesChannel")
		}
		m.delete().catch(console.error)
		m.reply("Quote #" + QUOTES.length + " added.").then(msg => msg.delete(ERROR_TIME)).catch(console.error)
	}
}

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag + "!")
})

client.on("message", m => {
	var mess = m.content

	// If there's an exclaimation point, we know it's a command
	if (mess.charAt(0) == '!' && mess.charAt(1) != '!') { //mess.indexOf("!") == 0) {
		if (mess.indexOf("h") == 1 || mess.indexOf("help") == 1) {
			m.reply("You can use `!q`, `!quote` or you can @me.\n" +
				"`!q <message>` to add a new quote\n" +
				"`!q <number>` to get a specific quote\n" +
				"`!q` to get a random quote\n" +
				"`!remove <number>` to remove a quote"
				).catch(console.error)

		} else if (mess.indexOf("remove") == 1 || mess.indexOf("r") == 1 || mess.indexOf("quoteremove") == 1 || mess.indexOf("removequote") == 1) {

			let splitMess = mess.split(" ")
			if (splitMess.length == 2) {

				let num = parseNumber(splitMess[1], m)
				if (num < 0) return
				QUOTES.splice(num, 1) // Delete the quote from the array
				saveFile() // Save the new array to the file

				m.delete().catch(console.error)
				m.reply("Quote #" + (num + 1) + " removed.").then(msg => msg.delete(ERROR_TIME)).catch(console.error)

			} else {
				m.reply(getInsult() + " I only expected a single number afterwards.").catch(console.error)
			}

		} else if (mess.indexOf("q") == 1 || mess.indexOf("quoteadd") == 1 || mess.indexOf("addquote") == 1 || mess.indexOf("quote") == 1) {
			parseQuoteSyntax(m, mess)
		} else {
			m.reply(getInsult() + " Use `!help`").catch(console.error)
		}
	// if bot is mentioned and it's the first thing in the string
	} else if (m.isMentioned(client.user) && mess.split(" ")[0] == ("<@" + BOT_ID + ">")) {
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

loadFile()

// Starts client from token file
fs.readFile(TOKEN_FILE, (err, data) => {
	if (err) {
		console.log(err)
	} else {
		client.login(JSON.parse(data))
	}
})

// https://discordapp.com/oauth2/authorize?&client_id=622290044287188993&scope=bot&permissions=75776
