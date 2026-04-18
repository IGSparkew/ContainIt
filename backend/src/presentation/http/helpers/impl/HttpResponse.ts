import { ContentfulStatusCode } from "hono/utils/http-status";
import { IHttpResponse } from "../IHttpResponse.js";

export class HttpResponse implements IHttpResponse {
    statusCode: ContentfulStatusCode;
    body: Record<string, string>;

    constructor(statusCode: ContentfulStatusCode, body: any) {
        this.statusCode = statusCode;
        this.body = body;
    }
}