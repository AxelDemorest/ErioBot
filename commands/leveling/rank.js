const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'rank',
    description: 'Configure the level system',
    aliases: ['level'],
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if (!member) {

            const data = await client.db.asyncQuery(`SELECT * FROM leveling_users WHERE user_id = ${message.author.id} AND guild_id = ${message.guild.id}`).catch(console.error);

            if (!data[0]) {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#F1413E")
                            .setTitle(`Niveau de ${message.author.username}`)
                            .setDescription(`>>> **Level :** \`0\`\n**Xp :** \`0\`/\`50\``)
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .setFooter(`Exécuté par ${message.author.tag}`)
                    ]
                })
            } else {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#F1413E")
                            .setTitle(`Niveau de ${message.author.username}`)
                            .setDescription(`>>> **Level :** \`${data[0].level}\`\n**Xp :** \`${data[0].xp}\`/\`${data[0].xp_needed}\``)
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .setFooter(`Exécuté par ${message.author.tag}`)
                    ]
                })
            }
        } else {

            const data_user = await client.db.asyncQuery(`SELECT * FROM leveling WHERE user_id = ${member.user.id} AND guild_id = ${message.guild.id}`).catch(console.error);

            if (!data_user[0]) {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#F1413E")
                            .setTitle(`Niveau de ${member.user.username}`)
                            .setDescription(`>>> **Level :** \`0\`\n**Xp :** \`0\`/\`50\``)
                            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .setFooter(`Exécuté par ${message.author.tag}`)
                    ]
                })
            } else {
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#F1413E")
                            .setTitle(`Niveau de ${member.user.username}`)
                            .setDescription(`>>> **Level :** \`${data_user[0].level}\`\n**Xp :** \`${data_user[0].xp}\`/\`${data_user[0].xp_needed}\``)
                            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .setFooter(`Exécuté par ${message.author.tag}`)
                    ]
                })
            }

        }
    },
};