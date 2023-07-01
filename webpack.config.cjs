const path = require("path");

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.mjs",
	},
	experiments: {
		outputModule: true,
	},
	plugins: [],
	module: {
		
	},
	devServer: {
		hot: true,
		port: 3012,
		host: "0.0.0.0",
		static: {
			directory: path.resolve(__dirname, "test"),
		}
		
	},
	mode: "production"
};
