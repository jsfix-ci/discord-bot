import { EmbedBuilder } from "@discordjs/builders";
import { MessageReaction, PartialMessageReaction } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

/**
 * Handles the reaction create event from Discord.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {MessageReaction} reaction The reaction payload from Discord.
 */
export const reactionAdd = async (
  Becca: BeccaLyria,
  reaction: MessageReaction | PartialMessageReaction
) => {
  try {
    const { emoji, message, count } = reaction;
    const { guild } = message;
    const { name, identifier, id } = emoji;

    if (!guild) {
      return;
    }

    const config = await getSettings(Becca, guild.id, guild.name);

    if (
      !config ||
      !config.starboard_channel ||
      !config.starboard_emote ||
      !config.starboard_threshold
    ) {
      return;
    }

    const isStarboardEmote =
      name === config.starboard_emote ||
      identifier === config.starboard_emote ||
      id === config.starboard_emote ||
      `<:${identifier}>` === config.starboard_emote ||
      `<${identifier}>` === config.starboard_emote;

    if (!isStarboardEmote) {
      return;
    }

    if (count !== parseInt(config.starboard_threshold)) {
      return;
    }

    const channel =
      guild.channels.cache.get(config.starboard_channel) ||
      (await guild.channels.fetch(config.starboard_channel));

    if (!channel || !("send" in channel)) {
      return;
    }

    const embed = new EmbedBuilder();
    embed.setTitle("Starboard~!");
    embed.setDescription(message.content || "No content...");
    if (message.attachments.first() && message.attachments.first()?.width) {
      embed.setImage(message.attachments.first()?.url || "how tf");
    }

    await channel.send({ embeds: [embed] });
    await reaction.react();
  } catch (err) {
    await beccaErrorHandler(Becca, "reaction create", err);
  }
};
