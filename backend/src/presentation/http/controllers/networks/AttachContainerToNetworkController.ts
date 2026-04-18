import { IAttachContainerToNetworkUseCase } from "../../../../application/usecases/networks/IAttachContainerToNetworkUseCase.js";
import { HttpRequestId } from "../../../hono/schemas/httpSchema.js";
import { AttachContainerInput } from "../../../hono/schemas/network.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class AttachContainerToNetworkController implements IController {
    constructor(
        private attachContainerUseCase: IAttachContainerToNetworkUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as HttpRequestId;
            const body = httpRequest.body as AttachContainerInput;
            const network = await this.attachContainerUseCase.execute(path.id, body.instanceId);
            return new HttpResponse(200, network);
        } catch {
            return this.httpError.bad_request();
        }
    }
}
