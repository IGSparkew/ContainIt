import { Context } from "hono";
import { IHttpResponse } from "../http/helpers/IHttpResponse.js";
import { IController } from "../http/controllers/IController.js";
import { IHttpRequest } from "../http/helpers/IHttpRequest.js";
import { HttpRequest } from "../http/helpers/impl/HttpRequest.js";

export async function honoAdapters(c: Context, apiRoute: IController) : Promise<IHttpResponse> {
    let body: unknown = {};

    try {
        body = c.req.valid('json' as never)
    } catch {
        try {
            body = await c.req.json();
        } catch {
            body = {}
        }
    }

    const httpRequest: IHttpRequest = new HttpRequest({
        header: Object.fromEntries(c.req.raw.headers.entries()),
        body,
        path: c.req.param(),
        query: c.req.query()
    });

    return await apiRoute.handle(httpRequest);
}