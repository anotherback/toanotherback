import { RequestInitTaob } from "./toanotherback";

export type objRequest = {
	path: string;
	parameters: RequestInit;
}

export type objResponse = {
	response?: Response;
	data?: any;
	error?: Error;
}

export default class Request{
    constructor(path: string, params: RequestInitTaob, interceptorParams: {[key: string]: string});

    s(fnc: (data: any) => void): this;

    sd(): Promise<any>;

    e(fnc: (data: any) => void): this;

    ed(): Promise<any>;

    info(fnc: (info: string, status: boolean) => void): this;

	status(code: number, fnc: (data: objResponse) => void): this;

	statusData(code: number): Promise<objResponse>;

    then(fnc: (rep: objResponse) => void): this;
    
    catch(fnc: (rep: objResponse) => void): this;

	finally(fnc: () => void): this;

    result: Promise<objResponse>;
}