const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'leaderboard',
    description: '',
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM leveling_users WHERE guild_id = ${message.guild.id} ORDER BY xp_all DESC LIMIT 10`).catch(console.error);

        if(!data[0]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The leveling system has not been set up.")] }); 

        message.channel.send({
            embeds:
            [
                new MessageEmbed()
                .setColor("#70D9F3")
                .setTitle(`${message.guild.name}'s leaderboard`)
                .setDescription(data.map(element => `**#${data.indexOf(element) + 1}**︰\`${message.guild.members.cache.get(element.user_id)?.user.tag || element.user_id}\` - **level** \`${element.level}\` | **${element.xp_all}** <:xp_erio:891803448612356106>`).join("\n\n"))
                .setThumbnail(message.guild.iconURL({ dynamic: true, size: 2048 }))
                .setFooter(client.user.username, client.user.avatarURL())
                .setTimestamp()
            ]
        })
    },
};