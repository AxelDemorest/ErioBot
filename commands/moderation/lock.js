const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'lock',
    description: 'Lock a channel',
    category: "Moderation",
    usage: '<channel>',
    userPermissions: ['MANAGE_ROLES'],
    clientPermissions: ['EMBED_LINKS', 'MANAGE_ROLES'],
    exemples: [
        'lock #channel',
    ],
    async execute(client, message, args) {

        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();

        if (!channel) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Channel not found.")] });

        await channel.permissionOverwrites.create(message.guild.roles.everyone, {
            SEND_MESSAGES: false,
        });

        message.channel.send({ embeds: [client.util.successMsg(message.author, `${channel} has been locked.`)] });

    },
};