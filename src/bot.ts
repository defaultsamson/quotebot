import { REST, Routes } from "discord.js"
import { Client, Events, GatewayIntentBits } from "discord.js"
import legacyCommandHandler from "./lib/legacy-command-handler.js"

/** LEGACY -- code for converting legacy quotes.json and removed.json into new format.
const newData: ServerData = {
  nextInternalID: 0,
  serverID: "269878855831912449",
  quotes: [],
  removed: [],
  adminIDs: [],
  channelID: null,
}

const legacyData = fs.readFileSync("./quotes.json", "utf-8")
const parsedQuotes: any[] = JSON.parse(legacyData)
for (const d of parsedQuotes) {
  const newQuote = {
    internalID: newData.nextInternalID,
    quote: d.quote,
    authorID: d.author_id ?? null,
    date: d.date,
    upvoteIDs: [],
    downvoteIDs: [],
  }
  newData.nextInternalID++
  newData.quotes.push(newQuote)
}
const legacyRemoved = fs.readFileSync("./removed.json", "utf-8")
const removedQuotes: any[] = JSON.parse(legacyRemoved)
for (const d of removedQuotes) {
  const newQuote = {
    internalID: newData.nextInternalID,
    quote: d.quote,
    authorID: d.author_id ?? null,
    date: d.date,
    upvoteIDs: [],
    downvoteIDs: [],
  }
  newData.nextInternalID++
  newData.removed.push(newQuote)
}
writeServerData(newData)
**/

import config from "../config.json" with { type: "json" }
const TOKEN = config.token
const CLIENT_ID = config.clientID

// Load the commands
import COMMANDS from "./commands/all.js"
import { reactionRemove } from "./lib/reactions/reaction-remove.js"
import { reactionAdd } from "./lib/reactions/reaction-add.js"

// Register the commands with Discord
const rest = new REST({ version: "10" }).setToken(TOKEN)
await rest.put(Routes.applicationCommands(CLIENT_ID), {
  body: Array.from(COMMANDS.values()).map((c) => c.data),
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
})

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = COMMANDS.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      // Execute the command
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        })
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
        })
      }
    }
  }
})

/** Legacy command handling (e.g. for "!q") */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return // Ignore messages from bots
  if (!message.guild) return // Ignore DMs

  try {
    // Execute the command
    await legacyCommandHandler(message)
  } catch (error) {
    console.error(error)
    await message.reply({
      content: "InternalError: Executing command failed.",
    })
  }
})

// Set up the reaction event listeners, used for upvoting/downvoting
client.on(Events.MessageReactionAdd, reactionAdd)
client.on(Events.MessageReactionRemove, reactionRemove)

client.login(TOKEN)
