type aobResponse = {
    status: "catch" | "s" | "e" | "r";
    info?: string;
    response: Response;
    data: object;
    url: string;
};

export default class Request{
    constructor(path: string, params: RequestInit);

    s(fnc: (rep: object) => void): this;

    e(fnc: (rep: object) => void): this;

    r(fnc: (path: string) => false | void): this;

    info(fnc: (rep: string) => void): this;

    then(fnc: (rep: aobResponse) => void): this;
    
    catch(fnc: (rep: aobResponse) => void): this;

    static onError(fnc: (rep: aobResponse, retry: () => Promise<void>, setRep: (response: aobResponse) => void) => void): void;

    static onRedirect(fnc: (path: string) => void): void;

    static addHook(info: string, fnc: (rep: aobResponse, retry: () => Promise<void>, setRep: (response: aobResponse) => void) => void): void;

    static removeHook(info: string, fnc: () => void): void;

    static send(path: string, params: RequestInit): Request;

    static get(path: string, params: RequestInit): Request;

    static head(path: string, params: RequestInit): Request;

    static post(path: string, body: object, params: RequestInit): Request;

    static put(path: string, body: object, params: RequestInit): Request;

    static options(path: string, params: RequestInit): Request;

    static patch(path: string, body: object, params: RequestInit): Request;
}