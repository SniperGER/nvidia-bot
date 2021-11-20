const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
	entry: {
		index: './build/index.js'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/',
		filename: 'nvidia-bot.js',
		// library: 'test',
		libraryTarget: 'commonjs-module',
	},
	target: 'node',
	node: {
		__dirname: false,
		__filename: false,
	},
	externals: [
		nodeExternals()
	],
	module: {
		// rules: [
		// 	{
		// 		// Transpiles ES6-8 into ES5
		// 		test: /\.js$/,
		// 		exclude: /node_modules/,
		// 		use: {
		// 			loader: "babel-loader",
		// 			options: {
		// 				presets: [
		// 					"@babel/preset-env"
		// 				],
		// 				plugins: [
		// 					"@babel/plugin-proposal-class-properties"
		// 				]
		// 			}
		// 		}
		// 	}
		// ]
	}
}