const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
    name: 'rewards',
    description: 'Configure the roles rewards',
    aliases: ['rd'],
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: ['ADMINISTRATOR'],
    async execute(client, message, args) {

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }

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

        if (!data[0].leveling) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The leveling module has not been enabled.")] });

        const object = JSON.parse(data[0].rolesRewards) || {};

        const role = message.guild.roles.cache.get(args[1]) || message.mentions.roles.first();

        switch (args[0]) {
            case 'add':
                if (!args[1]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Please provide a role to add as a reward.")] });

                if (!role) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Role not found.")] });

                if (getKeyByValue(object, role.id)) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "That role is already set as a reward.")] });

                const { content: levelToRole } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (!isNaN(msg) || msg.content.toLowerCase() === "cancel")), 180000, 'At what level should this role be assigned ?', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (levelToRole === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!levelToRole) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                object[levelToRole] = role.id;

                client.db.query("UPDATE guilds SET rolesRewards = ? WHERE guild_id = ?", [JSON.stringify(object), message.guild.id]);

                message.channel.send({ embeds: [client.util.successMsg(message.author, "Role successfully added !")] })
                break;

            case 'edit':
                if (!args[1]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Please provide a role reward to edit.")] });
                if (!role) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Role not found.")] });

                const getKeyInObjectEdit = getKeyByValue(object, role.id);

                if (!getKeyInObjectEdit) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Role not found.")] });

                const { content: levelToRoleEdit } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (!isNaN(msg) || msg.content.toLowerCase() === "cancel")), 180000, 'At what level should this role be assigned ?', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (levelToRoleEdit === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!levelToRoleEdit) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                delete object[getKeyInObjectEdit];
                object[levelToRoleEdit] = role.id;

                message.channel.send({ embeds: [client.util.successMsg(message.author, `Reward ${role} successfully edited !`)] })
                client.db.query("UPDATE guilds SET rolesRewards = ? WHERE guild_id = ?", [JSON.stringify(object), message.guild.id]);
                break;

            case 'delete':
                if (!args[1]) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Please provide a role reward to remove.")] });

                if (!role) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Role not found.")] });

                const getKeyInObject = getKeyByValue(object, role.id);
                if (!getKeyInObject) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Role not found in rewards.")] });
                else {
                    delete object[getKeyInObject];
                    message.channel.send({ embeds: [client.util.successMsg(message.author, `Reward ${role} successfully deleted !`)] })
                    client.db.query("UPDATE guilds SET rolesRewards = ? WHERE guild_id = ?", [JSON.stringify(object), message.guild.id]);
                }
                break;

            case 'list':
                break;

            default:
                message.channel.send({ embeds: [client.util.errorMsg(message.author, `Please provide a parameter.\n\n**Parameters:** \`add\` | \`edit\` | \`delete\` | \`list\`\n\n**Examples:**\n\`\`\`js\n${this.exemples.join("\n")}\`\`\``)] });
        }


    },
};