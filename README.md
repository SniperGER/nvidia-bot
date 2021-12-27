# NVIDIABot
A Discord bot to track availability of NVDIA GeForce RTX 3000 Series GPUs based on [ElegyD/nvidia-notifier](https://github.com/ElegyD/nvidia-notifier)

## Description
This bot queries the NVIDIA API to check for availability and posts a message on your Discord server if availability, stock or prices change. Nothing more, nothing less.  
As a more advanced feature, this bot also supports various types of focus. If you believe a sale happens more often on Tuesdays, you can set the bot to check in a smaller interval on this day. You can also reduce the interval on weekends if you need to save on requests. Or if you only want to check on select days, you can do that too. For *even more* granularity, you can also set specific hours at which you want to check (see configuration).

For an outdated, more basic reimplementation of [ElegyD/nvidia-notifier](https://github.com/ElegyD/nvidia-notifier), see the `legacy` branch.

## Is this bot able to buy GPUs as soon as they're available?
No, and it never will be. If you actually consider using a bot to automatically buy available GPUs, you're a horrible person. Get lost!

## Installation & Usage
NVIDIABot has been tested with Node.js 16.11.0, but may also work with older releases.  
To install NVIDIABot, clone this repository in a directory of your choice:

```
git clone https://github.com/SniperGER/nvidia-bot.git
```

Change in to the bot directory and install the require Node.js modules:

```
cd nvidia-bot
npm i --production	# Install runtime dependencies only
npm i 				# Install devDependencies if you want to build from source (see Building from source)
```

To just run NVIDIABot (don't forget the basic configuration), simply run `node .`. You may want to run this bot in the background, so yo may consider tools like `screen` or `supervisorctl`.

## Building from source
NVIDIABot is built using TypeScript, which needs to be compiled to plain JavaScript first. To compile, just run `npx tsc`. The output will then be located inside the `build` directory.  
For further optimization, you can run also `npm run build`, which compiles the TypeScript code and runs it through `webpack`. You can then find the final output inside `dist`.

*Please note that contributions to the bot source itself (excluding localizations) will only be accepted if your pull request does not modify `dist/nvidia-bot.js`.*

## Configuration
To begin, rename or copy `sample.env` to `.env`. By default, NVIDIABot is configured to just check the German NVIDIA Store every 60 seconds for availability of any RTX 3000 Series GPU. Here's a list of available configuration options:

| Key | Default | Description | Values |
| --- | --- | --- | --- |
| `LOCALES` | `"de-de"` | Comma-separated list that defines the regions to check for Founders Edition GPUs. The first locale also controls the Discord message language if available.<br>NOTE: not all regions may sell Founders Edition GPUs via shop.nvidia.com and external retailers. | See `sample.env` for available options. |
| `GPU_LIST` | `"RTX 3090,RTX 3080 Ti,RTX 3080,RTX 3070 Ti,RTX 3070,RTX 3060 Ti,RTX 3060"` | Comma-separated list of products whose availability is to be checked. | See `sample.env` for available options. |
| `DISCORD_TOKEN` | `""` | Sets the Discord Bot Token.<br>**THIS IS A REQUIRED SETTING!** | `String` |
| `DISCORD_CHANNEL_NAME` | `""` | Sets the channel name for the bot to post messages in. Every server this bot is added to must have a channel with this name.<br>**THIS IS A REQUIRED SETTING!** | `String` |
| `DISCORD_GUILDS` | `""` | Limits the bot to posting only on selected servers, if the bot has been added to these servers at all. Useful for debugging.<br>*Disabled by default* | Any Discord Guild ID, separated by commas |
| `CHECK_INTERVAL` | `60` | Default check interval | >= 0 |
| `CHECK_INTERVAL_REDUCED` | `300` | Reduced focus check interval | >= 0 |
| `CHECK_INTERVAL_FOCUS` | `45` | Increased focus check interval | >= 0 |
| `CHECK_INTERVAL_ACTIVE` | `20` | Active sale check interval | >= 0 |
| `CHECK_DAYS` | `""` | Sets the days at which to check with regular interval. If none, the bot will check every day.<br>*Disabled by default* | 0=Sunday<br>1=Monday<br>2=Tuesday<br>3=Wednesday<br>4=Thursday<br>5=Friday<br>6=Saturday |
| `FOCUS_DAYS` | `""` | Sets the days with increased focus (increased check frequency).<br>*Disabled by default* | Same as above |
| `REDUCED_FOCUS_DAYS` | `""` | Sets the days with reduced focus (decreased check frequency).<br>*Disabled by default* | Same as above |
| `CHECK_HOURS` | `""` | Sets the hours at which to check for availability with regular check interval. If none, the bot will always check for availability.<br>*Disabled by default* | Any timespan (eg. `5-9`) or multiple timespans (eg. `5-9,12-14,18-23`) |
| `CHECK_HOURS_FOCUS` | `""` | Sets the hours at which to check with increased frequency on a "focus day". If outside a timespan, the bot will check for availability with regular frequency instead.<br>*Disabled by default* | Same as above |
| `CHECK_HOURS_REDUCED` | `""` | Sets the hours at which to check with decreased frequency on a "reduced focus day". If outside a timespan, the bot will not check for availability at all.<br>*Disabled by default* | Same as above |

### CLI Options
You can also set various options when running NVIDIABot through a command line interface (CLI).  
**NOTE:** Not every environment variable has been implemented as a CLI option yet.

| Option | `.env` equivalent |
| --- | --- |
| `--locales` | `LOCALES` |
| `--gpus` | `GPU_LIST`|
| `--token` | `DISCORD_TOKEN` |
| `--channel-name` | `DISCORD_CHANNEL_NAME` |
| `--guilds` | `DISCORD_GUILDS` |

## Credits
* NVIDIA: Building awesome GPUs and generating high demand, which is the reason bots like this exist at all
* @ElegyD: For creating [nvidia-notifier](https://github.com/ElegyD/nvidia-notifier), the inspiration for this bot