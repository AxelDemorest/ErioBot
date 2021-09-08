const { MessageEmbed } = require("discord.js");
const { Permissions } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {

        if (message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
            const autonick = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${member.guild.id}`).catch(console.error);

            if (autonick.length > 0) {
                switch (autonick[0].autonick_type_user) {
                    case 'user':
                        if (member.user.bot) return;
                        break;
                    case 'bot':
                        if (!member.user.bot) return;
                        break;
                }

                member.setNickname(autonick[0].autonick_pseudo.replace("{pseudo}", member.user.username))
            }
        }
    },
};