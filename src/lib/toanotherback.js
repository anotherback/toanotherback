import Request from "./request.js";
import pathCorrector from "./pathCorrector.js";

export default class Toanotherback{
	constructor(obj = {}){
		if(obj.host !== undefined) this.host = obj.host;
		if(obj.prefix !== undefined) this.prefix = obj.prefix;
		if(obj.https !== undefined) this.https = obj.https;
		if(obj.parameters !== undefined) this.parameters = obj.parameters;
		if(obj.indexInfo !== undefined) this.indexInfo = obj.indexInfo;
		
		this.Requester = class extends Request{
			static hookStatus = {};
			static hookInfo = {};
		};
	
		this.#setHerf();
		this.#setIndexInfo();
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

	#indexInfo = "aob-info";
	get indexInfo(){
		return this.#indexInfo;
	}
	set indexInfo(arg){
		this.#indexInfo = arg;
		this.#setIndexInfo;
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
	addHookStatus(status, fnc){
		if(this.Requester.hookStatus[status] === undefined) this.Requester.hookStatus[status] = [];
		this.Requester.hookStatus[status].push(fnc);
	}
	addHookInfo(info, fnc){
		if(this.Requester.hookInfo[info] === undefined) this.Requester.hookInfo[info] = [];
		this.Requester.hookInfo[info].push(fnc);
	}
	removeHookStatus(status, fnc){
		if(this.Requester.hookStatus[status] === undefined) this.Requester.hookStatus[status] = [];
		this.Requester.hookStatus[status] = this.Requester.hookStatus[status].filter(f => f !== fnc);
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
