export default class Dictionary{
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
