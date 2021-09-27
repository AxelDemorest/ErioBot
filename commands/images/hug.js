const { MessageEmbed } = require("discord.js");
const axios = require('axios');

module.exports = {
    name: 'hug',
    description: 'Hug someone',
    category: "Images",
    usage: '<user>',
    clientPermissions: ['EMBED_LINKS'],
    exemples: [
        'hug @Cyra#5354',
    ],
    async execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        try {
            const response = await axios.get('https://purrbot.site/api/img/sfw/hug/gif');
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#70D9F3")
                        .setDescription(`**${message.author.username}** hugs **${member ? member.user.username : client.user.username}**`)
                        .setImage(response.data.link)
                        .setFooter(client.user.username, client.user.avatarURL())
                        .setTimestamp()
                ]
            })
        } catch (error) {
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#70D9F3")
                        .setDescription(`Error.`)
                        .setFooter(client.user.username, client.user.avatarURL())
                        .setTimestamp()
                ]
            })
        }
    },
};