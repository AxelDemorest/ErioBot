const { MessageEmbed } = require("discord.js");
const ms = require("ms")

module.exports = {
    name: 'mute',
    description: 'Mute a user',
    category: "Moderation",
    usage: '<user> [duration] [reason]',
    userPermissions: ['MUTE_MEMBERS', 'MANAGE_ROLES'],
    clientPermissions: ['EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
    exemples: [
        'mute @Cyra#5354 2h Bad words',
        'mute @Cyra#5354 Bad words',
        'mute @Cyra#5354 2h',
        'mute @Cyra#5354',
    ],
    async execute(client, message, args) {

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

        if (!member) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "User not found.", this.usage)] });

        if (message.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "I can't mute this user.")] });

        if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You can't mute this user.")] });

        if (member.roles.cache.some(role => role.name === 'muted')) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "This user is already muted.")] });

        let muterole = message.guild.roles.cache.find(muterole => muterole.name === "muted");

        if (!muterole) {
            try {
                muterole = await message.guild.roles.create({
                    name: "muted",
                    color: "#000000",
                    permissions: []
                })
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.permissionOverwrites.create(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            } catch (e) {
                console.log(e.stack);
            }
        }

        let duration = args[1] ? ms(args[1]) : null;

        if (duration === undefined || duration === null) {

            args = args.slice(1);

            await member.roles.add(muterole, args.join(" "))

        } else {

            if (!isNaN(args[1])) duration = ms(`${duration}m`); 
            
            if(duration < 30000) duration = ms('30s');
            
            args = args.slice(2);

            await member.roles.add(muterole, args.join(" "))

            client.db.query("INSERT INTO mute_users(id_user, date_mute, id_moderator, guild_id) VALUES (?,?,?,?)", [member.id, Date.now() + duration, message.author.id, message.guild.id], (error, rows) => { if (error) throw error });

            setTimeout(async () => {
                await member.roles.remove(muterole)
                client.db.query("DELETE FROM mute_users WHERE id_user = ?", [member.id], (error, rows) => { if (error) throw error });
            }, duration);
        }

        message.channel.send({ embeds: [client.util.successMsg(message.author, `**${member.user.tag}** has been muted.`)] });

    },
};