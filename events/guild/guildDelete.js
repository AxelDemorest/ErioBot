const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'guildDelete',
    execute(guild, client) {

        client.db.query("DELETE FROM guilds WHERE guild_id = ?", [guild.id], (error, rows) => { if (error) throw error; })
    },
};