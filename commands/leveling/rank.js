const { MessageEmbed, MessageAttachment } = require("discord.js");
const { createCanvas, loadImage } = require('canvas')

module.exports = {
    name: 'rank',
    description: 'Configure the level system',
    aliases: ['level'],
    category: "Leveling",
    clientPermissions: ['EMBED_LINKS'],
    
    async execute(client, message, args) {

        const applyText = (canvas, ctx, text) => {

            // Declare a base size of the font
            let fontSize = 30;

            ctx.font = '30px ZAKIDS';

            while (ctx.measureText(text).width > canvas.width - 300) {
                ctx.font = `${fontSize -= 10}px ZAKIDS`;
            }

            // Return the result to use in the actual canvas
            return ctx.font;
        };

        const member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
        let data;

        if(!member) data = await client.db.asyncQuery(`SELECT * FROM leveling_users WHERE user_id = ${message.author.id} AND guild_id = ${message.guild.id}`).catch(console.error);
        else data = await client.db.asyncQuery(`SELECT * FROM leveling_users WHERE user_id = ${member.user.id} AND guild_id = ${message.guild.id}`).catch(console.error);

        const canvas = createCanvas(626, 357)
        const ctx = canvas.getContext('2d')

        const background = await loadImage('./img/background-rank.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = applyText(canvas, ctx, !member ? message.member.displayName : member.displayName);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(!member ? message.member.displayName : member.displayName, 190 - (ctx.measureText(!member ? message.member.displayName : member.displayName).width / 2), 302);

        ctx.font = '20px ZAKIDS';
        ctx.fillStyle = '#ffffff';

        let rectHeight;
        
        if(!data[0]) {
            ctx.fillText(`0/50 (0)`, 190 - (ctx.measureText(`0/50 (0)`).width / 2), 340);
            rectHeight = Math.round((0 / 50) * 222);
        } else {
            ctx.fillText(`${data[0].xp}/${data[0].xp_needed} (${data[0].level})`, 190 - (ctx.measureText(`${data[0].xp}/${data[0].xp_needed} (${data[0].level})`).width / 2), 340);
            rectHeight = Math.round((data[0].xp / data[0].xp_needed) * 222);
        }

        ctx.lineJoin = "round"; // forme de la border
        ctx.lineWidth = 8; // épaisseur de la border
        ctx.strokeStyle = '#FFFFFF';

        ctx.strokeRect(412, 312 - rectHeight, 70, rectHeight);
        ctx.fillRect(412, 312 - rectHeight, 70, rectHeight);

        ctx.beginPath();
        ctx.arc(191, 155, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(!member ? message.author.displayAvatarURL({ format: 'png', size: 1024 }) : member.user.displayAvatarURL({ format: 'png', size: 1024 }));
        ctx.drawImage(avatar, 88, 50, 200, 200);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'rank.png')

        message.channel.send({ files: [attachment] });
    },
};