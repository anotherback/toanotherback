import Request, { objRequest, objResponse } from "./request";

type objInit = {
	host?: string;
	prefix?: string;
	https?: boolean;
	parameters?: RequestInitTaob;
	indexInfo?: string;

	requestInterceptor?: (request: objRequest, interceptorParams: {[key: string]: string}) => objRequest;
	responseInterceptor?: (response: objResponse, interceptorParams: {[key: string]: string}) => objResponse;
	hookError?: (error: Error) => void;
}

export type RequestInitTaob = {
	params: {[key: string]: string};
	query: {[key: string]: string};
	disabledPrefix: boolean;
} & RequestInit;

export default class Toanotherback{
	constructor(objInit: objInit);

	host: string;
    prefix: string;
    https: boolean;
    parameters: RequestInitTaob;
	indexInfo: string;

	setRequestInterceptor(fnc: (request: objRequest, interceptorParams: {[key: string]: string}) => objRequest): void;
	setResponseInterceptor(fnc: (response: objResponse, interceptorParams: {[key: string]: string}) => objResponse): void;
	setHookError(fnc: (error: Error) => void): void;

	addHookStatus(code: number, fnc: (response: objResponse, interceptorParams: {[key: string]: string}) => void): void;
	addHookInfo(info: string, fnc: (response: objResponse, interceptorParams: {[key: string]: string}) => void): void;
	removeHookStatus(code: number, fnc: Function): void;
	removeHookInfo(info: string, fnc: Function): void;

	send(path: string, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	get(path: string, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	head(path: string, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	options(path: string, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	delete(path: string, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	post(path: string, body: object | string | FormData, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	put(path: string, body: object | string | FormData, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
	patch(path: string, body: object | string | FormData, parameters: RequestInitTaob, interceptorParams: {[key: string]: string}): Request;
}