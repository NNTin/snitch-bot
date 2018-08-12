class Messages{
    constructor() {
        this.messages = 0;
        this.hits = 0;
    }

    incM() {
        this.messages++;
    }

    incH() {
        this.hits++;
    }

    fetchM() {
        const m = this.messages;
        this.messages = 0;
        return m;
    }

    fetchH() {
        const h = this.hits;
        this.hits = 0;
        return h;
    }
}

module.exports.ShardMetrics = () => {
    return new Messages();
}

module.exports.Metrics = (manager) => {
    const Influx = require("influx");
    const { query } = require("../utils/database");

    const client = new Influx.InfluxDB({
        host: "influxdb",
        database: "snitch_bot",
        schema: [
            {
                measurement: "guilds",
                fields: {
                    count: Influx.FieldType.INTEGER
                },
                tags: [],
            },
            {
                measurement: "users",
                fields: {
                    count: Influx.FieldType.INTEGER
                },
                tags: [],
            },
            {
                measurement: "triggers",
                fields: {
                    triggers: Influx.FieldType.INTEGER,
                    users: Influx.FieldType.INTEGER,
                    unique_users: Influx.FieldType.INTEGER,
                    words: Influx.FieldType.INTEGER
                },
                tags: [],
            },
            {
                measurement: "messages",
                fields: {
                    messages: Influx.FieldType.INTEGER,
                    hits: Influx.FieldType.INTEGER,
                },
                tags: [],
            }
        ]
    });

    setInterval(async () => {
        if (manager.shards.size !== manager.totalShards) return;
        const guilds = manager.broadcastEval("this.guilds.size").then(guilds => guilds.reduce((total, num) => total + num));
        const users = manager.broadcastEval("this.guilds.map(guild => guild.memberCount)").then(members => members.filter(arr => arr.length).map(arr => arr.reduce((total, num) => total + num)).reduce((total, num) => total + num));
        const messages = manager.broadcastEval("this.metrics.fetchM()").then(messages => messages.reduce((total, num) => total + num));
        const hits = manager.broadcastEval("this.metrics.fetchH()").then(hits => hits.reduce((total, num) => total + num));

        const result = await query("SELECT (SELECT COUNT(DISTINCT user_id) FROM triggers) as unique_users, (SELECT COUNT(DISTINCT user_id, guild_id) FROM triggers) as users, (SELECT COUNT(*) FROM triggers) as triggers, (SELECT COUNT(DISTINCT keyword_id) FROM triggers) as words").then(result => result[0]);

        client.writePoints([
            {
                measurement: "guilds",
                fields: {
                    count: await guilds,
                }
            },
            {
                measurement: "users",
                fields: {
                    count: await users,
                }
            },
            {
                measurement: "shards",
                fields: {
                    count: manager.shards.size,
                }
            },
            {
                measurement: "messages",
                fields: {
                    messages: await messages,
                    hits: await hits,
                }
            },
            {
                measurement: "triggers",
                fields: {
                    triggers: result.triggers,
                    users: result.users,
                    unique_users: result.unique_users,
                    words: result.words
                }
            }
        ]).catch(() => null);
    }, 15000);

}