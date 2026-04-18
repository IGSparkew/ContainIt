import { IDeleteOrphanVolumeUseCase } from "../../../../application/usecases/volumes/IDeleteOrphanVolumeUseCase.js";
import { HttpRequestId } from "../../../hono/schemas/httpSchema.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { IHttpSuccess } from "../../helpers/IHttpSuccess.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpSuccess } from "../../helpers/impl/HttpSuccess.js";
import { IController } from "../IController.js";

export class DeleteOrphanVolumeController implements IController {
    private httpError: IHttpErrors;
    private httpSuccess : IHttpSuccess;

    constructor(private deleteOrphanUseCase: IDeleteOrphanVolumeUseCase) {
        this.httpError = new HttpErrors();
        this.httpSuccess = new HttpSuccess();
    }
    
    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        try {
            const path = httpRequest.path as HttpRequestId;
            this.deleteOrphanUseCase.execute(path.id);
            return this.httpSuccess.sucess_response();
        } catch {
            return this.httpError.not_found();
        }
    }
    
}