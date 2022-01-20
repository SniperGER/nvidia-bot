import axios from "axios";
import fs from "fs";
import path from "path";
import readline from "readline";
import semver from 'semver';

import EdgeInventory from "./EdgeInventory"
import FEInventory from "./FEInventory"
import DiscordClient from "./DiscordClient"
import { default as Logger, LogLevel } from "./Logger"

if (process.env["GPU_LIST"].split(/,|;/).length == 0) {
	Logger.Log("EdgeInventory", "No GPUs selected. At least one GPU needs to be selected.", LogLevel.ERROR);
	process.exit(1);
}

declare global {
	var discordClient: DiscordClient;
	var Localization: any
}

export default class NVIDIABot {
	private discordClient: DiscordClient;

	public async Run(args?: {[key: string]: any}) {
		// TODO: Load localization
		process.env = {
			...process.env,
			"LOCALES": args["locales"] ?? process.env["LOCALES"],
			"GPU_LIST": args["gpus"] ?? process.env["GPU_LIST"],
			"DISCORD_TOKEN": args["token"] ?? process.env["DISCORD_TOKEN"],
			"DISCORD_CHANNEL_NAME": args["channel-name"] ?? process.env["DISCORD_CHANNEL_NAME"],
			"DISCORD_GUILDS": args["guilds"] ?? process.env["DISCORD_GUILDS"]
		}

		let language = process.env["LOCALES"].split(/,|;/)[0].split("-")[0].toLowerCase();
		if (fs.existsSync(path.join(process.cwd(), "locale", `${language}.json`))) {
			global.Localization =  JSON.parse(fs.readFileSync(path.join(process.cwd(), "locale", `${language}.json`)).toString());
		} else {
			global.Localization =  JSON.parse(fs.readFileSync(path.join(process.cwd(), "locale", "en.json")).toString());
		}

		Logger.Log("NVIDIABot", "Checking for available updates...");
		let packageJson: {[key: string]: any} = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());
		let remotePackageJson: {[key: string]: any} = await axios.get("https://raw.githubusercontent.com/SniperGER/nvidia-bot/master/package.json")
			.then(response => response.data)
			.catch((error: Error) => {
				Logger.Log("NVIDIABot", `Failed to check for updates: ${error.message}`, LogLevel.ERROR);
			});

		if (packageJson && remotePackageJson) {
			if (semver.gt(remotePackageJson.version, packageJson.version)) {
				Logger.Log("NVIDIABot", `A new version of ${packageJson.name} is available! (Installed: ${packageJson.version}, Current: ${remotePackageJson.version})`, LogLevel.WARN);
				Logger.Log("NVIDIABot", `Please visit ${packageJson.homepage} for instructions on how to update.`, LogLevel.WARN);
			} else {
				Logger.Log("NVIDIABot", "✅ You're up to date!");
			}
		}

		this.discordClient = new DiscordClient();
		global.discordClient = this.discordClient;
		if (!this.discordClient) return;

		this.discordClient.Login(async () => {
			await EdgeInventory.FetchProducts();
			await FEInventory.CheckInventory();
		});

		readline.createInterface({
			input: process.stdin,
			output: process.stdout
		}).on("SIGINT", () => {
			if (this.discordClient.User) this.discordClient.User.setStatus("invisible");

			Logger.Log("NVIDIABot", "Goodbye!");
			process.exit(0);
		});
	}
}