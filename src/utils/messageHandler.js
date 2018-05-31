const EnrichMessage = require("./enrichMessage");
const Logger = require("../utils/logger");
const { RichEmbed } = require("discord.js");

module.exports = async (msg) => {
    if (msg.channel.type !== "text") return;
    const Client = msg.client;

    if (Client.user.id === msg.author.id) return;

    const richMessage = await EnrichMessage(msg);

    if (richMessage.isCommand) {
        if (richMessage.command.args <= richMessage.command.params.length) {
            await richMessage.command.execute();
        } else {
            await msg.channel.send(`This command requires atleast ${richMessage.command.args} argument${richMessage.command.args === 1 ? "" : "s"}`);
        }
    }

    richMessage.on("hit", async (info) => {
        Logger.log(`Notified member`);
        const guild = info.msg.channel.guild;
        const channel = info.msg.channel;
        const author = info.msg.author;

        let user;

        if (guild.members.has(info.user)) {
            user = guild.members.get(info.user);
        } else {
            user = await guild.fetchMember(info.user);
        }

        const embed = new RichEmbed({
            title: "There was a word mentioned you are following.",
            description: `**${author.tag}** mentioned the word **${info.word}** in **${guild.name}#${channel.name}**\n\nServer: ${guild.name}\nChannel: ${channel.name}\nMentioner: ${author.tag}`,
            color: parseInt("FF0000", 16),
        });
        user.send(embed);
    });

    richMessage.search();
}
