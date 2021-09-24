const { MessageEmbed, Permissions, Collection } = require("discord.js");

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {

        if (oldState.member.user.bot || newState.member.user.bot) return;
        if (oldState.selfMute !== newState.selfMute && oldState.channelId === newState.channelId) return;

        let status;

        const channel = await client.db.asyncQuery(`SELECT * FROM guilds WHERE guild_id = ${newState.guild.id}`).catch(console.error);
        if (!channel[0].voiceschannel) return;
        const voiceChannel = (newState || oldState).guild.channels.cache.get(channel[0].voiceschannel);
        if (!voiceChannel) return;

        const checkCategory = newState.channel?.parentId || oldState.channel?.parentId;

        if ((oldState.channel == null && newState.channel)) status = 'joined';
        if ((newState.channel == null && oldState.channel)) status = 'leaved';
        if ((oldState.channel !== null && newState.channel !== null)) status = 'switched';

        if (status !== 'switched') {
            if (voiceChannel.parentId !== checkCategory) return;
        }

        switch (status) {
            case "joined":


                if (newState.channelId !== channel[0].voiceschannel) return;
                const createChannel = await newState.guild.channels.create(`Channel de ${newState.member.nickname}`, {
                    type: 'GUILD_VOICE',
                    parent: voiceChannel.parentId,
                    permissionOverwrites: [
                        {
                            id: client.user.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MOVE_MEMBERS],
                        },
                    ]
                })
                await newState.member.voice.setChannel(createChannel.id);
                client.db.query("INSERT INTO voices_owner(channel_id, owner_id, guild_id) VALUES(?,?,?)", [createChannel.id, newState.member.id, newState.guild.id], (error, rows) => { if (error) throw error });
                client.Tempchannels.add(createChannel.id);
                /* const values = client.ownerVoices.get(newState.member.id);
                if (values) values.push(createChannel.id);
                else client.ownerVoices.set(newState.member.id, [createChannel.id]); */
                break;


            case "leaved":

                // si un mec leave et que c le dernier du channel : je crée un array en extension de client et je check si le channel est dans l'array

                /* const dataChannel = client.ownerVoices.get(oldState.member.id);
                if (!dataChannel || !dataChannel.includes(oldState.channelId)) return; */
                if (!client.Tempchannels.has(oldState.channelId)) return;
                const channelDelete = oldState.guild.channels.cache.get(oldState.channelId);
                if (!channelDelete) return;
                if (channelDelete.members.size === 0) {
                    await channelDelete.delete();
                    client.db.query("DELETE FROM voices_owner WHERE guild_id = ? AND channel_id = ?", [oldState.guild.id, channelDelete.id], (error, rows) => { if (error) throw error });
                    client.Tempchannels.delete(oldState.channelId);
                }
                /* if (dataChannel.length === 1) client.ownerVoices.delete(oldState.member.id)
                else if (dataChannel.length > 1) {
                    const index = dataChannel.indexOf(oldState.channelId)
                    dataChannel.splice(index, 1)
                } */
                break;


            case "switched":


                /* const dataChannelUser = client.ownerVoices.get(oldState.member.id); */

                /* if (dataChannelUser?.includes(oldState.channelId)) { */
                if (client.Tempchannels.has(oldState.channelId)) {

                    const channelUser = oldState.guild.channels.cache.get(oldState.channelId);

                    if (oldState.channelId === channelUser?.id) {
                        if (channelUser.members.size === 0) {
                            await channelUser.delete();
                            client.Tempchannels.delete(oldState.channelId);
                            client.db.query("DELETE FROM voices_owner WHERE guild_id = ? AND channel_id = ?", [oldState.guild.id, channelUser.id], (error, rows) => { if (error) throw error });
                        }
                        
                        /* if (dataChannelUser.length === 1) client.ownerVoices.delete(oldState.member.id)
                        else if (dataChannelUser.length > 1) {
                            const index = dataChannelUser.indexOf(oldState.channelId)
                            dataChannelUser.splice(index, 1)
                        } */
                    }

                }

                if (newState.channelId === channel[0].voiceschannel) {
                    const createChannel2 = await newState.guild.channels.create(`Channel de ${newState.member.nickname}`, {
                        type: 'GUILD_VOICE',
                        parent: voiceChannel.parentId,
                        permissionOverwrites: [
                            {
                                id: client.user.id,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MOVE_MEMBERS],
                            },
                        ]
                    })
                    await newState.member.voice.setChannel(createChannel2.id);
                    client.db.query("INSERT INTO voices_owner(channel_id, owner_id, guild_id) VALUES(?,?,?)", [createChannel2.id, newState.member.id, newState.guild.id], (error, rows) => { if (error) throw error });
                    client.Tempchannels.add(createChannel2.id);
                    /* const valuesSwitch = client.ownerVoices.get(newState.member.id);
                    if (valuesSwitch) valuesSwitch.push(createChannel2.id);
                    else client.ownerVoices.set(newState.member.id, [createChannel2.id]); */
                }
                break;


        }
    },
};