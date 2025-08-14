/** A map of message ID to unique quote ID */
export const REACTION_CACHE = new Map<string, number>()

/**
 * The primary function if this cache is to be able to add a message when it is sent,
 * map it to a unique quote ID, and then when a reaction is added to the message,
 * we can look up the quote ID (using the guildID of the interaction, if necessary),
 * and handle the reaction accordingly.
 */
