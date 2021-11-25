(()=>{"use strict";var e={233:function(e,t,o){var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return r(t,e),t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(o(358)),l=a(o(17)),c=o(349),d=i(o(394));t.default=class{constructor(){const{DISCORD_TOKEN:e,DISCORD_CHANNEL_NAME:t}=process.env;e||(d.default.Log("DiscordClient","Missing Discord bot token",d.LogLevel.ERROR),process.exit(1)),t||(d.default.Log("DiscordClient","Missing Discord channel name",d.LogLevel.ERROR),process.exit(1)),this.token=e,this.channelName=t,this.client=new c.Client({intents:[c.Intents.FLAGS.GUILDS,c.Intents.FLAGS.GUILD_MESSAGES]})}get User(){return this.client?.user}Login(e){this.client&&(this.client.on("ready",(async()=>{d.default.Log("DiscordClient",`Signed in as ${this.client.user.tag}!`),this.SetRandomActivity(),setInterval(this.SetRandomActivity,72e5),"function"==typeof e&&e()})),d.default.Log("DiscordClient","Signing in to Discord..."),this.client.login(this.token))}SendEmbeddedMessage(e,t,o={}){if(!this.client)return;let n=(new Date).toLocaleString(process.env.LANG.split(".")[0].replace(/_/g,"-").toLowerCase());this.client.guilds.cache.each((r=>{let i=process.env.DISCORD_GUILDS.split(/,|;/);if(!i.length||""===i[0]||i.includes(r.id))try{const i=r.channels.cache.find((e=>e.name===process.env.DISCORD_CHANNEL_NAME));i?i.send({embeds:[new c.MessageEmbed({title:e,description:t,...o,footer:{text:o?.footer?.text?`${o?.footer?.text} • ${n}`:n}})]}):d.default.Log("DiscordClient",`The server "${r.name}" has no channel named "${this.channelName}".`,d.LogLevel.ERROR)}catch(e){d.default.Log("DiscordClient",`Failed to send message to "${r.name}". Error: ${e}`,d.LogLevel.ERROR)}}))}SendMessage(e){this.client&&this.client.guilds.cache.each((t=>{let o=process.env.DISCORD_GUILDS.split(/,|;/);if(!o.length||""===o[0]||o.includes(t.id))try{const o=t.channels.cache.find((e=>e.name===process.env.DISCORD_CHANNEL_NAME));o?o.send(e):d.default.Log("DiscordClient",`The server "${t.name}" has no channel named "${this.channelName}".`,d.LogLevel.ERROR)}catch(e){d.default.Log("DiscordClient",`Failed to send message to "${t.name}". Error: ${e}`,d.LogLevel.ERROR)}}))}SetRandomActivity(){let e=JSON.parse(s.default.readFileSync(l.default.join(process.cwd(),"activities.json")).toString()),t=e[Math.floor(Math.random()*e.length)];d.default.Log("DiscordClient",`Setting activity to [3m${t.options.type}[0m "${t.text}".`),this.client.user.setActivity(t.text,t.options)}}},505:function(e,t,o){var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return r(t,e),t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(o(167)),l=o(788),c=i(o(394)),d=a(o(356)),u=process.env.GPU_LIST.split(/,|;/);let f={"cs-cz":"CZK","da-dk":"EUR","de-at":"EUR","de-ch":"CHF","de-de":"EUR","en-au":"AUD","en-ca":"CAD","en-eu":"EUR","en-gb":"GBP","en-il":"EUR","en-in":"INR","en-me":"","en-sg":"SGD","en-us":"USD","es-es":"EUR","es-la":"","fi-fi":"EUR","fr-be":"EUR","fr-fr":"EUR","it-it":"EUR","jp-jp":"JPY","ko-kr":"KRW","nb-no":"NOK","nl-nl":"EUR","pl-pl":"PLN","pt-br":"BRL","ro-ro":"RON","ru-ru":"RUB","sv-se":"SEK","tr-tr":"TRN","zh-cn":"CNY","zh-tw":"TWD"};class h{static get ProductCache(){return this.productCache}static CheckProducts(e,t){let o=t.split("-")[1].toUpperCase();for(const n of e){let e=n.gpu,r=n.productAvailable,i=n.productSKU,a=n.productTitle;if(this.CurrentAvailability[o]||(this.CurrentAvailability[o]={}),this.CurrentAvailability[o][i]){let e=this.CurrentAvailability[o][i];e.productAvailable!=r&&c.default.Log("EdgeInventory",`(${o}) ${a}: Availability changed (${e.productAvailable} → ${r})`);let s=Object.keys(e.retailers),d=n.retailers.map((e=>e.retailerName));s.filter((e=>!d.includes(e))).forEach((e=>{c.default.Log("EdgeInventory",`(${o}) ${a}: Retailer removed – ${e}`),discordClient.SendEmbeddedMessage(`:flag_${o.toLowerCase()}: ${a}`,(0,l.sprintf)(Localization.RETAILER_REMOVED,e),{color:16302848})})),d.filter((e=>!s.includes(e))).forEach((e=>{c.default.Log("EdgeInventory",`(${o}) ${a}: Retailer added – ${e}`),discordClient.SendEmbeddedMessage(`:flag_${o.toLowerCase()}: ${a}`,(0,l.sprintf)(Localization.RETAILER_ADDED,e),{color:16302848})}));for(const e of n.retailers){let n=e.retailerName,r=this.CurrentAvailability[o][i].retailers[n];if(r){if(Math.abs(r.salePrice-parseFloat(e.salePrice))>.001){let i=new Intl.NumberFormat(t,{style:"currency",currency:f[t]}).format(r.salePrice),s=new Intl.NumberFormat(t,{style:"currency",currency:f[t]}).format(e.salePrice);c.default.Log("EdgeInventory",`(${o}) ${a}: ${n} changed price (${i} → ${s})`),discordClient.SendEmbeddedMessage(`:flag_${o.toLowerCase()}: ${a}`,(0,l.sprintf)(Localization.RETAILER_PRICE_CHANGE,n,i,s),{color:16302848})}r.stock!=e.stock&&(c.default.Log("EdgeInventory",`(${o}) ${a}: ${n} changed stock (${r.stock} → ${e.stock})`),discordClient.SendEmbeddedMessage(`:flag_${o.toLowerCase()}: ${a}`,(0,l.sprintf)(Localization.RETAILER_STOCK_CHANGE,n,r.stock,e.stock),{color:16302848})),r.directPurchaseLink!=e.directPurchaseLink&&(c.default.Log("EdgeInventory",`(${o}) ${a}: ${a}: ${n} changed direct purchase link (${r.directPurchaseLink} → ${e.directPurchaseLink})`),discordClient.SendEmbeddedMessage(`:flag_${o.toLowerCase()}: ${a}`,(0,l.sprintf)(Localization.RETAILER_URL_CHANGE,n,r.directPurchaseLink,e.directPurchaseLink),{color:16302848}))}}}else this.CurrentAvailability[o][i]={gpu:e,productAvailable:r,productSKU:i,productTitle:a,retailers:{}};for(const e of n.retailers){let t=e.retailerName;this.CurrentAvailability[o][i].retailers[t]={directPurchaseLink:e.directPurchaseLink,salePrice:parseFloat(e.salePrice),stock:e.stock}}break}}static async FetchProducts(){let e=process.env.LOCALES.split(/,|;/);await(0,d.default)(e,(async e=>{c.default.Log("EdgeInventory",`Fetching available products for locale "${e}"...`);try{let t=await s.default.get((0,l.sprintf)("https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=%s&category=GPU&gpu=%s&manufacturer=NVIDIA",e,u));t.data&&"failed"!==t.data||(Object.keys(this.productCache[e]).length?c.default.Log("EdgeInventory","Fetching product data failed. Using cached data instead.",c.LogLevel.WARN):c.default.Log("EdgeInventory","Fetching product data failed. No cached data available.",c.LogLevel.ERROR));let o=t.data.searchedProducts;if(!o)return;let n=o.featuredProduct,r=o.productDetails,i=[];i.push(n);for(const e of r)i.push(e);i.sort(((e,t)=>t.displayName.toLowerCase().localeCompare(e.displayName.toLowerCase()))),c.default.Log("EdgeInventory",`Fetched ${i.length} products for locale "${e}".`),this.productCache[e]=i,this.CheckProducts(i,e)}catch(e){c.default.Log("EdgeInventory",e,c.LogLevel.ERROR),console.error(e)}}))}}t.default=h,h.productCache={},h.CurrentAvailability={}},847:function(e,t,o){var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return r(t,e),t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.FEAvailability=void 0;const s=a(o(167)),l=o(788),c=a(o(505)),d=i(o(394)),u=a(o(356));process.env.GPU_LIST.split(/,|;/);let f={"en-gb":"UK"};var h;(h=t.FEAvailability||(t.FEAvailability={}))[h.CHECK_AVAILABILITY=29]="CHECK_AVAILABILITY",h[h.OUT_OF_STOCK=80]="OUT_OF_STOCK";class p{static get InventoryCache(){return this.inventoryCache}static async CheckInventory(){let e=process.env.LOCALES.split(/,|;/);for(const t of e){let e=f[t]??t.split("-")[1].toUpperCase();for(const o of this.inventoryCache[e]){let n="true"===o.is_active,r=o.fe_sku,i=new URL(o.product_url),a=c.default.ProductCache[t].find((e=>e.productUPC===r));if(a)if(a.retailers.length)for(const t of a.retailers){let o=new URL(t.retailerName);this.CurrentInventory[e][o.hostname]||(this.CurrentInventory[e][o.hostname]={}),n?(console.log(t.productTitle,t.retailerName,t.type),d.default.Log("FEInventory",`(${e}) ${t.productTitle} available at ${i}`),this.CurrentInventory[e][o.hostname][r]||discordClient.SendEmbeddedMessage(`:flag_${e.toLowerCase()}: ${t.productTitle}`,(0,l.sprintf)(Localization.PRODUCT_AVAILABLE,i),{color:53606,image:{url:a.imageURL},footer:{text:o}})):(d.default.Log("FEInventory",`(${e}) ${t.productTitle} out of stock at ${o}`),this.CurrentInventory[e][o.hostname][r]&&discordClient.SendEmbeddedMessage(`:flag_${e.toLowerCase()}: ${t.productTitle}`,Localization.PRODUCT_NOT_AVAILABLE,{color:16580705,footer:{text:o}})),this.CurrentInventory[e][o.hostname][r]=n}else d.default.Log("FEInventory",`(${e}) ${a.productTitle} does not have any retailers.`,d.LogLevel.ERROR)}}this.ScheduleNextCheck()}static async FetchInventory(){let e=process.env.LOCALES.split(/,|;/);await(0,u.default)(e,(async e=>{let t=f[e]??e.split("-")[1].toUpperCase();d.default.Log("FEInventory",`Fetching product availability for region "${t}"...`);try{let e=await s.default.get((0,l.sprintf)("https://api.store.nvidia.com/partner/v1/feinventory?skus=%s~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=%s",t,t));e.data&&"failed"!==e.data||(Object.keys(this.inventoryCache[t]).length,d.default.Log("FEInventory","Fetching inventory data failed. No cached data available."));var o=e.data.listMap;o.length||d.default.Log("FEInventory",`Region ${t} does not sell Founders Edition GPUs via NVIDIA.`),this.inventoryCache[t]=o,this.CurrentInventory[t]||(this.CurrentInventory[t]={})}catch(e){console.error(e)}})),this.CheckInventory()}static ScheduleNextCheck(){const{CHECK_INTERVAL:e,CHECK_INTERVAL_REDUCED:t,CHECK_INTERVAL_FOCUS:o,CHECK_INTERVAL_ACTIVE:n}=process.env,{CHECK_DAYS:r,FOCUS_DAYS:i,REDUCED_FOCUS_DAYS:a}=process.env,{CHECK_HOURS:s,CHECK_HOURS_FOCUS:l,CHECK_HOURS_REDUCED:c}=process.env;let u=Math.max(1,Number(e)||60),f=Math.max(1,Number(t)||300),h=Math.max(1,Number(o)||45),p=Math.max(1,Number(n)||20),v=r?.split(/,|;/).map((e=>parseInt(e))),g=i?.split(/,|;/).map((e=>parseInt(e))),L=a?.split(/,|;/).map((e=>parseInt(e))),m=s?.split(/,|;/).map((e=>e.split("-").map((e=>parseInt(e))))),C=l?.split(/,|;/).map((e=>e.split("-").map((e=>parseInt(e))))),E=c?.split(/,|;/).map((e=>e.split("-").map((e=>parseInt(e)))));clearTimeout(this.checkInterval),this.isActive=void 0!==Object.values(this.CurrentInventory).find((e=>Object.values(e).find((e=>Object.values(e).find((e=>80!==e))))));let y=(()=>{let e=new Date,t=e.getDay(),o=e.getHours();return this.isActive?(d.default.Log("FEInventory","Schedule next check for: [3mActive sale[0m"),p):g&&g.includes(t)?C?this.IsWithinTimespan(o,C)?(d.default.Log("FEInventory","Schedule next check for: [3mFocus Day – Scheduled Hours[0m"),h):(d.default.Log("FEInventory","Schedule next check for: [3mFocus Day – Regular Hours[0m"),u):(d.default.Log("FEInventory","Schedule next check for: [3mFocus Day[0m"),h):L&&L.includes(t)?E?this.IsWithinTimespan(o,E)?(d.default.Log("FEInventory","Schedule next check for: [3mReduced Focus Day – Scheduled Hours[0m"),f):(d.default.Log("FEInventory","Schedule next check for: [3mReduced Focus Day – Quiet Hours[0m"),1/0):(d.default.Log("FEInventory","Schedule next check for: [3mReduced Focus Day[0m"),f):v&&v.includes(t)||!v?m?this.IsWithinTimespan(o,m)?(d.default.Log("FEInventory","Schedule next check for: [3mScheduled Hours[0m"),u):(d.default.Log("FEInventory","Schedule next check for: [3mQuiet Hours[0m"),1/0):(d.default.Log("FEInventory","Schedule next check for: [3mDefault Interval[0m"),u):void 0})();!isNaN(y)&&isFinite(y)&&(d.default.Log("FEInventory",`Waiting ${y} seconds for next check.`),this.checkInterval=setTimeout((()=>{this.CheckInventory()}),1e3*y))}static IsWithinTimespan(e,t){for(const o of t)if(e>=o[0]||e<o[1])return!0;return!1}}t.default=p,p.isActive=!1,p.inventoryCache={},p.SKUMap={},p.CurrentInventory={}},394:(e,t)=>{var o;Object.defineProperty(t,"__esModule",{value:!0}),t.LogLevel=void 0,function(e){e[e.DEBUG=0]="DEBUG",e[e.INFO=1]="INFO",e[e.WARN=2]="WARN",e[e.ERROR=3]="ERROR",e[e.FATAL=4]="FATAL",e[e.HTTP=5]="HTTP"}(o=t.LogLevel||(t.LogLevel={})),t.default=class{static Log(e,t,r=o.INFO){console.log(`${n[r]} [${(new Date).toISOString()}] [[1m${e}[0m] ${t}`)}};const n={[o.DEBUG]:"[36m[DEBUG][0m",[o.INFO]:"[34m[INFO][0m",[o.WARN]:"[33m[WARN][0m",[o.ERROR]:"[31m[ERROR][0m",[o.FATAL]:"[41m[FATAL][0m",[o.HTTP]:"[32m[HTTP][0m"}},147:function(e,t,o){var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&n(t,e,o);return r(t,e),t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(o(167)),l=a(o(358)),c=a(o(17)),d=a(o(521)),u=a(o(912)),f=a(o(505)),h=a(o(847)),p=a(o(233)),v=i(o(394));0==process.env.GPU_LIST.split(/,|;/).length&&(v.default.Log("EdgeInventory","No GPUs selected. At least one GPU needs to be selected.",v.LogLevel.ERROR),process.exit(1)),t.default=class{async Run(e){process.env={...process.env,LOCALES:e.locales??process.env.LOCALES,GPU_LIST:e.gpus??process.env.GPU_LIST,DISCORD_TOKEN:e.token??process.env.DISCORD_TOKEN,DISCORD_CHANNEL_NAME:e["channel-name"]??process.env.DISCORD_CHANNEL_NAME,DISCORD_GUILDS:e.guilds??process.env.DISCORD_GUILDS};let t=process.env.LOCALES.split(/,|;/)[0].split("-")[0].toLowerCase();l.default.existsSync(c.default.join(process.cwd(),"locale",`${t}.json`))?global.Localization=JSON.parse(l.default.readFileSync(c.default.join(process.cwd(),"locale",`${t}.json`)).toString()):global.Localization=JSON.parse(l.default.readFileSync(c.default.join(process.cwd(),"locale","en.json")).toString()),v.default.Log("NVIDIABot","Checking for available updates...");let o=JSON.parse(l.default.readFileSync(c.default.join(process.cwd(),"package.json")).toString()),n=await s.default.get("https://raw.githubusercontent.com/SniperGER/nvidia-bot/master/package.json").then((e=>e.data)).catch((e=>{v.default.Log("NVIDIABot",`Failed to check for updates: ${e.message}`,v.LogLevel.ERROR)}));o&&n&&(u.default.gt(n.version,o.version)?(v.default.Log("NVIDIABot",`A new version of ${o.name} is available! (Installed: ${o.version}, Current: ${n.version})`,v.LogLevel.WARN),v.default.Log("NVIDIABot",`Please visit ${o.homepage} for instructions on how to update.`,v.LogLevel.WARN)):v.default.Log("NVIDIABot","✅ You're up to date!")),this.discordClient=new p.default,global.discordClient=this.discordClient,this.discordClient&&(this.discordClient.Login((async()=>{await f.default.FetchProducts(),await h.default.FetchInventory()})),d.default.createInterface({input:process.stdin,output:process.stdout}).on("SIGINT",(()=>{this.discordClient.User&&this.discordClient.User.setStatus("invisible"),v.default.Log("NVIDIABot","Goodbye!"),process.exit(0)})))}}},356:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=async(e,t)=>{for(let o=0;o<e.length;o++)await t(e[o],o)}},880:function(e,t,o){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),o(294)(o(142).config({path:o(17).join(process.cwd(),".env")}));const r=n(o(167)),i=n(o(147));r.default.defaults.headers.common.Accept="application/json, text/plain, */*",r.default.defaults.headers.common["Accept-Encoding"]="gzip, deflate, br",r.default.defaults.headers.common["Cache-Control"]="no-cache",r.default.defaults.headers.common.Pragma="no-cache",(new i.default).Run(o(566)(process.argv.slice(2)))},167:e=>{e.exports=require("axios")},349:e=>{e.exports=require("discord.js")},142:e=>{e.exports=require("dotenv")},294:e=>{e.exports=require("dotenv-expand")},566:e=>{e.exports=require("minimist")},912:e=>{e.exports=require("semver")},788:e=>{e.exports=require("sprintf-js")},358:e=>{e.exports=require("fs")},17:e=>{e.exports=require("path")},521:e=>{e.exports=require("readline")}},t={},o=function o(n){var r=t[n];if(void 0!==r)return r.exports;var i=t[n]={exports:{}};return e[n].call(i.exports,i,i.exports,o),i.exports}(880);module.exports=o})();