//#region Imports
const axios = require("axios"),
	  dotenv = require("dotenv"),
	  dotenvExpand = require("dotenv-expand"),
	  path = require("path"),
	  readline = require("readline").createInterface({
		  input: process.stdin,
		  output: process.stdout
	  }),
	  activities = require("./activities.json"),
	  { Client, Intents, MessageEmbed } = require("discord.js");
//#endregion

//#region Environment Configuration
dotenvExpand(dotenv.config({ path: path.join(process.cwd(), ".env") }));
//#endregion

//#region Part Alert Setup
const checkInterval = Math.max(1, Number(process.env.CHECK_INTERVAL) || 60) * 1000
const edgeLocale = process.env.EDGE_LOCALE || "de-de";
const feInventoryLocale = process.env.FEINV_LOCALE || "DE";

const gpuList = {
	"RTX 3090": parseInt(process.env.CHECK_RTX_3090) === 1,
	"RTX 3080 Ti": parseInt(process.env.CHECK_RTX_3080_Ti) === 1,
	"RTX 3080": parseInt(process.env.CHECK_RTX_3080) === 1,
	"RTX 3070 Ti": parseInt(process.env.CHECK_RTX_3070_Ti) === 1,
	"RTX 3070": parseInt(process.env.CHECK_RTX_3070) === 1,
	"RTX 3060 Ti": parseInt(process.env.CHECK_RTX_3060_Ti) === 1,
	"RTX 3060": parseInt(process.env.CHECK_RTX_3060) === 1,
}

const selectedGPUs = Object.keys(gpuList).filter(key => gpuList[key]).map(key => encodeURI(key)).join();
if (selectedGPUs.length == 0) {
	console.warn("[WARN] No GPUs selected. At least one GPU needs to be selected.");
	return;
}

const edgeUrl = `https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=${edgeLocale}&category=GPU&gpu=${selectedGPUs}&manufacturer=NVIDIA`
const feInventoryUrl = `https://api.store.nvidia.com/partner/v1/feinventory?skus=${feInventoryLocale}~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=${feInventoryLocale}`

const options = {
	headers: {
		"Accept": "application/json, text/plain, */*",
		"Accept-Encoding": "gzip, deflate, br",
		"Cache-Control": "no-cache",
		"Pragma": "no-cache"
	}
};

let edgeCache = [],
	feInventoryCache = [];


/**
 * Availability types:
 *
 * 29: "Check Availability"
 * 76: "Buy Now"
 * 75: "Buy Now"
 * 77: "Customized & Buy"
 * 80: "Out Of Stock"
 */
var currentAvailability = {};

 /**
  * NVGFT090 = RTX 3090
  * NVGFT080T = RTX 3080 Ti
  * NVGFT080 = RTX 3080
  * NVGFT070T = RTX 3070 Ti
  * NVGFT070 = RTX 3070
  * NVGFT060T = RTX 3060 Ti
  */
var currentFEInventory = {};
//#endregion

//#region Part Alert Functions
const checkFEInventory = () => {
	fetchFEInventory(inventory => {
		let currentTime = (new Date()).toLocaleString();

		let wasActive = Object.keys(currentFEInventory).reduce((value, key) => {
			value[key] = currentFEInventory[key] ?? 7;
			return value
		}, {});

		let isActive = Object.keys(currentFEInventory).reduce((value, key) => {
			value[key] = false;
			return value
		}, {});

		let skuMap = Object.keys(currentAvailability).reduce((value, key) => {
			value[key + `_${feInventoryLocale}`] = key;
			return value;
		}, {});

		for (const product of inventory) {
			let is_active = product["is_active"] === "true";
			let fe_sku = product["fe_sku"];
			let product_url = product["product_url"];

			let availability = currentAvailability[skuMap[fe_sku]];
			if (availability && gpuList[availability.gpu]) {
				if (is_active) {
					isActive[availability.productSKU] = true;
					console.log(`[${currentTime}] - [FEInventory] ${availability.productTitle} available at ${product_url}`);

					if (!wasActive[availability.productSKU]) {
						// sendDiscordMessage(`${availability.productTitle} ist jetzt unter ${product_url} verfügbar!`);
						sendDiscordEmbedMessage(availability.productTitle, `Artikel ist jetzt verfügbar!\n${product_url}`, 0x00D166);
					}
				} else {
					console.log(`[${currentTime}] - [FEInventory] ${availability.productTitle} out of stock`);

					if (wasActive[availability.productSKU]) {
						// sendDiscordMessage(`${availability.productTitle} ist jetzt ausverkauft!`);
						sendDiscordEmbedMessage(availability.productTitle, `Artikel ist nicht länger verfügbar.`, 0xFD0061);
					}
				}
			}
		}

		currentFEInventory = isActive;
	});
}

const fetchEdgeProducts = (callback) => {
	axios.get(edgeUrl, options).then(response => {
		if (!response.data || response.data === "failed") {
			console.log("fetch failed, using cached data");
			if (typeof callback === "function") callback(edgeCache);
			return;
		}

		let json = response.data;

		var searchedProducts = json["searchedProducts"];
		if (!searchedProducts) return;
		var featuredProduct = searchedProducts["featuredProduct"];
		var productDetails = searchedProducts["productDetails"];

		var products = [];
		products.push(featuredProduct);
		for (const product of productDetails) {
			products.push(product);
		}

		edgeCache = products;
		if (typeof callback === "function") callback(products);
	}).catch(error => {
		console.log("[ERROR] Error while getting product data: " + error.message)
		console.log(error)
	})
}

const fetchFEInventory = (callback) => {
	axios.get(feInventoryUrl, options).then(response => {
		if (!response.data || response.data === "failed") {
			console.log("fetch failed, using cached data");
			if (typeof callback === "function") callback(feInventoryCache);
			return;
		}

		let json = response.data;
		var listMap = json["listMap"];

		feInventoryCache = listMap;
		if (typeof callback === "function") callback(listMap);
	}).catch(error => {
		console.log("[ERROR] Error while getting FE inventory: " + error.message)
		console.log(error)
	})
}

async function sendDiscordMessage(message) {
	client.guilds.cache.each(guild => {
		try {
			const channel = guild.channels.cache.find(channel => channel.name === process.env["DISCORD_CHANNEL_NAME"]);
			if (channel) {
				channel.send(message);
			} else {
				console.log(`The server "${guild.name}" has no channel named "${DISCORD_CHANNEL_NAME}".`);
			}
		} catch (err) {
			console.log(`Failed to send message to "${guild.name}". Error: ${err}`);
		}
	});
}

async function sendDiscordEmbedMessage(title, description, color) {
	client.guilds.cache.each(guild => {
		try {
			const channel = guild.channels.cache.find(channel => channel.name === process.env["DISCORD_CHANNEL_NAME"]);
			if (channel) {
				channel.send({
					embeds: [
						new MessageEmbed({
							title,
							description,
							color
						})
					]
				});
			} else {
				console.log(`The server "${guild.name}" has no channel named "${DISCORD_CHANNEL_NAME}".`);
			}
		} catch (err) {
			console.log(`Failed to send message to "${guild.name}". Error: ${err}`);
		}
	});
}

const setupFinished = () => {
	let callback = (products) => {
		let currentTime = (new Date()).toLocaleString();

		for (const productDetails of products) {
			let gpu = productDetails["gpu"];
			let productAvailable = productDetails["productAvailable"];
			let productSKU = productDetails["productSKU"];
			let productTitle = productDetails["productTitle"];

			if (currentAvailability[productSKU]) {
				let product = currentAvailability[productSKU]

				if (product.productAvailable != productAvailable) {
					console.log(`[${currentTime}] ${productTitle}: Availability changed (${product.productAvailable} → ${productAvailable})`);
				}

				let previousRetailers = Object.keys(product.retailers);
				let currentRetailers = productDetails["retailers"].map(_ => _["retailerName"]);

				previousRetailers.filter(_ => !currentRetailers.includes(_)).forEach(retailer => {
					console.log(`[${currentTime}] ${productTitle}: Retailer removed – ${retailer}`);
					sendDiscordEmbedMessage(productTitle, `Ein Händler wurde entfernt.\n${retailer}`, 0xF8C300);
				});

				currentRetailers.filter(_ => !previousRetailers.includes(_)).forEach(retailer => {
					console.log(`[${currentTime}] ${productTitle}: Retailer added – ${retailer}`);
					sendDiscordEmbedMessage(productTitle, `Ein Händler wurde hinzugefügt.\n${retailer}`, 0xF8C300);
				});

				for (const retailer of productDetails["retailers"]) {
					let retailerName = retailer["retailerName"];
					let previousRetailerData = currentAvailability[productSKU].retailers[retailerName];

					if (previousRetailerData) {
						if (Math.abs(previousRetailerData.salePrice - parseFloat(retailer.salePrice)) > 0.001) {
							console.log(`[${currentTime}] ${productTitle}: ${retailerName} changed price (${previousRetailerData.salePrice} → ${parseFloat(retailer.salePrice)})`);
							sendDiscordEmbedMessage(productTitle, `${retailerName} hat den Preis verändert.\n${previousRetailerData.salePrice} → ${parseFloat(retailer.salePrice)}`, 0xF8C300);
						}

						if (previousRetailerData.stock != retailer.stock) {
							console.log(`[${currentTime}] ${productTitle}: ${retailerName} changed stock (${previousRetailerData.stock} → ${retailer.stock})`);
							sendDiscordEmbedMessage(productTitle, `${retailerName} hat die verfügbare Menge verändert.\n${previousRetailerData.stock} → ${parseFloat(retailer.stock)}`, 0xF8C300);
						}

						if (previousRetailerData.directPurchaseLink != retailer.directPurchaseLink) {
							console.log(`[${currentTime}] ${productTitle}: ${retailerName} changed direct purchase link (${previousRetailerData.directPurchaseLink} → ${retailer.directPurchaseLink})`);
							sendDiscordEmbedMessage(productTitle, `${retailerName} hat die URL zum Direktkauf verändert.\n${previousRetailerData.directPurchaseLink} → ${parseFloat(retailer.directPurchaseLink)}`, 0xF8C300);
						}
					}
				}
			} else {
				currentAvailability[productSKU] = {
					gpu: gpu,
					productAvailable: productAvailable,
					productSKU: productSKU,
					productTitle: productTitle,
					retailers: {}
				}
			}

			for (const retailer of productDetails["retailers"]) {
				let retailerName = retailer["retailerName"];

				currentAvailability[productSKU].retailers[retailerName] = {
					directPurchaseLink: retailer["directPurchaseLink"],
					salePrice: parseFloat(retailer["salePrice"]),
					stock: retailer["stock"],
					type: retailer["type"]
				};
			}
		}

		checkFEInventory();
	};

	fetchEdgeProducts(callback)
	setInterval(() => {
		fetchEdgeProducts(callback)
	}, checkInterval);
}
//#endregion

//#region Bot Setup
let client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);

	let setActivity = () => {
		let activity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(activity.text, activity.options);
	}

	setActivity();
	setInterval(setActivity, 1000 * 60 * 60 * 2);

	setupFinished();
});

client.login(process.env["DISCORD_TOKEN"]);

readline.on("SIGINT", function() {
	if (client.user) client.user.setStatus("invisible");
	console.log("Stopping (received SIGINT)");
	process.exit(0);
});
//#endregion