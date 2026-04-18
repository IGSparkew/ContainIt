import { ICreateNetworkUseCase } from "../../../../application/usecases/networks/ICreateNetworkUseCase.js";
import { CreateNetworkDTO } from "../../../../domain/dto/network.dot.js";
import { CreateNetworkInput } from "../../../hono/schemas/network.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class CreateNetworkController implements IController {
    constructor(
        private createNetworkUseCase: ICreateNetworkUseCase,
        private httpError: IHttpErrors = new HttpErrors(),
        private httpSuccess: IHttpSuccess = new HttpSuccess()
    ) {}

    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const body = httpRequest.body as CreateNetworkInput;
            const dto: CreateNetworkDTO = {
                name: body.name,
                driver: body.driver
            };
            const network = await this.createNetworkUseCase.execute(dto);
            return new HttpResponse(200, network);
        } catch {
            return this.httpError.bad_request();
        }
    }
}
