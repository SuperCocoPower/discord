import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Actions a user globally, mainly used for forcecheck
 * @param client Client
 * @param id Discord user id
 */
export default async function (c: Client, id: string) {
    if (!c.shard)
        return logger.warn({
            labels: { userId: id },
            message: 'No shards online, unable to action appeal',
        });

    const result = await c.shard.broadcastEval(
        async (client, { userid }) => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            const output: any[] = [];

            const guilds = await client.guilds.fetch();

            for (const guildData of guilds.values()) {
                try {
                    const guild = await client.guilds.fetch(guildData.id);
                    const member = await guild.members.fetch(userid);
                    client.emit('guildMemberAdd', member);
                } catch (e) {
                    continue;
                }
                await delay(500);
            }

            return output;
        },
        { context: { userid: id } }
    );

    for (const res of result) {
        for (const log of res) {
            logger.info(log);
        }
    }

    return true;
}
