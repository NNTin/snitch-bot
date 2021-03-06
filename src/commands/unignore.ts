import { Message } from "discord.js";

const cache = require("../utils/cache");
const member = require("../utils/extractors/member");
const STRINGS = require("../strings/index");

module.exports = {
    name: "unignore",
    guildOnly: true,
    usage: "[user_id or username]",
    args: 1,
    async execute (msg: Message) {
        const guild = msg.guild.id;
        const user = msg.author.id;

        const ignore_member = await member(msg);

        if (!ignore_member) {
            return await msg.channel.send(STRINGS.INVALID_MEMBER);
        }

        let result = await cache.delIgnore(guild, user, ignore_member.user.id);

        if (result.deleted) {
            await msg.channel.send(STRINGS.C_UNIGNORE_SUCCESS.complete(ignore_member.user.tag));
        } else {
            await msg.channel.send(STRINGS.C_UNIGNORE_E_NOT_LISTED.complete(ignore_member.user.tag));
        }
    }
};
