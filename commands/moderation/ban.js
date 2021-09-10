const { MessageEmbed } = require("discord.js");
const ms = require("ms")

module.exports = {
    name: 'ban',
    description: 'Ban a user',
    category: "Moderation",
    usage: '<user> [duration] [reason]',
    userPermissions: ['BAN_MEMBERS'],
    clientPermissions: ['EMBED_LINKS', 'BAN_MEMBERS', 'MANAGE_MESSAGES'],
    exemples: [
        'ban @Cyra#5354 3d Bad words',
        'ban @Cyra#5354 Bad words',
        'ban @Cyra#5354 3d',
        'ban @Cyra#5354',
    ],
    async execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if(!member) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "User not found.", this.usage) ]});

        if (!member.bannable) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "I can't ban this user.") ]});

        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [ client.util.errorMsg(message.author, "You can't ban this user.") ]});

        let duration = args[1] ? ms(args[1]) : null;

        if(duration === undefined || duration === null) {

            args = args.slice(1);

            await member.ban({ days: 7, reason: args.join(" ")})

        } else {

            if (!isNaN(args[1])) duration = ms(`${duration}m`); 
            
            if(duration < 300000) duration = ms('5m');

            args = args.slice(2);

            await member.ban({ days: 7, reason: args.join(" ")})

            client.db.query("INSERT INTO ban_users(id_user, date_ban, id_moderator, guild_id) VALUES (?,?,?,?)",[member.id, Date.now() + duration, message.author.id, message.guild.id], (error, rows) => { if (error) throw error });

            setTimeout(async () => {
                await message.guild.members.unban(member.id, "Auto-unbanned by ErioBot.");
                client.db.query("DELETE FROM ban_users WHERE id_user = ?",[member.id], (error, rows) => { if (error) throw error });
            }, duration);
        }

        message.channel.send({ embeds: [ client.util.successMsg(message.author, `**${member.user.tag}** has been banned.`) ]});

    },
};