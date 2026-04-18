import { IGetAllNetworksUseCase } from "../../../../application/usecases/networks/IGetAllNetworksUseCase.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class GetAllNetworksController implements IController {
    constructor(
        private getAllNetworksUseCase: IGetAllNetworksUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const networks = this.getAllNetworksUseCase.execute();
            return new HttpResponse(200, networks);
        } catch {
            return this.httpError.bad_request();
        }
    }
}
