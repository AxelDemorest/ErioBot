const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'kick',
    description: 'Kick a user',
    usage: '<user> [reason]',
    category: "Moderation",
    userPermissions: ['KICK_MEMBERS'],
    clientPermissions: ['EMBED_LINKS', 'KICK_MEMBERS'],
    exemples: [
        'kick @Cyra#5354 Bad words',
        'kick @Cyra#5354'
    ],
    execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if(!member) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "User not found.", this.usage) ]});

        if (!member.kickable) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "I can't kick this user.") ]});

        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "You can't kick this user.") ]});

        args.shift();

        member.kick(args.join(" "))

        return message.channel.send({ embeds: [ client.util.successMsg(message.author, `**${member.user.tag}** has been kicked.`) ]});

    },
};