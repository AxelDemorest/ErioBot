const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'autorole',
    description: 'Set an automatic role that will be assigned to a new member',
    category: "Administration",
    userPermissions: ['ADMINISTRATOR'],
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

        const data_autorole = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        const role = JSON.parse(data_autorole[0].autorole_roles) || {};

        const { content: typeAction } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (["create", "delete"].includes(msg.content.toLowerCase()) || msg.content.toLowerCase() === "cancel")), 180000, 'What do you want to do ?\n\n・`create`︰Add an autorole.\n・`delete`︰Delete an autorole.', `Executed by ${message.author.tag}・cancel to stop the command.`,).catch(() => { });
        if (typeAction === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
        if (!typeAction) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

        switch (typeAction) {
            case "create":
                const { content: typeUserCreate } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (["bot", "user"].includes(msg.content.toLowerCase()) || msg.content.toLowerCase() === "cancel")), 180000, 'For what type of users do you want to add the role ?\n\n**Types︰**`user` | `bot`', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (typeUserCreate === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!typeUserCreate) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                const roleCreate = await awaitMessage(message, (msg => msg.author.id == message.author.id && (message.guild.roles.cache.get(msg.content.toLowerCase()) || msg.mentions.roles.first() || msg.content.toLowerCase() === "cancel")), 180000, 'What role do you want to add ?\n\n*You can use `mention` or `id`. If the role is not found, nothing will happen.*', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (roleCreate === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!roleCreate) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                const roleId = roleCreate.mentions.roles?.first()?.id || roleCreate.content;

                role[typeUserCreate] = role[typeUserCreate] || [];

                if (role[typeUserCreate].includes(roleId)) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "This role is already saved for users.")] });

                role[typeUserCreate].push(roleId);

                client.db.query("UPDATE guilds SET autorole_roles = ? WHERE guild_id = ?", [JSON.stringify(role), message.guild.id], (error, rows) => { if (error) throw error });
                break;
            case "delete":
                const { content: typeUserDelete } = await awaitMessage(message, (msg => msg.author.id == message.author.id && (["bot", "user"].includes(msg.content.toLowerCase()) || msg.content.toLowerCase() === "cancel")), 180000, 'For what type of users do you want to delete a role ?\n\n**Types︰**`user` | `bot`', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (typeUserDelete === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!typeUserDelete) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                const roleDelete = await awaitMessage(message, (msg => msg.author.id == message.author.id && (message.guild.roles.cache.get(msg.content.toLowerCase()) || msg.mentions.roles.first() || msg.content.toLowerCase() === "cancel")), 180000, 'What role do you want to delete ?\n\n*You can use `mention` or `id`. If the role is not found, nothing will happen.*', `Executed by ${message.author.tag}・cancel to stop the command.`).catch(() => { });
                if (roleDelete === "cancel") return message.channel.send({ embeds: [client.util.successMsg(message.author, "Cancelled command.")] })
                if (!roleDelete) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "Time elapsed.")] })

                const roleIdDelete = roleDelete.mentions.roles?.first()?.id || roleDelete.content;

                role[typeUserDelete] = role[typeUserDelete] || [];

                if (!role[typeUserDelete].includes(roleIdDelete)) return message.channel.send({ embeds: [client.util.errorMsg(message.author, "This role isn't saved for users.")] });

                role[typeUserDelete].splice(role[typeUserDelete].indexOf(roleIdDelete), 1);

                client.db.query("UPDATE guilds SET autorole_roles = ? WHERE guild_id = ?", [JSON.stringify(role), message.guild.id], (error, rows) => { if (error) throw error });

                break;
        }

        message.channel.send({ embeds: [client.util.successMsg(message.author, "Configuration complete.")] })
    },
};