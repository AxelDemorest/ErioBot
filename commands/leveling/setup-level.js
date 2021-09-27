const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'setup-level',
    description: 'Configure the leveling system',
    category: "Leveling",
    usage: '[message|channel]',
    userPermissions: ['ADMINISTRATOR'],
    clientPermissions: ['EMBED_LINKS'],
    exemples: [
        'setup-level // Activate the leveling system',
        'setup-level message // Configure the level up message',
        'setup-level channel // Configure the channel of level up message',
    ],
    async execute(client, message, args) {

        async function awaitMessage(message, filter, time, text, footer) {
            return new Promise(async (resolve) => {
                const msg = await message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#70D9F3")
                            .setAuthor("Answer the question below")
                            .setDescription(`• ${text}`)
                            .setFooter(footer, message.author.avatarURL())
                    ]
                });

                try {
                    const thisMsg = await msg.channel.awaitMessages({ filter, max: 1, time: time }).catch(() => { });
                    if (!thisMsg || !thisMsg.first()) resolve({ content: null });

                    resolve(thisMsg.first());
                } catch (err) {
                    resolve({ content: null });
                }
            });
        }

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if (!args[0]) {
            if (data[0].leveling) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "You've already set up your leveling system.")] });

            client.db.query("UPDATE guilds SET leveling = 'true' WHERE guild_id = ?", [message.guild.id], (error, rows) => { if (error) throw error });

            message.channel.send({ embeds: [client.util.successMsg(message.author, "The leveling system has been activated.")] })
        } else {
            if (!data[0].leveling) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The leveling system has not been set up.")] });

            switch (args[0]) {
                case 'message':
                    const { content: messageLevelUp } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (msg.content.length < 255 || msg.content.toLowerCase() === "cancel")), 180000, 'Write the message do you want when an user level up\n\n**Variables︰**\n```{mention} : mention the user\n{pseudo} : tag of the user\n{level} : new level of the user```\n**Example︰**\n```Congratulations {pseudo}, your level : {level}```', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                    if (messageLevelUp === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                    if (!messageLevelUp) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                    client.db.query("UPDATE guilds SET messageLevelUp = ? WHERE guild_id = ?", [messageLevelUp, message.guild.id], (error, rows) => { if (error) throw error });

                    message.channel.send({ embeds: [client.util.successMsg(message.author, "Message successfully updated !")] })
                    //messageLevelUp
                    break;
                case 'channel':
                    const channel = message.guild.channels.cache.get(args[1]) || message.mentions.channels.first();

                    const { content: configureChannel1 } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (['delete', 'add'].includes(msg.content) || msg.content.toLowerCase() === "cancel")), 180000, 'What do you want to do ?\n\n**Options︰\n**`delete` : Delete the channel already configured. \n`add` : Add a channel *(If you have already configured a channel, it will be replaced by the previous one)*', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                    if (configureChannel1 === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                    if (!configureChannel1) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                    if (configureChannel1 === "delete" && !data[0].channelLevelUpMessage) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "No channel has been configured.")] })
                    else if (data[0].channelLevelUpMessage) {
                        client.db.query("UPDATE guilds SET channelLevelUpMessage = NULL WHERE guild_id = ?", [message.guild.id], (error, rows) => { if (error) throw error });
                        return message.channel.send({ embeds: [client.util.successMsg(message.author, "Channel successfully deleted !")] })
                    }

                    if (configureChannel1 === "add") {
                        const configureChannelMention = await awaitMessage(message, (msg => msg.author.id == message.author.id && (message.guild.channels.cache.get(msg.content.toLowerCase()) || msg.mentions.channels.first() || msg.content.toLowerCase() === "cancel")), 180000, 'What channel do you want to add ?\n\n*You can use `mention` or `id`. If the channel is not found, nothing will happen.*', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                        if (configureChannelMention === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                        if (!configureChannelMention) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                        const channelId = configureChannelMention.mentions.channels?.first()?.id || configureChannelMention.content;

                        client.db.query("UPDATE guilds SET channelLevelUpMessage = ? WHERE guild_id = ?", [channelId, message.guild.id], (error, rows) => { if (error) throw error });

                        message.channel.send({ embeds: [client.util.successMsg(message.author, "Channel successfully updated !")] })
                    }
                    break;
            }
        }

    },
};