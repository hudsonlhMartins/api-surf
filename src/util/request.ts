import axios, {AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, AxiosError} from "axios";

axios.defaults.adapter = 'http'

export interface RequestConfig extends  AxiosRequestConfig{
  headers: AxiosRequestHeaders | any
}
export interface Response<T=any> extends AxiosResponse<T>{}

export class Request{
    constructor(private request = axios){}

    public get<T>(url:string, config: RequestConfig ): Promise<Response<T>>{
        return this.request.get<T, Response<T>>(url, config)
    }

    public static isRequestError(error:AxiosError):boolean{
        return !!(error.response && error.request.status)
    }
} 