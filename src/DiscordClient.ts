import fs from 'fs';
import path from 'path';
import { ActivityOptions, Client, Guild, Intents, MessageEmbed, TextChannel } from 'discord.js'
import { default as Logger, LogLevel } from './Logger'

export default class DiscordClient {
	private token: string;
	private channelName: string;

	private client: Client;

	public get User() {
		return this.client?.user;
	}

	constructor() {
		const { DISCORD_TOKEN, DISCORD_CHANNEL_NAME } = process.env;

		if (!DISCORD_TOKEN) {
			Logger.Log("DiscordClient", "Missing Discord bot token", LogLevel.ERROR);
			process.exit(1);
		}
		if (!DISCORD_CHANNEL_NAME) {
			Logger.Log("DiscordClient", "Missing Discord channel name", LogLevel.ERROR);
			process.exit(1);
		}

		this.token = DISCORD_TOKEN;
		this.channelName = DISCORD_CHANNEL_NAME;

		this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
	}

	public Login(callback?: Function) {
		if (!this.client) return;

		this.client.on("ready", async () => {
			Logger.Log("DiscordClient", `Signed in as ${this.client.user.tag}!`);

			this.SetRandomActivity();
			setInterval(this.SetRandomActivity, 1000 * 60 * 60 * 2);

			if (typeof callback === "function") callback();
		});

		Logger.Log("DiscordClient", "Signing in to Discord...");
		this.client.login(this.token);
	}

	public SendEmbeddedMessage(title: string, description: string, options: {[key: string]: any} = {}) {
		if (!this.client) return;
		let dateString = new Date().toLocaleString(process.env["LANG"].split(".")[0].replace(/_/g, "-").toLowerCase());

		this.client.guilds.cache.each((guild: Guild) => {
			let guilds = process.env["DISCORD_GUILDS"]?.split(/,|;/) || [];
			if (guilds.length && guilds[0] !== "" && !guilds.includes(guild.id)) return;

			try {
				const channel = guild.channels.cache.find(channel => channel.name === process.env["DISCORD_CHANNEL_NAME"]);
				if (channel) {
					(channel as TextChannel).send({
						embeds: [
							new MessageEmbed({
								title,
								description,
								...options,
								footer: {
									text: options?.footer?.text ? `${options?.footer?.text} • ${dateString}` : dateString
								}
							})
						]
					});
				} else {
					Logger.Log("DiscordClient", `The server "${guild.name}" has no channel named "${this.channelName}".`, LogLevel.ERROR);
				}
			} catch (err) {
				Logger.Log("DiscordClient", `Failed to send message to "${guild.name}". Error: ${err}`, LogLevel.ERROR);
			}
		});
	}

	public SendMessage(content: string) {
		if (!this.client) return;

		this.client.guilds.cache.each((guild: Guild) => {
			let guilds = process.env["DISCORD_GUILDS"]?.split(/,|;/) || [];
			if (guilds.length && guilds[0] !== "" && !guilds.includes(guild.id)) return;

			try {
				const channel = guild.channels.cache.find(channel => channel.name === process.env["DISCORD_CHANNEL_NAME"]);
				if (channel) {
					(channel as TextChannel).send(content);
				} else {
					Logger.Log("DiscordClient", `The server "${guild.name}" has no channel named "${this.channelName}".`, LogLevel.ERROR);
				}
			} catch (err) {
				Logger.Log("DiscordClient", `Failed to send message to "${guild.name}". Error: ${err}`, LogLevel.ERROR);
			}
		});
	}

	private SetRandomActivity() {
		try {
			let Activities: {[key: string]: any} = JSON.parse(fs.readFileSync(path.join(process.cwd(), "activities.json")).toString());
			let activity = Activities[Math.floor(Math.random() * Activities.length)];

			Logger.Log("DiscordClient", `Setting activity to \x1b[3m${activity.options.type}\x1b[0m "${activity.text}".`);
			this.client.user.setActivity(activity.text, (activity.options as ActivityOptions));
		} catch (error) {
			Logger.Log("DiscordClient", `Could not set user activity. Error: ${error}`, LogLevel.ERROR);
		}
	}
}