const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'guildCreate',
    execute(guild, client) {

        client.db.query("INSERT INTO guilds(guild_id) VALUES(?)", [guild.id], (error, rows) => { if (error) throw error; })
    },
};