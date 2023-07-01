import pathCorrector from "./pathCorrector.js";

export default class Request{
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

	status(code, fnc){ 
		this.#status[code] = fnc;
		return this;
	}

	async statusData(code){
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
	#status = {};
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

		let resultResponseInterceptor = this.constructor.responseInterceptor(response, interceptorParams);

		if(resultResponseInterceptor.error !== undefined){
			this.constructor.hookError(resultResponseInterceptor.error);
			try {
				this.#catch(resultResponseInterceptor.error);
			}
			finally {
				this.#finally(resultResponseInterceptor.error);
			}
			return;
		}
		else {
			this.#then(resultResponseInterceptor);
		}

		if(this.constructor.hookStatus[resultResponseInterceptor.response.status] !== undefined){
			this.constructor.hookStatus[resultResponseInterceptor.response.status]
			.forEach(fnc => fnc(resultResponseInterceptor, interceptorParams));
		}
		if(this.#status[resultResponseInterceptor.response.status] !== undefined){
			this.#status[resultResponseInterceptor.response.status](resultResponseInterceptor);
		}

		let info = resultResponseInterceptor.response.headers.get(this.constructor.indexInfo) || undefined;
		if(info !== undefined && this.constructor.hookInfo[info] !== undefined){
			this.constructor.hookInfo[info]
			.forEach(fnc => fnc(resultResponseInterceptor, interceptorParams));
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

			try {
				if(responseContentType.indexOf("application/json") !== -1) var data = await response.json();
				else if(responseContentType.indexOf("text/") !== -1) var data = await response.text();
				else var data = await response.blob();
			}
			catch (e){
				var data = undefined;
			}

			return {response, data};
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
	static hookStatus = {};
	static hookInfo = {};
}
