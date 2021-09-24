const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    name: 'set-limit',
    description: 'Set the limit of your voice channel',
    category: 'Join to create',
    usage: '<userLimit>',
    args: true,
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if (!data[0].voiceschannel) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The system for creating voice channels was not created.")] });

        if (!message.member.voice.channel || !client.Tempchannels.has(message.member.voice.channelId)) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You must be connected into your voice channel to use this command.")] });

        if (isNaN(args[0])) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You must enter a number.")] });

        if (args[0] > 99 || args[0] < 0) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The number must be between 0 and 100.")] });

        const newLimit = await message.member.voice.channel.setUserLimit(args[0]);

        message.channel.send({ embeds: [client.util.successMsg(message.author, `The limit is now set at \`${newLimit.userLimit}\`.`)] })
    },
};