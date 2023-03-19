import Request from "./request.js";
import pathCorrector from "./pathCorrector.js";

export default class Toanotherback{
	constructor(obj = {}){
		if(obj.host !== undefined) this.host = obj.host;
		if(obj.prefix !== undefined) this.prefix = obj.prefix;
		if(obj.https !== undefined) this.https = obj.https;
		if(obj.parameters !== undefined) this.parameters = obj.parameters;
		
		this.Requester = class extends Request{
			static hookStatus = {};
			static hookInfo = {};
		};
	
		this.#setHerf();
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
		this.#prefix = pathCorrector(arg);
		this.#setHerf();
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

	parameters = {};

	Requester = {};

	#setHerf(){
		Object.defineProperty(
			this.Requester,
			"href",
			{
				value: this.#protocol + "://" + this.host + this.prefix,
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
	setHookStatus(status, fnc){
		this.Requester.hookStatus[status] = fnc;
	}
	setHookInfo(info, fnc){
		this.Requester.hookInfo[info] = fnc;
	}

	send(path, parameters = {}){
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
		});
	}

	get(path, parameters = {}){
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			method: "GET",
		});
	}

	head(path, parameters = {}){
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			method: "HEAD"
		});
	}

	options(path, parameters = {}){
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			method: "OPTIONS",
		});
	}

	delete(path, parameters = {}){
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			method: "DELETE",
		});
	}

	post(path, body = {}, parameters = {}){
		let result = this.autoContentType(body);
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			headers: {
				...this.parameters.headers || {},
				["Content-Type"]: result["Content-Type"],
				...parameters.headers || {}
			},
			method: "POST",
			body: result.body
		});
	}

	put(path, body = {}, parameters = {}){
		let result = this.autoContentType(body);
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			headers: {
				...this.parameters.headers || {},
				["Content-Type"]: result["Content-Type"],
				...parameters.headers || {}
			},
			method: "PUT",
			body: result.body
		});
	}

	patch(path, body = {}, parameters = {}){
		let result = this.autoContentType(body);
		return new this.Requester(path, {
			...this.parameters,
			...parameters,
			headers: {
				...this.parameters.headers || {},
				["Content-Type"]: result["Content-Type"],
				...parameters.headers || {}
			},
			method: "PATCH",
			body: result.body
		});
	}

	autoContentType(body){
		if(body instanceof FormData){
			return {
				["Content-Type"]: "multipart/form-data",
				body: body
			};
		}
		else if(body instanceof Object){
			return {
				["Content-Type"]: "application/json; charset=utf-8",
				body: JSON.stringify(body)
			};
		}
		else if(body instanceof Object){
			return {
				["Content-Type"]: "text/html; charset=utf-8",
				body: body
			};
		}
		else {
			return {
				body: body
			};
		}
	}
}
