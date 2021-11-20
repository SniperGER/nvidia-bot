require("dotenv-expand")(require("dotenv").config({ path: require("path").join(process.cwd(), ".env") }));



import Axios from 'axios';
import NVIDIABot from './NVIDIABot';

Axios.defaults.headers.common["Accept"] = "application/json, text/plain, */*";
Axios.defaults.headers.common["Accept-Encoding"] = "gzip, deflate, br";
Axios.defaults.headers.common["Cache-Control"] = "no-cache";
Axios.defaults.headers.common["Pragma"] = "no-cache";

new NVIDIABot().Run(require('minimist')(process.argv.slice(2)));