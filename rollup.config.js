import terser from "@rollup/plugin-terser";
import {defineConfig} from "rollup";

export default defineConfig({
	input: "src/index.js",
	output: [
		{
			format: "es",
			file: "dist/taob.mjs"
		},
		{
			format: "commonjs",
			file: "dist/taob.cjs"
		},
		{
			format: "es",
			file: "dist/taob.min.mjs",
			plugins: [terser()]
		},
		{
			format: "commonjs",
			file: "dist/taob.min.cjs",
			plugins: [terser()]
		},
	]
});
