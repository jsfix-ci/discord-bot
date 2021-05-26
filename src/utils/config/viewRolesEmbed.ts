import { MessageEmbed } from "discord.js";
import { ServerModelInt } from "../../database/models/ServerModel";

export const viewRolesEmbed = (
  config: ServerModelInt,
  page: number
): MessageEmbed => {
  const start = (page - 1) * 10;
  const end = page * 10;
  const rolesEmbed = new MessageEmbed()
    .setTitle("Self-Assignable Roles")
    .setFooter("I have the permission to grant members these titles.")
    .setDescription(
      config.self_roles
        .map((el, i) => `#${++i}. <@&${el}> - ID: ${el}`)
        .slice(start, end)
        .join("\n") || "The list is empty. That seems a tad boring."
    )
    .setFooter(`Page ${page} of ${Math.ceil(config.self_roles.length / 10)}`);
  return rolesEmbed;
};