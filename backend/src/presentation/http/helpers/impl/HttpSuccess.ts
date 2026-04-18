import { IHttpSuccess } from "../IHttpSuccess.js";
import { HttpResponse } from "./HttpResponse.js";

export class HttpSuccess implements IHttpSuccess {
    sucess_response(): HttpResponse {
        return new HttpResponse(200, {"message": "Ressource created"});
    }

}