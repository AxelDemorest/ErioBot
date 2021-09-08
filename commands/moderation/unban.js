const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'unban',
    description: 'Unban a user',
    category: "Moderation",
    usage: '<user> [reason]',
    userPermissions: ['BAN_MEMBERS'],
    clientPermissions: ['EMBED_LINKS', 'BAN_MEMBERS'],
    exemples: [
        'unban @Cyra#5354 Because i like unban',
    ],
    async execute(client, message, args) {

        try {
            const user = await message.guild.members.unban(args[0]);
            client.db.query("DELETE FROM ban_users WHERE id_user = ?", [user.id], (error, rows) => { if (error) throw error });
            return message.channel.send(`${user.tag} has been unbanned!`)
        } catch {
            return message.channel.send("User not found or this user hasn't been banned.")
        }

    },
};