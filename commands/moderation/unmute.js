const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',
    category: "Moderation",
    usage: '<user>',
    userPermissions: ['MUTE_MEMBERS', 'MANAGE_ROLES'],
    clientPermissions: ['EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
    exemples: [
        'unmute @Cyra#5354',
    ],
    async execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if (!member) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "User not found.")] });

        if (message.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "I can't mute this user.")] });

        if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You can't mute this user.")] });

        if (!member.roles.cache.some(role => role.name === 'muted')) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "This user isn't muted.")] });

        let muterole = message.guild.roles.cache.find(muterole => muterole.name === "muted");

        if (!muterole) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "No 'muted' role has been created.")] });

        await member.roles.remove(muterole)

        client.db.query("DELETE FROM mute_users WHERE id_user = ?", [member.id], (error, rows) => { if (error) throw error });

        message.channel.send({ embeds: [client.util.successMsg(message.author, `${member.user.tag} has been unmuted.`)] });

    },
};