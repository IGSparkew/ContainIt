import { IHttpResponse } from "../helpers/IHttpResponse.js";
import { HttpRequest } from "../helpers/impl/HttpRequest.js";

export interface IController {
  handle(httpRequest: HttpRequest): Promise<IHttpResponse>
}