/* eslint-disable jsdoc/require-param */
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
} from "discord.js";

import { CommandHandler } from "../../../interfaces/commands/CommandHandler";
import { errorEmbedGenerator } from "../../../modules/commands/errorEmbedGenerator";
import { beccaErrorHandler } from "../../../utils/beccaErrorHandler";

/**
 * List the currently available triggers.
 */
export const handleTriggerView: CommandHandler = async (
  Becca,
  interaction,
  t,
  config
) => {
  try {
    if (!config.triggers.length) {
      await interaction.editReply({
        content: t<string, string>("commands:triggers.view.none"),
      });
      return;
    }

    let page = 1;
    const triggerList = config.triggers.map((el) => ({
      name: el[0],
      value: el[1],
    }));
    const lastPage = Math.ceil(config.triggers.length / 10);

    const embed = new EmbedBuilder();
    embed.setTitle(t<string, string>("commands:triggers.view.title"));
    embed.setFields(triggerList.slice(page * 10 - 10, page * 10));
    embed.setFooter({
      text: t<string, string>("commands:triggers.view.footer", {
        page,
        last: lastPage,
      }),
    });

    const pageBack = new ButtonBuilder()
      .setCustomId("prev")
      .setDisabled(true)
      .setLabel("◀")
      .setStyle(ButtonStyle.Primary);
    const pageForward = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("▶")
      .setStyle(ButtonStyle.Primary);

    if (lastPage === 1) {
      pageForward.setDisabled(true);
    }

    const sent = (await interaction.editReply({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          pageBack,
          pageForward
        ),
      ],
    })) as Message;

    const clickyClick = sent.createMessageComponentCollector({
      time: 30000,
      filter: (click) => click.user.id === interaction.user.id,
    });

    clickyClick.on("collect", async (click) => {
      click.deferUpdate();
      if (click.customId === "prev") {
        page--;
      }
      if (click.customId === "next") {
        page++;
      }

      if (page <= 1) {
        pageBack.setDisabled(true);
      } else {
        pageBack.setDisabled(false);
      }
      if (page >= lastPage) {
        pageForward.setDisabled(true);
      } else {
        pageForward.setDisabled(false);
      }

      embed.setFields(triggerList.slice(page * 10 - 10, page * 10));
      embed.setFooter({
        text: t<string, string>("commands:triggers.view.footer", {
          page,
          last: lastPage,
        }),
      });

      await interaction.editReply({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            pageBack,
            pageForward
          ),
        ],
      });
    });

    clickyClick.on("end", async () => {
      pageBack.setDisabled(true);
      pageForward.setDisabled(true);
      await interaction.editReply({
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            pageBack,
            pageForward
          ),
        ],
      });
    });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "trigger view command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "trigger view", errorId, t)],
    });
  }
};
