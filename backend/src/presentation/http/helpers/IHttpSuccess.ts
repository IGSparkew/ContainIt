import { IHttpResponse } from "./IHttpResponse.js";
import { HttpResponse } from "./impl/HttpResponse.js";

export interface IHttpSuccess {

    sucess_response(): IHttpResponse
}