import { IGetNetworkByIdUseCase } from "../../../../application/usecases/networks/IGetNetworkByIdUseCase.js";
import { HttpRequestId } from "../../../hono/schemas/httpSchema.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class GetNetworkByIdController implements IController {
    constructor(
        private getNetworkByIdUseCase: IGetNetworkByIdUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as HttpRequestId;
            const network = this.getNetworkByIdUseCase.execute(path.id);
            return new HttpResponse(200, network);
        } catch(err) {
            console.error(err);
            return this.httpError.not_found();
        }
    }
}
