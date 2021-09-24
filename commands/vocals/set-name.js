const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    name: 'set-name',
    description: 'Set the name of your voice channel',
    category: 'Join to create',
    usage: '<channelName>',
    args: true,
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if (!data[0].voiceschannel) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The system for creating voice channels was not created.")] });

        if (!message.member.voice.channel || !client.Tempchannels.has(message.member.voice.channelId)) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You must be connected into your voice channel to use this command.")] });
        
        const newName = await message.member.voice.channel.setName(args.join(" "));

        message.channel.send({ embeds: [client.util.successMsg(message.author, `The channel's name is now set at **${newName.name}**.`)] })
    },
};