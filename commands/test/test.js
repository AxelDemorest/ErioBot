const { MessageEmbed } = require("discord.js");
const ms = require("ms");
const { Permissions } = require('discord.js');
const moment = require("moment");
moment.locale("fr")

module.exports = {
    name: 'test',
    description: 'commande test',
    category: "test",
    clientPermissions: ['EMBED_LINKS'],
    ownerOnly: true,
    async execute(client, message, args) {

        let result = 0;

        for(let i=0; i<8; i++) {
            result = Math.floor((1.08 * result) + 100);
            console.log(result)
        }
            

        /* const MapObject = new Map();

        MapObject.set("value", ['coucou']);

        const value = MapObject.get("value");

        if(!value?.includes("coucou")) console.log("non")
        else console.log("oui") */

        /* console.log(value.length)

        const index = value.indexOf("2")

        value.splice(index, 1)

        console.log(value) */
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