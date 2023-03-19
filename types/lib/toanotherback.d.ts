import Request, { objDataResponse, objRequest, objResponse } from "./request";

type objInit = {
	host?: string;
	prefix?: string;
	https?: boolean;
	parameters?: RequestInit;

	requestInterceptor?: (request: objRequest) => objRequest;
	responseInterceptor?: (response: objResponse) => objResponse;
	hookError?: (error: Error) => void;
}

export default class Toanotherback{
	constructor(objInit: objInit);

	host: string;
    prefix: string;
    https: boolean;
    parameters: RequestInit;

	setRequestInterceptor(fnc: (request: objRequest) => objRequest): void;
	setResponseInterceptor(fnc: (response: objResponse) => objResponse): void;
	setHookError(fnc: (error: Error) => void): void;
	setHookStatus(code: number, fnc: (data: objResponse) => void): void;
	setHookInfo(info: string, fnc: (info: string, status: boolean) => void): void;

	send(path: string, parameters: RequestInit): Request;
	get(path: string, parameters: RequestInit): Request;
	head(path: string, parameters: RequestInit): Request;
	options(path: string, parameters: RequestInit): Request;
	delete(path: string, parameters: RequestInit): Request;
	post(path: string, body: object | string | FormData, parameters: RequestInit): Request;
	put(path: string, body: object | string | FormData, parameters: RequestInit): Request;
	patch(path: string, body: object | string | FormData, parameters: RequestInit): Request;
}