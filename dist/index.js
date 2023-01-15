import Toanotherback from "./lib/toanotherback.js";
import Request from "./lib/request.js";
import Dictionary from "./lib/dictionary.js";
export default Toanotherback

export {
    Toanotherback as taob,
    Request as req,
    Dictionary as dico,
}

export const get = (...args) => Request.get(...args);
export const head = (...args) => Request.head(...args);
export const post = (...args) => Request.post(...args);
export const put = (...args) => Request.put(...args);
export const options = (...args) => Request.options(...args);
export const patch = (...args) => Request.patch(...args);

export const useDico = (...args) => Dictionary.use(...args);
export const tr = (...args) => Dictionary.translate(...args);
