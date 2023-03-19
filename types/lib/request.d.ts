export type objDataResponse = {
	i?: string;
	d?: any; 
}

export type objRequest = {
	path: string;
	parameters: RequestInit;
}

export type objResponse = {
	response?: Response;
	data?: objDataResponse;
	error?: Error;
}

export default class Request{
    constructor(path: string, params: RequestInit);

    s(fnc: (data: objDataResponse["d"]) => void): this;

    sd(): Promise<objDataResponse["d"]>;

    e(fnc: (data: objDataResponse["d"]) => void): this;

    ed(): Promise<objDataResponse["d"]>;

    info(fnc: (info: string, status: boolean) => void): this;

	status(code: number, fnc: (data: objResponse) => void): this;

	statusData(code: number): Promise<objResponse>;

    then(fnc: (rep: objResponse) => void): this;
    
    catch(fnc: (rep: objResponse) => void): this;

    result: Promise<objResponse>;
}