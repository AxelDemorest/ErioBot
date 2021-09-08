const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'autonick',
    description: 'Set an auto-nickname when a user join the server',
    category: "Administration",
    usage: '[delete]',
    userPermissions: ['ADMINISTRATOR'],
    clientPermissions: ['EMBED_LINKS', 'MANAGE_NICKNAMES'],
    exemples: [
        'autonick //Follow the instructions',
        'autonick delete //Delete current configuration'
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
                            .setFooter(footer)
                    ]
                });

                try {
                    const thisMsg = await msg.channel.awaitMessages({filter, max: 1, time: time }).catch(() => { });
                    if (!thisMsg || !thisMsg.first()) resolve({ content: null });

                    resolve(thisMsg.first());
                } catch (err) {
                    resolve({ content: null });
                }
            });
        }

        if(args[0] === "delete") {
            client.db.query("UPDATE guilds SET autonick_pseudo = NULL, autonick_type_user = NULL WHERE guild_id = ?",[message.guild.id], (error, rows) => { if (error) throw error });
            return message.channel.send({ embeds: [client.util.successMsg(message.author, "Configuration cleared")] })
        }

        const { content: pseudo } = await awaitMessage(message, (msg => msg.author.id == message.author.id && msg.content.length <= 200), 60000, 'What nickname do you want to give to newcomers ?\n\n**Variable ୧。**\n```{pseudo} : pseudo of the user```\n**Example ୧。**\n```[beautiful] - {pseudo}```', '').catch(() => { });
        if (pseudo === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
        if (!pseudo) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

        const { content: typeUser } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (["all", "bot", "user"].includes(msg.content.toLowerCase()) || msg.content.toLowerCase() === "cancel")), 60000, 'For what type of users do you want to set this nickname ?\n\n**Types ୧。**`user` | `bot` | `all`', '').catch(() => { });
        if (typeUser === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
        if (!typeUser) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

        client.db.query("INSERT INTO guilds(guild_id, autonick_pseudo, autonick_type_user) VALUES (?,?,?)",[message.guild.id, pseudo, typeUser], (error, rows) => { if (error) throw error });

        message.channel.send({ embeds: [client.util.successMsg(message.author, "Configuration complete.")] })
    },
};