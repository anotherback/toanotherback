export default function pathCorrector(...paths){
	let path = "";

	for(let p of paths){
		p = p || "";
		p = (p.startsWith("/") ? p : "/" + p);
		path += p;
	}

	path = path.split("?");
	let query = path[1];
	path = path[0];

	path = (path.endsWith("/") && path.length > 1 ? path.substring(0, path.length - 1) : path);
	path = path.replace(/\\/g, "/");
	while(path.indexOf("//") > -1)path = path.replace(/\/\//g, "/");
	path = path.replace(/_/g, "");
	path = path.replace(/ /g, "");

	return (path === "/" ? "" : path) + (query !== undefined ? "?" + query : "");
}
