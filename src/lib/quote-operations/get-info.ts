import {
  BaseInteraction,
  EmbedBuilder,
  Interaction,
  Locale,
  Message,
  User,
} from "discord.js"
import { readServerData } from "../server-data/read-write.js"
import dedent from "dedent"
import { format } from "date-fns"
import { Emoji } from "../../types/emojis.js"

export async function getInfo(incoming: Interaction | Message, id: number) {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()
  async function reply(m: string) {
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
  }
  async function replyEmbed(e: EmbedBuilder) {
    await message?.reply({
      embeds: [e],
      allowedMentions: { parse: [] }, // Prevent pings
    })
    await interaction?.editReply({
      embeds: [e],
      allowedMentions: { parse: [] }, // Prevent pings
    })
  }

  const data = readServerData(incoming.guildId)

  // Note: `id` starts at 1
  if (data.quotes.length < id || id < 1) {
    // If the ID is out of range
    await reply(
      interaction?.locale === Locale.Swedish
        ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
        : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
    )
    return
  }

  // If the quote exists
  const quote = data.quotes[id - 1]

  const embed = new EmbedBuilder().setTitle(`Quote #${id} Info`)
  const swed = interaction?.locale === Locale.Swedish
  const claimCommand = swed
    ? `\`/auteur sätt id:${id} user:\``
    : `\`/author set id:${id} user:\``

  // embed.setThumbnail(
  //   (incoming.member.user as User).displayAvatarURL({ size: 64 })
  // )
  embed.setThumbnail(
    incoming.guild.members.cache
      .get(quote.authorID)
      ?.user?.displayAvatarURL({ size: 64 })
  )

  // Date
  embed.addFields({
    name: `:calendar_spiral:  ${swed ? `Datum` : `Date`}`,
    value: `${format(new Date(quote.date), "yyyy MMM dd, HH:mm a")}`,
    inline: true,
  })
  // Author
  embed.addFields({
    name: `:pencil2:  ${swed ? `Författare` : `Author`}`,
    value: quote.authorID
      ? `<@${quote.authorID}>`
      : swed
      ? `Okänd. Gör anspråk med\n${claimCommand}`
      : `Unknown. Claim using\n${claimCommand}`,
    inline: true,
  })
  // Quote row
  embed.spliceFields(2, 0, {
    name: `:speech_balloon:  ${swed ? `Citat` : `Quote`}`,
    value: dedent`\
      ${quote.quote}`,
    inline: false,
  })
  // Upvotes
  embed.addFields({
    name: `${data.customPlus ?? Emoji.Plus}  ${
      swed ? "Upp-voteringar" : "Upvotes"
    }`,
    value: `${
      quote.upvoteIDs.map((id) => `<@${id}>`).join(", ") ||
      (swed ? "Ingen" : "None")
    }`,
    inline: true,
  })
  // Downvotes
  embed.addFields({
    name: `${data.customMinus ?? Emoji.Minus}  ${
      swed ? "Ned-voteringar" : "Downvotes"
    }`,
    value: `${
      quote.downvoteIDs.map((id) => `<@${id}>`).join(", ") ||
      (swed ? "Ingen" : "None")
    }`,
    inline: true,
  })

  await replyEmbed(embed)
}
