import { IHttpErrors } from "../IHttpError.js";
import { HttpResponse } from "./HttpResponse.js";


export class HttpErrors implements IHttpErrors {

    bad_request(): HttpResponse {
        return new HttpResponse(400, {'error': "Bad request"});
    }
    
    not_found(): HttpResponse {
        return new HttpResponse(404, {'error': "Not Found"});
    }

    internal_error(): HttpResponse {
        return new HttpResponse(500, {'error': "Internal Server Error"});
    }
}