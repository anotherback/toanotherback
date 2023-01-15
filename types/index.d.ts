import Toanotherback from "./lib/toanotherback";
import Request from "./lib/request";
import Dictionary from "./lib/dictionary";

export default Toanotherback

export {
    Toanotherback as taob,
    Request as req,
    Dictionary as dico,
}

export declare const get: typeof Request.get;
export declare const head: typeof Request.head;
export declare const post: typeof Request.post;
export declare const put: typeof Request.put;
export declare const options: typeof Request.options;
export declare const patch: typeof Request.patch;

export declare const useDico: typeof Dictionary.use;
export declare const tr: typeof Dictionary.translate;