import Axios from 'axios';
import { sprintf } from 'sprintf-js'

import Logger, { LogLevel } from './Logger';
import asyncForEach from './helpers/asyncForEach';

const selectedGPUs = process.env["GPU_LIST"].split(/,|;/);
const edgeUrl = "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=%s&category=GPU&gpu=%s&manufacturer=NVIDIA"

let currencyMap: {[key: string]: string} = {
	"cs-cz": "CZK",
	"da-dk": "EUR",
	"de-at": "EUR",
	"de-ch": "CHF",
	"de-de": "EUR",
	"en-au": "AUD",
	"en-ca": "CAD",
	"en-eu": "EUR",
	"en-gb": "GBP",
	"en-il": "EUR",
	"en-in": "INR",
	"en-me": "",
	"en-sg": "SGD",
	"en-us": "USD",
	"es-es": "EUR",
	"es-la": "",
	"fi-fi": "EUR",
	"fr-be": "EUR",
	"fr-fr": "EUR",
	"it-it": "EUR",
	"jp-jp": "JPY",
	"ko-kr": "KRW",
	"nb-no": "NOK",
	"nl-nl": "EUR",
	"pl-pl": "PLN",
	"pt-br": "BRL",
	"ro-ro": "RON",
	"ru-ru": "RUB",
	"sv-se": "SEK",
	"tr-tr": "TRN",
	"zh-cn": "CNY",
	"zh-tw": "TWD"
}

export default class EdgeInventory {
	private static productCache: {[key: string]: any[]} = {};
	public static get ProductCache() {
		return this.productCache;
	}

	public static CurrentAvailability: {[key: string]: any} = {};

	public static CheckProducts(products: any[], locale: string) {
		let region = locale.split("-")[1].toUpperCase();

		for (const productDetails of products) {
			let gpu = productDetails["gpu"];
			let productAvailable = productDetails["productAvailable"];
			let productSKU = productDetails["productSKU"];
			let productTitle = productDetails["productTitle"];

			if (!this.CurrentAvailability[region]) {
				this.CurrentAvailability[region] = {};
			}

			if (this.CurrentAvailability[region][productSKU]) {
				let product = this.CurrentAvailability[region][productSKU]

				if (product.productAvailable != productAvailable) {
					Logger.Log("EdgeInventory", `(${region}) ${productTitle}: Availability changed (${product.productAvailable} → ${productAvailable})`);
				}

				let previousRetailers: any[] = Object.keys(product.retailers);
				let currentRetailers: any[] = productDetails["retailers"].map((_: any) => _["retailerName"]);

				previousRetailers.filter(_ => !currentRetailers.includes(_)).forEach(retailer => {
					Logger.Log("EdgeInventory", `(${region}) ${productTitle}: Retailer removed – ${retailer}`);
					discordClient.SendEmbeddedMessage(
						`:flag_${region.toLowerCase()}: ${productTitle}`,
						sprintf(Localization.RETAILER_REMOVED, retailer),
						{
							color: 0xF8C300
						}
					);
				});

				currentRetailers.filter(_ => !previousRetailers.includes(_)).forEach(retailer => {
					Logger.Log("EdgeInventory", `(${region}) ${productTitle}: Retailer added – ${retailer}`);
					discordClient.SendEmbeddedMessage(
						`:flag_${region.toLowerCase()}: ${productTitle}`,
						sprintf(Localization.RETAILER_ADDED, retailer),
						{
							color: 0xF8C300
						}
					);
				});

				for (const retailer of productDetails["retailers"]) {
					let retailerName = retailer["retailerName"];
					let previousRetailerData = this.CurrentAvailability[region][productSKU].retailers[retailerName];

					if (previousRetailerData) {
						if (Math.abs(previousRetailerData.salePrice - parseFloat(retailer.salePrice)) > 0.001) {
							let previousSalePrice = new Intl.NumberFormat(locale, { style: "currency", currency: currencyMap[locale] }).format(previousRetailerData.salePrice);
							let salePrice = new Intl.NumberFormat(locale, { style: "currency", currency: currencyMap[locale] }).format(retailer.salePrice);

							Logger.Log("EdgeInventory", `(${region}) ${productTitle}: ${retailerName} changed price (${previousSalePrice} → ${salePrice})`);
							discordClient.SendEmbeddedMessage(
								`:flag_${region.toLowerCase()}: ${productTitle}`,
								sprintf(Localization.RETAILER_PRICE_CHANGE, retailerName, previousSalePrice, salePrice),
								{
									color: 0xF8C300
								}
							);
						}

						if (previousRetailerData.stock != retailer.stock) {
							Logger.Log("EdgeInventory", `(${region}) ${productTitle}: ${retailerName} changed stock (${previousRetailerData.stock} → ${retailer.stock})`);
							discordClient.SendEmbeddedMessage(
								`:flag_${region.toLowerCase()}: ${productTitle}`,
								sprintf(Localization.RETAILER_STOCK_CHANGE, retailerName, previousRetailerData.stock, retailer.stock),
								{
									color: 0xF8C300
								}
							);
						}

						if (previousRetailerData.directPurchaseLink != retailer.directPurchaseLink) {
							Logger.Log("EdgeInventory", `(${region}) ${productTitle}: ${productTitle}: ${retailerName} changed direct purchase link (${previousRetailerData.directPurchaseLink} → ${retailer.directPurchaseLink})`);
							discordClient.SendEmbeddedMessage(
								`:flag_${region.toLowerCase()}: ${productTitle}`,
								sprintf(Localization.RETAILER_URL_CHANGE, retailerName, previousRetailerData.directPurchaseLink, retailer.directPurchaseLink),
								{
									color: 0xF8C300
								}
							);
						}
					}
				}
			} else {
				this.CurrentAvailability[region][productSKU] = {
					gpu: gpu,
					productAvailable: productAvailable,
					productSKU: productSKU,
					productTitle: productTitle,
					retailers: {}
				};
			}

			for (const retailer of productDetails["retailers"]) {
				let retailerName = retailer["retailerName"];

				this.CurrentAvailability[region][productSKU].retailers[retailerName] = {
					directPurchaseLink: retailer["directPurchaseLink"],
					salePrice: parseFloat(retailer["salePrice"]),
					stock: retailer["stock"]
				};
			}

			break
		}
	}

	public static async FetchProducts() {
		let enabledLocales = process.env["LOCALES"].split(/,|;/);

		await asyncForEach(enabledLocales, async (locale: string) => {
			Logger.Log("EdgeInventory", `Fetching available products for locale "${locale}"...`);

			try {
				let response = await Axios.get(sprintf(edgeUrl, locale, selectedGPUs));

				if (!response.data || response.data === "failed") {
					if (Object.keys(this.productCache[locale]).length) {
						Logger.Log("EdgeInventory", "Fetching product data failed. Using cached data instead.", LogLevel.WARN);
					} else {
						Logger.Log("EdgeInventory", "Fetching product data failed. No cached data available.", LogLevel.ERROR);
					}
				}

				let json = response.data;

				let searchedProducts = json["searchedProducts"];
				if (!searchedProducts) return;

				let featuredProduct = searchedProducts["featuredProduct"],
					productDetails = searchedProducts["productDetails"];

				let products = [];
				products.push(featuredProduct);

				for (const product of productDetails) {
					products.push(product);
				}

				products.sort((a, b) => {
					return b.displayName.toLowerCase().localeCompare(a.displayName.toLowerCase());
				});

				Logger.Log("EdgeInventory", `Fetched ${products.length} products for locale "${locale}".`);

				this.productCache[locale] = products;

				this.CheckProducts(products, locale);
			} catch (error: any) {
				Logger.Log("EdgeInventory", error, LogLevel.ERROR);
			}
		});
	}
}