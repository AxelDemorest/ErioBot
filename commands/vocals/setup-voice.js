const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    name: 'setup-voice',
    description: '',
    category: "Create your vocals",
    usage: '<prefix>',
    userPermissions: ['ADMINISTRATOR'],
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if(data[0].voiceschannel) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You've already set up your voice channels creation system.")] });

        const category = await message.guild.channels.create('New category', { type: 'GUILD_CATEGORY' })

        const channel = await message.guild.channels.create('Create your voice channel', {
            type: 'GUILD_VOICE',
            parent: category.id,
            permissionOverwrites: [
                {
                    id: client.user.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MOVE_MEMBERS],
                },
            ]
        })

        client.db.query("UPDATE guilds SET voiceschannel = ? WHERE guild_id = ?",[channel.id, message.guild.id], (error, rows) => { if (error) throw error });

        message.channel.send({ embeds: [client.util.successMsg(message.author, "Configuration complete.")] })
    },
};