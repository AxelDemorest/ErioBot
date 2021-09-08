const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'prefix',
    description: 'Set an auto-nickname when a user join the server',
    category: "Administration",
    usage: '<prefix>',
    args: true,
    userPermissions: ['ADMINISTRATOR'],
    clientPermissions: ['EMBED_LINKS'],
    exemples: [
        'prefix !',
    ],
    async execute(client, message, args) {

        if(args[0].length > 15) return message.channel.send({ embeds: [client.util.errorMsg(message.author.tag, "Prefix length must be less than 15 characters.")] })

        client.db.query("UPDATE guilds SET prefix_guild = ?", [args[0]], (error, rows) => { if (error) throw error; })

        message.channel.send({ embeds: [client.util.successMsg(message.author.tag, "Configuration complete.")] })
    },
};