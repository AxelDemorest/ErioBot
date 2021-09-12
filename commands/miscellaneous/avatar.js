const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'avatar',
    description: 'Show your avatar or someone else\'s',
    category: "miscellaneous",
    usage: '[user]',
    clientPermissions: ['EMBED_LINKS'],
    exemples: [
        'avatar @Cyra#5354',
    ],
    execute(client, message, args) {

        if (!args.length) {

            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#70D9F3")
                        .setTitle('Your avatar')
                        .setDescription(`[Link](${message.author.displayAvatarURL({ dynamic: true, size: 2048 })})`)
                        .setImage(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
                        .setFooter(`Executed by ${message.author.tag}`, message.author.displayAvatarURL())]
            })

        } else {

            const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

            if (!member) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "User not found.", this.usage)] });

            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#70D9F3")
                        .setTitle(`${member.user.username}'s avatar`)
                        .setDescription(`[Link](${member.user.displayAvatarURL({ dynamic: true, size: 2048 })})`)
                        .setImage(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                        .setFooter(`Executed by ${message.author.tag}`, member.user.displayAvatarURL())]
            })

        }
    },
};