const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {

        function checkPermission(message, permissions, member) {
            const missing = message.channel.permissionsFor(member).missing(permissions, false);
            if (missing.length > 0) {
                return `the following permission(s): ${missing.map(perm => `**${perm}**`).join(', ')}`;
            }
            return false;
        }

        const result_prefix = await client.db.asyncQuery(`SELECT prefix_guild FROM guilds WHERE guild_id = ${message.guild.id}`).catch(console.error);

        const prefix = result_prefix[0].prefix_guild;

        const regex = message.content.match(`^<@!?881644932216025098> *|^\\${prefix}`);

        if (!regex || message.author.bot) return;

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