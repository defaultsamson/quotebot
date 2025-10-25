import { Message } from "discord.js"
import { addQuote } from "./quote-operations/add.js"
import { getRandom } from "./quote-operations/get-random.js"
import { getQuote } from "./quote-operations/get.js"
import { removeQuote } from "./quote-operations/remove.js"
import { searchQuote } from "./quote-operations/search.js"
import { getInfo } from "./quote-operations/get-info.js"
import dedent from "dedent"
import { getTopQuotes } from "./quote-operations/get-top.js"
import { getBottomQuotes } from "./quote-operations/get-bottom.js"

/** @deprecated This is just here for legacy support for `!q` commands and such. */
export default async function legacyCommandHandler(
  message: Message
): Promise<void> {
  const raw = message.content.trim()
  const splitRaw = raw
    .trim()
    .split(" ")
    .map((s) => s.trim())

  // Check for blank `!q` or `!quote` commands
  if (splitRaw.length === 1 && splitRaw[0].startsWith("!q"))
    return await getRandom(message)

  // Check for blank `!top` commands
  if (
    splitRaw.length === 1 &&
    ["!top", "!up", "!upvoted"].some((c) => splitRaw[0].startsWith(c))
  )
    return await getTopQuotes(message)

  // Check for blank `!bottom` commands
  if (
    splitRaw.length === 1 &&
    ["!bottom", "!down", "!downvoted"].some((c) => splitRaw[0].startsWith(c))
  )
    return await getBottomQuotes(message)

  // Check for `!roll [number]...`
  if (["!roll"].some((cmd) => splitRaw[0].startsWith(cmd))) {
    const nums = splitRaw
      .slice(1) //Remove index 0 ("!roll")
      .map((s) => parseInt(s))
      .filter((n) => !isNaN(n))
      .filter((n) => n > 0)

    // Ensure there's always at least 1 item (a 20)
    if (nums.length === 0) nums.push(20)

    // Do the rolls
    await message.reply(
      nums.map((n) => Math.floor(Math.random() * n) + 1 + `/${n}`).join(" ,  ")
    )
    return
  }

  // Check for `!top <number>`
  if (
    splitRaw.length === 2 &&
    ["!top", "!up", "!upvoted"].some((cmd) => splitRaw[0].startsWith(cmd))
  ) {
    const amount = parseInt(splitRaw[1])
    if (!isNaN(amount)) {
      return await getTopQuotes(message, amount)
    }
  }

  // Check for `!bottom <number>`
  if (
    splitRaw.length === 2 &&
    ["!bottom", "!down", "!downvoted"].some((cmd) =>
      splitRaw[0].startsWith(cmd)
    )
  ) {
    const amount = parseInt(splitRaw[1])
    if (!isNaN(amount)) {
      return await getBottomQuotes(message, amount)
    }
  }

  // Check for `!remove <number>`
  if (
    splitRaw.length === 2 &&
    [
      "!remove",
      "!removequote",
      "!quoteremove",
      "!qremove",
      "!delete",
      "!quotedelete",
      "!deletequote",
      "!qdelete",
    ].some((cmd) => splitRaw[0].startsWith(cmd))
  ) {
    const id = parseInt(splitRaw[1])
    if (!isNaN(id)) {
      return await removeQuote(message, id)
    }
  }

  // Note: check for the `remove` stuff before this because they are more specific
  // Check for `!q <number>`
  if (splitRaw.length === 2 && splitRaw[0].startsWith("!q")) {
    const id = parseInt(splitRaw[1])
    if (!isNaN(id)) {
      return await getQuote(message, id)
    }
  }

  // Check for `!q remove <number>`
  if (
    splitRaw.length === 3 &&
    ["!quote remove", "!q remove", "!quote delete", "!q delete"].some((cmd) =>
      (splitRaw[0] + " " + splitRaw[1]).startsWith(cmd)
    )
  ) {
    const id = parseInt(splitRaw[2])
    if (!isNaN(id)) {
      return await removeQuote(message, id)
    }
  }

  // Check for search commands
  const searchMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote search",
    "!quotes search",
    "!q search",
    "!search quote",
    "!search",
    "!s",
  ]
  for (const m of searchMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      const text = raw.slice(m.length).trim()
      // Note: When doing a legacy search, limit it to just 1 result
      return await searchQuote(message, text, 1)
    }

  // Check for info commands
  const infoMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote info",
    "!quotes info",
    "!q info",
    "!info quote",
    "!info",
  ]
  for (const m of infoMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      const text = raw.slice(m.length).trim()
      const extractedNum = Number(text)
      if (!isNaN(extractedNum)) {
        // If we've been given a proper number...
        return await getInfo(message, extractedNum)
      }
    }

  // Check for help commands
  const helpMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote help",
    "!quotes help",
    "!q help",
    "!help quote",
    "!help",
  ]
  for (const m of helpMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      message.reply(dedent`
        ${"```"}
        !quote
        !search
        !remove
        !info
        !top
        !bottom
        ${"```"}
      `)
      return
    }

  // Finally, check for add commands
  const addMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote add",
    "!quotes add",
    "!q add",
    "!add quote",
    "!quote", // Note: at this point we will have already handled the # and random commands, so checking for !quote is safe
    "!quotes",
    "!add",
    "!qadd",
    // Note: check for the shortest one last...
    "!q",
  ]
  for (const m of addMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      const text = raw.slice(m.length).trim()
      if (
        text !== "add" &&
        text !== "remove" &&
        text !== "delete" &&
        text.split(" ").length >= 2
      ) {
        return await addQuote(message, text)
      }
    }

  // If nothing matches, ignore the message. This is only for legacy fallback anyways
}
