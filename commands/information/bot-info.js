const { MessageEmbed } = require("discord.js");
var osu = require('node-os-utils')
var cpu = osu.cpu
const moment = require('moment');
require("moment-duration-format");
moment.locale('fr');

module.exports = {
    name: "bot-info",
    description: 'Information about ErioBot',
    category: "Information",
    aliases: ['bi', 'binfo'],
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const { commands } = client;

        const cpuPercentage = await cpu.usage();

        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("#70D9F3")
                    .setAuthor("ErioBot's informations", client.user.avatarURL())
                    .setDescription(`**Developer** ・ <@378617147858878465>
**Creation date** ・ \`${moment(client.user.createdAt).format('DD MMMM YYYY')}\`
**Library** ・ [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome)
**Version** ・ \`1.0.0\`
        
        ―――――――――――――――――――――――――――
        
\`\`\`js
╭
|  Servers      ～ ${client.guilds.cache.size}
|  Users        ～ ${client.users.cache.size}
|  Channels     ～ ${client.channels.cache.size}
|  Commands     ～ ${commands.map(command => command.name).length}
|  Memory       ～ ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
|  Uptime       ～ ${moment.duration(client.uptime).format("D [d], H [h], m [m], s [s]")}
|  Usage CPU    ～ ${Math.round(cpuPercentage)} %
╰
\`\`\``)
                    .setThumbnail(client.user.avatarURL({ size: 2048, format: "png" }))
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setTimestamp()
            ]
        })

    }
}