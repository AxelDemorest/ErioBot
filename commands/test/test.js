const { MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = {
    name: 'test',
    description: 'Rejoindre le serveur support du bot.',
    category: "test",
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        /* const result = await client.db.asyncQuery(`SELECT * FROM test`).catch(console.error);

        console.log(result);
    
        message.channel.send("coucou, voici le résulat " + result[1].test); */

        console.log(Date.now())

    },
};