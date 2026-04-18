import { IDeleteInstanceUseCase } from "../../../../application/usecases/instances/IDeleteInstanceUseCase.js";
import { HttpRequestId } from "../../../hono/schemas/httpSchema.js";
import { DeleteInstanceInput } from "../../../hono/schemas/Instance.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class DeleteInstanceController implements IController {
    constructor(
        private deleteInstanceUseCase: IDeleteInstanceUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as HttpRequestId;
            const body = httpRequest.body as DeleteInstanceInput;
            await this.deleteInstanceUseCase.execute(path.id, body.keepVolume);
            return this.httpSuccess.sucess_response();
        } catch {
            return this.httpError.not_found();
        }
    }
}
