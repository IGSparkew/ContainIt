import { IAttachVolumeUseCase } from "../../../../application/usecases/volumes/IAttachVolumeUseCase.js";
import { AttachContainerDTO } from "../../../../domain/dto/network.dot.js";
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

export class AttachVolumeController implements IController {

    constructor(
    private attachVolumeUseCase : IAttachVolumeUseCase, 
    private httpError: IHttpErrors = new HttpErrors(), 
    private httpSuccess : IHttpSuccess = new HttpSuccess()) {}



    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {

        const body = httpRequest.body as AttachContainerInput
        const path = httpRequest.path as HttpRequestId;

        const dto : AttachContainerDTO = {
            instanceId: body.instanceId
        }

        try {
            const volume = await this.attachVolumeUseCase.execute(path.id, dto);
            return new HttpResponse(200, volume);
        } catch (err) {
            return this.httpError.bad_request();
        }
    }
    
}