const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'setup_level',
    description: 'Activates or deactivates the level system',
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if(data[0].leveling) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You've already set up your leveling system.")] });

        client.db.query("UPDATE guilds SET leveling = 'true' WHERE guild_id = ?",[message.guild.id], (error, rows) => { if (error) throw error });

        message.channel.send({ embeds: [client.util.successMsg(message.author, "The leveling system has been activated.")] })
    },
};