import Request from "./request.js";
import Dictionary from "./dictionary.js"

export default class Toanotherback{
    static prefix = "";

    static get origin(){
        return this.#protocol + "://" + this.host;
    }

    static host = window.location.host;

    static #protocol = window.location.protocol.slice(0, -1);
    static get https(){
        return this.#protocol === "http" ? false : true
    }
    static set https(arg){
        if(typeof arg !== "boolean")throw new Error("");
        this.#protocol = arg === true ? "https" : "http";
    }

    static #parameters = {
		credentials: "omit",
        headers: {}
	}
    static get parameters(){
        return this.#parameters;
    }
	static get credentials(){
		return this.#parameters.credentials === "omit"? false : true;
	}
	static set credentials(arg){
        if(typeof arg !== "boolean")throw new Error("");
		this.#parameters.credentials = arg === true? "include" : "omit";
	}
    static get headers(){
		return this.#parameters.headers;
	}
	static set headers(arg){
		if(typeof arg !== "object")throw new Error("");
		this.#parameters.headers = arg;
	}

    static get Request(){
        return Request;
    }

    static get Dictionary(){
        return Dictionary;
    }
}