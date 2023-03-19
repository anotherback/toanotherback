import pathCorrector from "./pathCorrector.js";

export default class Request{
	constructor(path, params){
		this.result = this.#result(pathCorrector(path), params);
	}

	s(fnc){
		this.#s = fnc;
		return this;
	}

	async sd(){
		let result = await this.result;
		if(result.response?.ok === true) return result.data.d;
		else throw new Error("Wrong Response");
	}

	e(fnc){
		this.#e = fnc;
		return this;
	}

	async ed(){
		let result = await this.result;
		if(result.response?.ok === false) return result.data.d;
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

	result;

	#s = () => {};
	#e = () => {};
	#info = () => {};
	#status = {};
	#then = () => {};
	#catch = (err) => {
		throw err;
	};

	async #result(path, parameters){
		let resultRequestInterceptor = this.constructor.requestInterceptor({path, parameters});

		let response = await Request.fetch(
			this.constructor.href + resultRequestInterceptor.path,
			resultRequestInterceptor.parameters
		);

		let resultResponseInterceptor = this.constructor.responseInterceptor(response);

		if(resultResponseInterceptor.error !== undefined){
			this.constructor.hookError(resultResponseInterceptor.error);
			this.#catch(resultResponseInterceptor.error);
			return;
		}
		else {
			this.#then(resultResponseInterceptor);
		}

		if(this.constructor.hookStatus[resultResponseInterceptor.response.status] !== undefined){
			this.constructor.hookStatus[resultResponseInterceptor.response.status](resultResponseInterceptor);
		}
		if(this.#status[resultResponseInterceptor.response.status] !== undefined){
			this.#status[resultResponseInterceptor.response.status](resultResponseInterceptor);
		}

		if(resultResponseInterceptor.data?.i !== undefined && this.constructor.hookInfo[resultResponseInterceptor.data.i] !== undefined){
			this.constructor.hookInfo[resultResponseInterceptor.data.i](resultResponseInterceptor.data.i, resultResponseInterceptor.response.ok);
		}
		if(resultResponseInterceptor.data?.i !== undefined){
			this.#info(resultResponseInterceptor.data.i, resultResponseInterceptor.response.ok);
		}

		if(resultResponseInterceptor.response.ok === true){
			this.#s(resultResponseInterceptor.data?.d || resultResponseInterceptor.data);
		}
		else if(resultResponseInterceptor.response.ok === false){
			this.#e(resultResponseInterceptor.data?.d || resultResponseInterceptor.data);
		}

		return resultResponseInterceptor;
	}

	static async fetch(path, params){
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

	static href = "";
	static requestInterceptor = request => request;
	static responseInterceptor = response => response;
	static hookError = () => {};
	static hookStatus = {};
	static hookInfo = {};
}
