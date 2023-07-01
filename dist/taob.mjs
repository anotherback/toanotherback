class Dictionary{
	static #dictionarys = {};
	static #use = false;
	static use(name){
		this.#use = name;
	}

	static add(name, dictionary = {}){
		this.#dictionarys[name] = (function pathFinding(obj, path){
			let o = {};

			for(const key in obj){
				if(typeof obj[key] === "string" || Array.isArray(obj[key]))o = {...o, ...{[path + key]: obj[key]}};
				else if(typeof obj[key] === "object")o = {...o, ...pathFinding(obj[key], path + key + ".")};
			}

			return o;
		})(dictionary, "");
	}

	static translate(index){
		if(this.#use === false || !this.#dictionarys[this.#use]?.[index]) return index;
		else {
			let result = this.#dictionarys[this.#use][index];
			while(/{.*?}/g.test(result)){
				result = result.replace(/{(.*?)}/g, (match, value) => {
					return this.translate(value);
				});
			}
			return result;
		}
	}
}

function pathCorrector(...paths){
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

class Request{
	constructor(path, params, interceptorParams){
		if(params.disabledPrefix === true){
			path = pathCorrector(path);
			delete params.disabledPrefix;
		}
		else path = pathCorrector(this.constructor.prefix, path);
		this.result = this.#result(path, params, interceptorParams);

	}

	s(fnc){
		this.#s = fnc;
		return this;
	}

	async sd(){
		let result = await this.result;
		if(result.response?.ok === true) return result.data;
		else throw new Error("Wrong Response");
	}

	e(fnc){
		this.#e = fnc;
		return this;
	}

	async ed(){
		let result = await this.result;
		if(result.response?.ok === false) return result.data;
		else throw new Error("Wrong Response");
	}

	info(fnc){
		this.#info = fnc;
		return this;
	}

	code(code, fnc){ 
		this.#code[code] = fnc;
		return this;
	}

	async cd(code){
		let result = await this.result;
		if(result.response?.status === code) return result;
		else throw new Error("Wrong Response");
	}

	then(fnc){
		this.#then = fnc;
		return this;
	}

	catch(fnc){
		this.#catch = fnc;
		return this;
	}

	finally(fnc){
		this.#finally = fnc;
		return this;
	}

	result;

	#s = () => {};
	#e = () => {};
	#info = () => {};
	#code = {};
	#then = () => {};
	#catch = (err) => {
		throw err;
	};
	#finally = () => {};

	async #result(path, parameters, interceptorParams){
		let resultRequestInterceptor = this.constructor.requestInterceptor({path, parameters}, interceptorParams);

		let response = await Request.fetch(
			this.constructor.href + resultRequestInterceptor.path,
			resultRequestInterceptor.parameters
		);

		let resultResponseInterceptor = this.constructor.responseInterceptor(response, resultRequestInterceptor, interceptorParams);

		if(resultResponseInterceptor.error !== undefined){
			this.constructor.hookError(resultResponseInterceptor.error);
			try {
				this.#catch(resultResponseInterceptor.error);
			}
			finally {
				this.#finally();
			}
			return;
		}
		else {
			this.#then(resultResponseInterceptor);
		}

		if(this.constructor.hookCode[resultResponseInterceptor.response.status] !== undefined){
			this.constructor.hookCode[resultResponseInterceptor.response.status]
			.forEach(fnc => fnc(resultResponseInterceptor, resultRequestInterceptor, interceptorParams));
		}
		if(this.#code[resultResponseInterceptor.response.status] !== undefined){
			this.#code[resultResponseInterceptor.response.status](resultResponseInterceptor);
		}

		let info = resultResponseInterceptor.info || undefined;
		if(info !== undefined && this.constructor.hookInfo[info] !== undefined){
			this.constructor.hookInfo[info]
			.forEach(fnc => fnc(resultResponseInterceptor, resultRequestInterceptor, interceptorParams));
		}
		if(info !== undefined){
			this.#info(info, resultResponseInterceptor.response.ok);
		}

		if(resultResponseInterceptor.response.ok === true){
			this.#s(resultResponseInterceptor.data);
		}
		else if(resultResponseInterceptor.response.ok === false){
			this.#e(resultResponseInterceptor.data);
		}

		this.#finally();
		return resultResponseInterceptor;
	}

	static async fetch(path, params){
		if(params.params !== undefined){
			let paths = path.split("?");
			Object.entries(params.params).forEach(([key, value]) => paths[0] = paths[0].replace(`{${key}}`, value));
			delete params.params;
			path = paths.join("?");
		}
		if(params.query !== undefined){
			let paths = path.split("?");
			let query = [];
			Object.entries(params.query).forEach(([key, value]) => query.push(`${key}=${value}`));
			delete params.query;
			path = paths[0] + "?" + query.join("&") + (paths[1] ? "&" + paths[1] : "");
		}

		try {
			const response = await fetch(path, params);
			const responseContentType = response.headers.get("content-type");
			const info = response.headers.get(this.indexInfo) || undefined;

			try {
				if(responseContentType.indexOf("application/json") !== -1) var data = await response.json();
				else if(responseContentType.indexOf("text/") !== -1) var data = await response.text();
				else var data = await response.blob();
			}
			catch (e){
				var data = undefined;
			}

			return {response, data, info};
		}
		catch (error){
			return {error};
		}
	}

	static prefix = "";
	static indexInfo = "aob-info";
	static href = "";
	static requestInterceptor = request => request;
	static responseInterceptor = response => response;
	static hookError = () => {};
	static hookCode = {};
	static hookInfo = {};
}

class Toanotherback{
	constructor(obj = {}){
		this.Requester = class extends Request{};
	
		if(obj.host !== undefined) this.host = obj.host;
		if(obj.prefix !== undefined) this.prefix = obj.prefix;
		if(obj.https !== undefined) this.https = obj.https;
		if(obj.parameters !== undefined) this.parameters = obj.parameters;
		if(obj.indexInfo !== undefined) this.indexInfo = obj.indexInfo;
		
		if(obj.requestInterceptor !== undefined) this.setRequestInterceptor(obj.requestInterceptor);
		if(obj.responseInterceptor !== undefined) this.setResponseInterceptor(obj.responseInterceptor);
		if(obj.hookError !== undefined) this.setHookError(obj.hookError);
	}

	#host = window.location.host;
	get host(){
		return this.#host;
	}
	set host(arg){
		this.#host = arg;
		this.#setHerf();
	}

	#prefix = "";
	get prefix(){
		return this.#prefix;
	}
	set prefix(arg){
		this.#prefix = arg;
		Object.defineProperty(
			this.Requester,
			"prefix",
			{
				value: this.#prefix,
				configurable: true,
			}
		);
	}

	#protocol = window.location.protocol.slice(0, -1);
	get https(){
		return this.#protocol === "http" ? false : true;
	}
	set https(arg){
		if(typeof arg !== "boolean") throw new Error("");
		this.#protocol = arg === true ? "https" : "http";
		this.#setHerf();
	}

	#indexInfo = "aob-info";
	get indexInfo(){
		return this.#indexInfo;
	}
	set indexInfo(arg){
		this.#indexInfo = arg;
		Object.defineProperty(
			this.Requester,
			"indexInfo",
			{
				value: this.#indexInfo,
				configurable: true,
			}
		);
	}

	parameters = {};

	Requester = {};

	#setIndexInfo(){
		Object.defineProperty(
			this.Requester,
			"indexInfo",
			{
				value: this.#indexInfo,
				configurable: true,
			}
		);
	}
	#setHerf(){
		Object.defineProperty(
			this.Requester,
			"href",
			{
				value: this.#protocol + "://" + this.host,
				configurable: true,
			}
		);
	}
	setRequestInterceptor(fnc){
		Object.defineProperty(
			this.Requester,
			"requestInterceptor",
			{
				value: fnc,
				configurable: true,
			}
		);
	}
	setResponseInterceptor(fnc){
		Object.defineProperty(
			this.Requester,
			"responseInterceptor",
			{
				value: fnc,
				configurable: true,
			}
		);
	}
	setHookError(fnc){
		Object.defineProperty(
			this.Requester,
			"hookError",
			{
				value: fnc,
				configurable: true,
			}
		);
	}
	addHookCode(code, fnc){
		if(this.Requester.hookCode[code] === undefined) this.Requester.hookCode[code] = [];
		this.Requester.hookCode[code].push(fnc);
	}
	addHookInfo(info, fnc){
		if(this.Requester.hookInfo[info] === undefined) this.Requester.hookInfo[info] = [];
		this.Requester.hookInfo[info].push(fnc);
	}
	removeHookCode(code, fnc){
		if(this.Requester.hookCode[code] === undefined) this.Requester.hookCode[code] = [];
		this.Requester.hookCode[code] = this.Requester.hookCode[code].filter(f => f !== fnc);
	}
	removeHookInfo(info, fnc){
		if(this.Requester.hookInfo[info] === undefined) this.Requester.hookInfo[info] = [];
		this.Requester.hookInfo[info] = this.Requester.hookInfo[info].filter(f => f !== fnc);
	}

	send(path, parameters = {}, interceptorParams = {}){
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
			},
			interceptorParams
		);
	}

	get(path, parameters = {}, interceptorParams = {}){
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				method: "GET",
			},
			interceptorParams
		);
	}

	head(path, parameters = {}, interceptorParams = {}){
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				method: "HEAD"
			},
			interceptorParams
		);
	}

	options(path, parameters = {}, interceptorParams = {}){
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				method: "OPTIONS",
			},
			interceptorParams
		);
	}

	delete(path, parameters = {}, interceptorParams = {}){
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				method: "DELETE",
			}, 
			interceptorParams
		);
	}

	post(path, body = {}, parameters = {}, interceptorParams = {}){
		let result = this.autoContentType(body);
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				headers: {
					...this.parameters.headers || {},
					...result.headers,
					...parameters.headers || {}
				},
				method: "POST",
				body: result.body
			},
			interceptorParams
		);
	}

	put(path, body = {}, parameters = {}, interceptorParams = {}){
		let result = this.autoContentType(body);
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				headers: {
					...this.parameters.headers || {},
					...result.headers,
					...parameters.headers || {}
				},
				method: "PUT",
				body: result.body
			},
			interceptorParams
		);
	}

	patch(path, body = {}, parameters = {}, interceptorParams = {}){
		let result = this.autoContentType(body);
		return new this.Requester(
			path, 
			{
				...this.parameters,
				...parameters,
				headers: {
					...this.parameters.headers || {},
					...result.headers,
					...parameters.headers || {}
				},
				method: "PATCH",
				body: result.body
			},
			interceptorParams
		);
	}

	autoContentType(body){
		if(body instanceof FormData){
			return {
				headers: {},
				body: body
			};
		}
		else if(body instanceof Object){
			return {
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify(body)
			};
		}
		else if(typeof body === "string"){
			return {
				headers: {
					"Content-Type": "text/html; charset=utf-8",
				},
				body: body
			};
		}
		else {
			return {
				headers: {},
				body: body
			};
		}
	}
}

window.Toanotherback = Toanotherback;
window.Dictionary = Dictionary;

export { Dictionary, Toanotherback as default };
