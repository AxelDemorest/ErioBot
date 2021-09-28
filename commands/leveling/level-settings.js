const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
    name: 'level-settings',
    description: 'Configure the leveling module.',
    aliases: ['ls'],
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: ['ADMINISTRATOR'],
    exemples: [
        'level-settings channel #channel',
        'level-settings channel auto // Set the channel where the user level up.',
        'level-settings message Congratulations, level up!',
    ],
    async execute(client, message, args) {

        const data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        if (!data[0].leveling) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The leveling module has not been enabled.")] });

        switch (args[0]) {
            case 'message':
                if (!args[1]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Please provide a text.\n\n**Variables︰**\n```{mention} : mention the user\n{pseudo} : tag of the user\n{level} : new level of the user```\n**Example︰**\n```Congratulations {pseudo}, your level : {level}```")] });

                args.shift();

                client.db.query("UPDATE guilds SET messageLevelUp = ? WHERE guild_id = ?", [args.join(" "), message.guild.id], (error, rows) => { if (error) throw error });

                message.channel.send({ embeds: [client.util.successMsg(message.author, "Message successfully updated !")] })
                break;

            case 'channel':
                if (!args[1]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Please provide a channel or `auto` to set the channel where the user level up.")] });

                if (args[1] === "auto") {
                    client.db.query("UPDATE guilds SET channelLevelUpMessage = NULL WHERE guild_id = ?", [message.guild.id], (error, rows) => { if (error) throw error });

                    message.channel.send({ embeds: [client.util.successMsg(message.author, "Channel successfully updated !")] })
                } else {
                    const channel = message.guild.channels.cache.get(args[1]) || message.mentions.channels.first();

                    if (!channel) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Channel not found.")] });

                    client.db.query("UPDATE guilds SET channelLevelUpMessage = ? WHERE guild_id = ?", [channel.id, message.guild.id], (error, rows) => { if (error) throw error });

                    message.channel.send({ embeds: [client.util.successMsg(message.author, "Channel successfully updated !")] })
                }
                break;

                default:
                    message.channel.send({ embeds: [client.util.errorMsg(message.author, `Please provide a parameter.\n\n**Parameters:** \`message\` | \`channel\`\n\n**Examples:**\n\`\`\`js\n${this.exemples.join("\n")}\`\`\``)] });
        }

    },
};