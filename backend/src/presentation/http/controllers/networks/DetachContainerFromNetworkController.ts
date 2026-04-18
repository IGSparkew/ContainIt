import { IDetachContainerFromNetworkUseCase } from "../../../../application/usecases/networks/IDetachContainerFromNetworkUseCase.js";
import { DetachContainerPath } from "../../../hono/schemas/network.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class DetachContainerFromNetworkController implements IController {
    constructor(
        private detachContainerUseCase: IDetachContainerFromNetworkUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as DetachContainerPath;
            const network = await this.detachContainerUseCase.execute(path.id, path.instanceId);
            return new HttpResponse(200, network);
        } catch {
            return this.httpError.bad_request();
        }
    }
}
