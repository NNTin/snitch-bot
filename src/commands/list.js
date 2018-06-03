const cache = require("../utils/cache");
const Logger = require("../utils/logger");

module.exports = {
    name: "list",
    usage: "",
    args: 0,
    async execute (msg) {
        const guild = msg.channel.guild.id;
        const user = msg.author.id;

        let result = await cache.getTrigger(guild, user);

        let message;

        if (result.length) {
            message = await msg.member.send(`List of your triggers:\n${result.map(row => row.keyword).join(", ")}`);
        } else {
            message = await msg.member.send(`You don't have any triggers`);
        }

        msg.original.delete().catch(e => Logger.error(e));
    }
};
