const { MessageEmbed } = require("discord.js");
const templates = require("../../utils/templates")

module.exports = {
    name: "server-info",
    description: 'Information about the server',
    category: "Information",
    aliases: ['si', 'sinfo'],
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const onlineMembers = (await message.guild.members.fetch()).filter((member) => ['online', 'dnd', 'idle'].includes(member.presence?.status)).size;

        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("#70D9F3")
                    .setTitle(`${message.guild.name}'s informations`)
                    .addField('<a:crown_erio:891999198302568458> Owner', `${message.guild.members.cache.get(message.guild.ownerId)} (${message.guild.ownerId})`)
                    .addField('<:userErio:893533528451600414> Members', `**Total :** ${message.guild.members.cache.size}\n**Onlines :** ${onlineMembers}`)
                    .addField('<:hashtagErio:893532189692690452> Channels', `**Total :** ${(await message.guild.channels.fetch()).size}\n**Text :** ${(await message.guild.channels.fetch()).filter((channel) => channel.type === "GUILD_TEXT").size}\n**Voice :** ${(await message.guild.channels.fetch()).filter((channel) => channel.type === "GUILD_VOICE").size}`)
                    .addField('<a:boosts_erio:891999195437887488> Boosts', `**Boosts count :** ${message.guild.premiumSubscriptionCount || "0"}\n**Boost Tier :** ${message.guild.premiumTier !== "NONE" ? `Tier ${message.guild.premiumTier}` : "No Tier"}`)
                    .addField('<:toolsErio:893532772952584273> Roles', `${message.guild.roles.cache.size}`)
                    .addField('<:starErio:893532916104171582> Emojis', `${message.guild.emojis.cache.size}`)
                    .setThumbnail(message.guild.iconURL({ dynamic: true, size: 2048 }))
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setTimestamp()
            ]
        })

    }
}