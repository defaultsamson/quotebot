import { Message } from "discord.js"
import { addQuote } from "./quote-operations/add.js"
import { getRandom } from "./quote-operations/get-random.js"
import { getQuote } from "./quote-operations/get.js"
import { removeQuote } from "./quote-operations/remove.js"
import { searchQuote } from "./quote-operations/search.js"

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
      return removeQuote(message, id)
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
      return removeQuote(message, id)
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
      return await searchQuote(message, text)
    }

  // Finally, check for add commands
  const addMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote add",
    "!quotes add",
    "!q add",
    "!add quote",
    "!quote", // Note: at this point we will have already handled the # and random commands, so checking for !quote is safe
    "!q",
    "!quotes",
    "!add",
    "!qadd",
  ]
  for (const m of addMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      const text = raw.slice(m.length).trim()
      if (text !== "add" && text !== "remove" && text !== "delete") {
        return await addQuote(message, text)
      }
    }

  // If nothing matches, ignore the message. This is only for legacy fallback anyways
}
