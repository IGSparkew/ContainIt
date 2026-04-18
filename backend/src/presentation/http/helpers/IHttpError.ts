import { IHttpResponse } from "./IHttpResponse.js";
import { HttpResponse } from "./impl/HttpResponse.js";

export interface IHttpErrors {
    bad_request() : IHttpResponse

    not_found() : IHttpResponse

    internal_error() : IHttpResponse
}