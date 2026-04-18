import { ContentfulStatusCode } from "hono/utils/http-status"

export interface IHttpResponse {

    statusCode: ContentfulStatusCode

    body: Record<string, string>
}