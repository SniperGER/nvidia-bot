import axios from 'axios';
import { sprintf } from 'sprintf-js';

import EdgeInventory from './EdgeInventory';
import { default as Logger, LogLevel } from './Logger';
import asyncForEach from './helpers/asyncForEach';

const selectedGPUs = process.env["GPU_LIST"].split(/,|;/);
const feInventoryUrl = "https://api.store.nvidia.com/partner/v1/feinventory?skus=%s~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=%s"

let regionMap: {[key: string]: string} = {
	"en-gb": "UK"
}

export enum FEAvailability {
	CHECK_AVAILABILITY = 29,
	OUT_OF_STOCK = 80
}

export default class FEInventory {
	private static isActive: boolean = false
	private static checkInterval: any

	private static inventoryCache: { [key: string]: any[] } = {};
	public static get InventoryCache() {
		return this.inventoryCache;
	}

	public static SKUMap: { [key: string]: string } = {};
	public static CurrentInventory: { [key: string]: any } = {};

	public static async CheckInventory() {
		let enabledLocales = process.env["LOCALES"].split(/,|;/);

		for (const locale of enabledLocales) {
			let region = regionMap[locale] ?? locale.split("-")[1].toUpperCase();

			for (const product of this.inventoryCache[region]) {
				let is_active = product["is_active"] === "true";
				let fe_sku = product["fe_sku"];
				let product_url = new URL(product["product_url"]);

				let edgeProduct = EdgeInventory.ProductCache[locale].find(_ => _["productUPC"] === fe_sku);
				if (!edgeProduct) continue;

				if (!edgeProduct.retailers.length) {
					Logger.Log("FEInventory", `(${region}) ${edgeProduct.productTitle} does not have any retailers.`, LogLevel.ERROR);
					continue;
				}

				for (const retailer of edgeProduct.retailers) {
					let retailerName = new URL(retailer.retailerName);

					if (!this.CurrentInventory[region][retailerName.hostname]) {
						this.CurrentInventory[region][retailerName.hostname] = {}
					}

					if (is_active && retailer.isAvailable && retailer.type !== FEAvailability.OUT_OF_STOCK) {
						console.log(retailer.productTitle, retailer.retailerName, retailer.type);
						Logger.Log("FEInventory", `(${region}) ${retailer.productTitle} available at ${product_url}`);

						if (this.CurrentInventory[region][retailerName.hostname][fe_sku] && this.CurrentInventory[region][retailerName.hostname][fe_sku] !== retailer.type) {
							discordClient.SendEmbeddedMessage(
								`:flag_${region.toLowerCase()}: ${retailer.productTitle}`,
								sprintf(Localization.PRODUCT_AVAILABLE, product_url),
								{
									color: 0x00D166,
									image: {
										url: edgeProduct.imageURL
									},
									footer: {
										text: retailerName
									}
								}
							);
						}
					} else {
						Logger.Log("FEInventory", `(${region}) ${retailer.productTitle} out of stock at ${retailerName}`);

						if (this.CurrentInventory[region][retailerName.hostname][fe_sku] && this.CurrentInventory[region][retailerName.hostname][fe_sku] !== FEAvailability.OUT_OF_STOCK) {
							discordClient.SendEmbeddedMessage(
								`:flag_${region.toLowerCase()}: ${retailer.productTitle}`,
								Localization.PRODUCT_NOT_AVAILABLE,
								{
									color: 0xFD0061,
									footer: {
										text: retailerName
									}
								}
							);
						}
					}

					this.CurrentInventory[region][retailerName.hostname][fe_sku] = retailer.type;
				}
			}
		}

		this.ScheduleNextCheck();
	}

	public static async FetchInventory() {
		let enabledLocales = process.env["LOCALES"].split(/,|;/);

		await asyncForEach(enabledLocales, async (locale: string) => {
			let region = regionMap[locale] ?? locale.split("-")[1].toUpperCase();

			Logger.Log("FEInventory", `Fetching product availability for region "${region}"...`);
			try {
				let response = await axios.get(sprintf(feInventoryUrl, region, region));

				if (!response.data || response.data === "failed") {
					if (Object.keys(this.inventoryCache[region]).length) {
						Logger.Log("FEInventory", "Fetching inventory data failed. No cached data available.");
					} else {
						Logger.Log("FEInventory", "Fetching inventory data failed. No cached data available.");
					}
				}

				let json = response.data;
				var listMap = json["listMap"];

				if (!listMap.length) {
					Logger.Log("FEInventory", `Region ${region} does not sell Founders Edition GPUs via NVIDIA.`);
				}

				this.inventoryCache[region] = listMap;

				if (!this.CurrentInventory[region]) {
					this.CurrentInventory[region] = {};
				}
			} catch (error) {
				console.error(error);
			}
		});

		this.CheckInventory();
	}

	private static ScheduleNextCheck() {
		const { CHECK_INTERVAL, CHECK_INTERVAL_REDUCED, CHECK_INTERVAL_FOCUS, CHECK_INTERVAL_ACTIVE } = process.env;
		const { CHECK_DAYS, FOCUS_DAYS, REDUCED_FOCUS_DAYS } = process.env;
		const { CHECK_HOURS, CHECK_HOURS_FOCUS, CHECK_HOURS_REDUCED } = process.env;

		let checkInterval = Math.max(1, Number(CHECK_INTERVAL) || 60),
			checkIntervalReduced = Math.max(1, Number(CHECK_INTERVAL_REDUCED) || 300),
			checkIntervalFocus = Math.max(1, Number(CHECK_INTERVAL_FOCUS) || 45),
			checkIntervalActive = Math.max(1, Number(CHECK_INTERVAL_ACTIVE) || 20);

		let checkDays = CHECK_DAYS?.split(/,|;/).map(_ => parseInt(_)),
			focusDays = FOCUS_DAYS?.split(/,|;/).map(_ => parseInt(_)),
			reducedFocusDays = REDUCED_FOCUS_DAYS?.split(/,|;/).map(_ => parseInt(_));

		let checkHours = CHECK_HOURS?.split(/,|;/).map(timespan => timespan.split("-").map(_ => parseInt(_))),
			checkHoursFocus = CHECK_HOURS_FOCUS?.split(/,|;/).map(timespan => timespan.split("-").map(_ => parseInt(_))),
			checkHoursReduced = CHECK_HOURS_REDUCED?.split(/,|;/).map(timespan => timespan.split("-").map(_ => parseInt(_)));

		clearTimeout(this.checkInterval);
		this.isActive = Object.values(this.CurrentInventory).find(region => Object.values(region).find(retailer => Object.values(retailer).find(product => product !== 80))) !== undefined;

		let timeout: number = (() => {
			let date = new Date(), day = date.getDay(), hour = date.getHours();

			if (this.isActive) {
				Logger.Log("FEInventory", "Schedule next check for: \x1b[3mActive sale\x1b[0m");
				return checkIntervalActive;
			}

			// TODO: Check future focus type

			if (focusDays && focusDays.includes(day)) {
				if (checkHoursFocus) {
					if (this.IsWithinTimespan(hour, checkHoursFocus)) {
						Logger.Log("FEInventory", "Schedule next check for: \x1b[3mFocus Day – Scheduled Hours\x1b[0m");
						return checkIntervalFocus;
					}

					Logger.Log("FEInventory", "Schedule next check for: \x1b[3mFocus Day – Regular Hours\x1b[0m");
					return checkInterval;
				}

				Logger.Log("FEInventory", "Schedule next check for: \x1b[3mFocus Day\x1b[0m");
				return checkIntervalFocus;
			} else if (reducedFocusDays && reducedFocusDays.includes(day)) {
				if (checkHoursReduced) {
					if (this.IsWithinTimespan(hour, checkHoursReduced)) {
						Logger.Log("FEInventory", "Schedule next check for: \x1b[3mReduced Focus Day – Scheduled Hours\x1b[0m");
						return checkIntervalReduced;
					}

					Logger.Log("FEInventory", "Schedule next check for: \x1b[3mReduced Focus Day – Quiet Hours\x1b[0m");
					return Infinity;
				}

				Logger.Log("FEInventory", "Schedule next check for: \x1b[3mReduced Focus Day\x1b[0m");
				return checkIntervalReduced;
			}

			if ((checkDays && checkDays.includes(day)) || !checkDays) {
				if (checkHours) {
					if (this.IsWithinTimespan(hour, checkHours)) {
						Logger.Log("FEInventory", "Schedule next check for: \x1b[3mScheduled Hours\x1b[0m");
						return checkInterval;
					}

					Logger.Log("FEInventory", "Schedule next check for: \x1b[3mQuiet Hours\x1b[0m");
					return Infinity;
				}

				Logger.Log("FEInventory", "Schedule next check for: \x1b[3mDefault Interval\x1b[0m");
				return checkInterval;
			}
		})();

		if (!isNaN(timeout) && isFinite(timeout)) {
			Logger.Log("FEInventory", `Waiting ${timeout} seconds for next check.`);
			this.checkInterval = setTimeout(() => {
				this.CheckInventory();
			}, timeout * 1000);
		}
	}

	private static IsWithinTimespan(hour: number, timespans: any[]): boolean {
		for (const timespan of timespans) {
			if (hour >= timespan[0] || hour < timespan[1]) return true;
		}
		return false
	}
}