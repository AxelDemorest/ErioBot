const { MessageEmbed } = require("discord.js");
const ms = require("ms")

module.exports = {
    name: 'ban',
    description: 'Ban a user.',
    category: "Moderation",
    userPermissions: ['BAN_MEMBERS'],
    clientPermissions: ['EMBED_LINKS', 'BAN_MEMBERS', 'MANAGE_MESSAGES'],
    execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if(!member) return message.channel.send({ embeds: [ client.util.errorMsg(message.author.tag, "User not found.") ]});

        if (!member.bannable) return message.channel.send({ embeds: [ client.util.errorMsg(message.author.tag, "I can't ban this user.") ]});

        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [ client.util.errorMsg(message.author.tag, "You can't ban this user.") ]});

        const duration = ms(args[1]);

        if(duration === undefined) return message.channel.send({ embeds: [ client.util.errorMsg(message.author.tag, "The duration of the ban is not correct.") ]});

        args = args.slice(2);

        member.ban({ days: 7, reason: args.join(" ")})

        message.channel.send({ embeds: [ client.util.successMsg(message.author.tag, `${member.user.tag} was banned.`) ]});

        client.db.query("INSERT INTO ban_users(id_user, date_ban, id_moderator, guild_id) VALUES (?,?,?,?)",[member.id, Date.now() + duration, message.author.id, message.guild.id], (error, rows) => { if (error) throw error });

        setTimeout(async () => {
            await message.guild.members.unban(member.id, "Auto-unbanned by ErioBot.");
            client.db.query("DELETE FROM ban_users WHERE id_user = ?",[member.id], (error, rows) => { if (error) throw error });
        }, duration);

    },
};