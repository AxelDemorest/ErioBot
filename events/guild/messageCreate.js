const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {

        if (message.author.bot) return;

        // leveling system

        function getNeededXP(neededXP) {
            return Math.floor((1.07 * neededXP) + 50);
        }

        function generateXp() {
            return Math.floor(Math.random() * 18) + 5;
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
                    const needed = data[0].xp_needed;

                    await client.db.query("UPDATE leveling_users SET xp = ?, xp_all = xp_all + ? WHERE guild_id = ? AND user_id = ?", [xp, generateXpFunction, message.guild.id, message.author.id], (error, rows) => { if (error) throw error });

                    if (xp >= needed) {
                        ++level;
                        xp -= needed;

                        const newNeeded = getNeededXP(needed);

                        message.channel.send(`<a:a_BlueArrow:889566187925680138> **Félicitation ${message.author}, tu es passé au niveau** \`${level}\` !`);

                        await client.db.query("UPDATE leveling_users SET xp = ?, xp_needed = ?, level = ? WHERE guild_id = ? AND user_id = ?", [xp, newNeeded, level, message.guild.id, message.author.id], (error, rows) => { if (error) throw error });

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
            
            if(result_guild[0].leveling) manageXp(message, client);
            
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
            let reply = `Tu n'as indiqué aucun argument.`;

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