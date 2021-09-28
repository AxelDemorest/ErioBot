const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
    name: 'leveling',
    description: 'Enable the leveling module.',
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: ['ADMINISTRATOR'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if (data[0].leveling) {
            client.db.query("UPDATE guilds SET leveling = NULL WHERE guild_id = ?", [message.guild.id], (error, rows) => { if (error) throw error });

            message.channel.send({ embeds: [client.util.successMsg(message.author, "The leveling module has been disabled.")] })

        } else {
            client.db.query("UPDATE guilds SET leveling = 'true' WHERE guild_id = ?", [message.guild.id], (error, rows) => { if (error) throw error });

            message.channel.send({ embeds: [client.util.successMsg(message.author, "The leveling module has been enabled.")] })
        }
    },
};