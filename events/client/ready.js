const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        const results_ban = await client.db.asyncQuery(`SELECT * FROM ban_users`).catch(console.error);

        if (results_ban.length > 0) {
            for (const key of results_ban) {
                let remainingTime = key.date_ban - Date.now();
                let guild = client.guilds.cache.get(key.guild_id);

                if (remainingTime > 0) {
                    setTimeout(async () => {
                        await guild.members.unban(key.id_user);
                        client.db.query("DELETE FROM ban_users WHERE id_user = ?", [key.id_user], (error, rows) => { if (error) throw error });
                    }, remainingTime);
                } else {
                    await guild.members.unban(key.id_user);
                    client.db.query("DELETE FROM ban_users WHERE id_user = ?", [key.id_user], (error, rows) => { if (error) throw error });
                }

            }
        }

        const results_mute = await client.db.asyncQuery(`SELECT * FROM mute_users`).catch(console.error);

        if (results_mute.length > 0) {
            for (const key of results_mute) {
                let remainingTime = key.date_mute - Date.now();
                let guild = client.guilds.cache.get(key.guild_id);
                let member = guild.members.cache.get(key.id_user);
                let muterole = guild.roles.cache.find(muterole => muterole.name === "muted");

                if (remainingTime > 0) {
                    setTimeout(async () => {
                        if(muterole) await member.roles.remove(muterole);
                        client.db.query("DELETE FROM mute_users WHERE id_user = ?", [key.id_user], (error, rows) => { if (error) throw error });
                    }, remainingTime);
                } else {
                    if(muterole) await member.roles.remove(muterole);
                    client.db.query("DELETE FROM mute_users WHERE id_user = ?", [key.id_user], (error, rows) => { if (error) throw error });
                }

            }
        }

        const results_voicesChannel = await client.db.asyncQuery(`SELECT * FROM voices_owner`).catch(console.error);

        for(const key of results_voicesChannel) {
            client.Tempchannels.add(key.channel_id);
        }

        client.user.setActivity(`.help`, { type: 'WATCHING' })

        console.log(chalk.cyan(`${client.user.tag} est désormais connecté !`));

    },
};