const cache = require("../utils/cache");
const Logger = require("../utils/logger");

module.exports = {
    name: "remove",
    usage: "[word]",
    args: 1,
    async execute (msg) {
        const guild = msg.channel.guild.id;
        const user = msg.author.id;
        const keyword = msg.command.params[0].toLowerCase();

        let result = await cache.delTrigger(guild, user, keyword);

        let message;

        if (result.deleted) {
            message = await msg.channel.send(`Removed the word **${keyword}** succesfully`);
        } else {
            message = await msg.channel.send(`The word **${keyword}** is not on your trigger list`);
        }

        setTimeout(() => {
            msg.original.delete().catch(e => Logger.error(e));
            message.delete();
        }, 3000);
    }
};
