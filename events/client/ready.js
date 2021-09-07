const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        const results = await client.db.asyncQuery(`SELECT * FROM ban_users`).catch(console.error);

        if (results.length > 0) {
            for (const key of results) {
                let remainingTime = key.date_ban - Date.now();
                let guild = client.guilds.cache.get(key.guild_id);

                if (remainingTime > 0) {
                    console.log(`${key.id_user} bientôt unban !`)

                    setTimeout(async () => {
                        await guild.members.unban(key.id_user);
                        console.log(`${key.id_user} unban !`)
                        client.db.query("DELETE FROM ban_users WHERE id_user = ?", [key.id_user], (error, rows) => { if (error) throw error });
                    }, remainingTime);
                }

            }
        }

        client.user.setActivity(`.help`, { type: 'WATCHING' })

        console.log(chalk.cyan(`${client.user.tag} est désormais connecté !`));

    },
};