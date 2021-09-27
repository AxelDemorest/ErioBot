const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'setup-level',
    description: 'Activates or deactivates the level system',
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
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
            }
        }

    },
};