const path = require('path');
const webpack = require('webpack');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(__dirname, './client/entry.js');
const BUILD_PATH = path.resolve(__dirname, './build');

module.exports = {
	entry: [
		APP_PATH
	],
	output: {
		path: BUILD_PATH,
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['babel-loader?presets[]=es2015,presets[]=react']
			},
			{
				test: /\.css$/,
				loaders: [ 'style-loader', 'css-loader' ]
			}
		]
	}
}