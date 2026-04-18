import { IGetAllInstancesUseCase } from "../../../../application/usecases/instances/IGetAllInstancesUseCase.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class GetAllInstancesController implements IController {
    constructor(
        private getAllInstancesUseCase: IGetAllInstancesUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const instances = await this.getAllInstancesUseCase.execute();
            return new HttpResponse(200, instances);
        } catch {
            return this.httpError.bad_request();
        }
    }
}
