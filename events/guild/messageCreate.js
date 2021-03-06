const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {

        if (message.author.bot) return;

        // leveling system

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function getNeededXP(neededXP) {
            return Math.floor((1.08 * neededXP) + 100);
        }

        function firstNeededXp(level) {
            let result = 0;
            for (let i = 0; i <= level; i++) {
                result = Math.floor((1.08 * result) + 100);
            }
            return result;
        }

        function generateXp() {
            return Math.floor(Math.random() * 23) + 5;
        }

        async function manageXp(message, client) {
            if (!client.talkedRecently.has(message.author.id + message.guild.id)) {

                const data = await client.db.asyncQuery(`SELECT * FROM leveling_users WHERE user_id = ${message.author.id} AND guild_id = ${message.guild.id}`).catch(console.error);
                const generateXpFunction = generateXp();

                if (!data[0]) {
                    client.db.query("INSERT INTO leveling_users(user_id, xp, xp_all, xp_needed, guild_id) VALUES(?, ?, ?, ?, ?)", [message.author.id, generateXpFunction, generateXpFunction, getNeededXP(0), message.guild.id], (error, rows) => { if (error) throw error });
                } else {
                    let level = data[0].level;
                    let xp = data[0].xp + generateXpFunction;
                    const needed = firstNeededXp(data[0].level);

                    await client.db.query("UPDATE leveling_users SET xp = ?, xp_all = xp_all + ?, xp_needed = ? WHERE guild_id = ? AND user_id = ?", [xp, generateXpFunction, needed, message.guild.id, message.author.id], (error, rows) => { if (error) throw error });

                    if (xp >= needed) {
                        ++level;
                        xp -= needed;

                        const newNeeded = getNeededXP(needed);

                        const guild_data = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

                        if (guild_data[0].rolesRewards) {
                            const object = JSON.parse(guild_data[0].rolesRewards);

                            if(object[level]) message.member.roles.add(object[level]);
                        }

                        let replaceMessageLevelUp;
                    
                        if (guild_data[0].messageLevelUp) {
                            replaceMessageLevelUp = guild_data[0].messageLevelUp.replace(/{(pseudo|mention|level)}/gmi, (_, match) => {
                                switch (match) {
                                    case 'pseudo':
                                        return message.author.tag;

                                    case 'mention':
                                        return message.author;

                                    case 'level':
                                        return level;
                                }
                            });
                        }

                        const channel = message.guild.channels.cache.get(guild_data[0].channelLevelUpMessage) || message.channel;

                        channel.send(guild_data[0].messageLevelUp ? capitalizeFirstLetter(replaceMessageLevelUp) : `<:add_erio:892011328150065203> **Congratulations ${message.author}, you are now at level \`${level}\` !**`);

                        await client.db.query("UPDATE leveling_users SET xp = ?, xp_needed = ?, level = ? WHERE guild_id = ? AND user_id = ?", [0, newNeeded, level, message.guild.id, message.author.id], (error, rows) => { if (error) throw error });

                    }
                }

                client.talkedRecently.add(message.author.id + message.guild.id);
                setTimeout(() => {
                    client.talkedRecently.delete(message.author.id + message.guild.id)
                }, 5000)

            }
        }

        function checkPermission(message, permissions, member) {
            const missing = message.channel.permissionsFor(member).missing(permissions, false);
            if (missing.length > 0) {
                return `the following permission(s): ${missing.map(perm => `**${perm}**`).join(', ')}`;
            }
            return false;
        }

        const result_guild = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        const prefix = result_guild[0].prefix_guild;

        const regex = message.content.match(`^<@!?881644932216025098> *|^\\${prefix}`);

        if (!regex) {

            if (result_guild[0].leveling) manageXp(message, client);

            return;
        }

        const [commandName, ...args] = message.content.slice(regex[0].length).trimStart().toLowerCase().split(/\s+/)

        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.ownerOnly && message.author.id !== "378617147858878465") return;

        if (command.guildOnly && message.channel.type === 'dm') return;

        if (message.channel.type === 'GUILD_TEXT') {
            if (!message.channel.permissionsFor(message.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
        }

        if (command.DMOnly && message.channel.type === 'GUILD_TEXT') {
            return message.channel.send({ embeds: [client.util.errorMsg(message.author, "The command can only be executed in the bot's private messages.")] });
        }

        if (message.channel.type === 'GUILD_TEXT') {
            if (command.clientPermissions) {
                const needPerms = checkPermission(message, command.clientPermissions, message.guild.me);
                if (needPerms) return message.channel.send({ embeds: [client.util.errorMsg(message.author, 'I am missing ' + needPerms)] });
            }

            if (command.userPermissions) {
                const needPerms = checkPermission(message, command.userPermissions, message.member);
                if (needPerms) return message.channel.send({ embeds: [client.util.errorMsg(message.author, 'You are missing ' + needPerms)] });
            }
        }

        if (command.args && !args.length) {
            let reply = `Tu n'as indiqu?? aucun argument.`;

            if (command.usage) {
                reply += `\n\n\`\`\`Usage:\n\n> ${prefix}${command.name} ${command.usage}\`\`\``;
            }

            return message.channel.send({ embeds: [client.util.errorMsg(message.author, reply)] });
        }

        try {
            command.execute(client, message, args);
        } catch (error) {
            console.error(error);
            return message.channel.send({ embeds: [client.util.errorMsg(message.author, "I encountered an error when running the command.")] });
        }
    },
};