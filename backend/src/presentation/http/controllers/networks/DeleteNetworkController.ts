import { IDeleteNetworkUseCase } from "../../../../application/usecases/networks/IDeleteNetworkUseCase.js";
import { HttpRequestId } from "../../../hono/schemas/httpSchema.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class DeleteNetworkController implements IController {
    constructor(
        private deleteNetworkUseCase: IDeleteNetworkUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as HttpRequestId;
            await this.deleteNetworkUseCase.execute(path.id);
            return this.httpSuccess.sucess_response();
        } catch (err) {
            return this.httpError.bad_request();
        }
    }
}
