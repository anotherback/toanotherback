import Dictionary from "./dictionary.js";
import pathCorrector from "./pathCorrector.js";
import Toanotherback from "./toanotherback.js";

export default class Request{
    constructor(path, params){
        this.result = this.#result(path, params);
    }

    s(fnc){
        this.#s = fnc;
        return this;
    }

    e(fnc){
        this.#e = fnc;
        return this;
    }

    r(fnc){
        this.#r = fnc;
        return this;
    }

    info(fnc){
        this.#info = fnc;
        return this;
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
    #r = () => {};
    #info = () => {};
    #then = () => {};
    #catch = (err) => {throw err};

    async #result(path, params){
        let response = await Request.fetch(path, params);

        if(response.status === "catch"){
			let result;
			await Request.#onError(response, async () => {result = await this.#result(path, params)}, rep => {response = rep});
			if(result !== undefined)return result;
		}
		if(response.info){
			for(const fnc of Request.#hook[response.info] || []){
				let result;
				await fnc(response, async () => {result = await this.#result(path, params)}, rep => {response = rep});
				if(result !== undefined)return result;
			}
		}

        if(response.status === "catch")await this.#catch(response);
		else await this.#then(response);
		if(response.info !== undefined)await this.#info(Dictionary.translate(response.info));
		if(response.status === "successful")await this.#s(response.data);
		else if(response.status === "error")await this.#e(response.data);
		else if(response.status === "redirect" && await this.#r(response.url) !== false)await this.constructor.#onRedirect(response.url);
		return response;
    }

    static async fetch(path, params){
        try{
			const response = await fetch(
				Toanotherback.origin + pathCorrector(Toanotherback.prefix, path),
				params
			);
			
			if(!response.ok)return {status: "catch", response: response};
			else return {...await response.json(), response: response};
		}
		catch(err){
			return {status: "catch", response: err};
		}
    }

    static #onError = () => {};
	static onError(fnc){
		this.#onError = fnc;
	}

	static #onRedirect = (path) => {window.location.href = path;};
	static onRedirect(fnc){
		this.#onRedirect = fnc;
	}

	static #hook = {};
	static addHook(info, fnc){
		this.#hook[info] = [...(this.#hook[info] || []), fnc];
	}
	static removeHook(info, fnc){
		for (let index = 0; index < this.#hook[info].length; index++) {
			if(this.#hook[info][index].toString() === fnc.toString()){
				this.#hook[info].splice(index, 1);
				break;
			}
		}
	}

	static send(path, parameters={}){
		return new this(path, parameters);
	}

	static get(path, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "GET",
		});
	}

	static head(path, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "HEAD"
		});
	}

	static post(path, body={}, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "POST",
			headers: {
				...Toanotherback.parameters.headers,
				...parameters.headers || {},
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}

	static put(path, body={}, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "PUT",
			headers: {
				...Toanotherback.parameters.headers,
				...parameters.headers || {},
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}

	static options(path, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "OPTIONS",
		});
	}

	static patch(path, body={}, parameters={}){
		return new this(path, {
			...Toanotherback.parameters,
			...parameters,
			method: "PATCH",
			headers: {
				...Toanotherback.parameters.headers,
				...parameters.headers || {},
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}
}