const { MessageEmbed } = require("discord.js");
const ms = require("ms");
const { Permissions } = require('discord.js');

module.exports = {
    name: 'test',
    description: 'Rejoindre le serveur support du bot.',
    category: "test",
    clientPermissions: ['EMBED_LINKS'],
    async execute(client, message, args) {

        const a = undefined;

        const b = "oui"

        const c = a ?? b;

        console.log(c);

        /* const result = await client.db.asyncQuery(`SELECT * FROM test`).catch(console.error);

        console.log(result);
    
        message.channel.send("coucou, voici le résulat " + result[1].test); */

        /* let duration = args[0] ? ms(args[0]) : null;

        console.log("debut : " + duration)

        if (duration === undefined || duration === null) {

            console.log("undefined");

        } else {

            if (!isNaN(args[0])) {
                duration = ms(`${duration}m`)
                console.log("dans condi : " + duration)
            } 
            
            if(duration < 30000) return console.log("non")

            console.log("fin : " + ms(duration))
        } */

    },
};