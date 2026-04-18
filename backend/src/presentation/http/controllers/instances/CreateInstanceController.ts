import { ICreateInstanceUseCase } from "../../../../application/usecases/instances/ICreateInstanceUseCase.js";
import { CreateInstanceDTO } from "../../../../domain/dto/instance.dto.js";
import { Instance } from "../../../../domain/models/instance.js";
import { CreateInstanceInput } from "../../../hono/schemas/Instance.js";
import { IHttpErrors } from "../../helpers/IHttpError.js";
import { IHttpResponse } from "../../helpers/IHttpResponse.js";
import { HttpErrors } from "../../helpers/impl/HttpError.js";
import { HttpRequest } from "../../helpers/impl/HttpRequest.js";
import { HttpResponse } from "../../helpers/impl/HttpResponse.js";
import { IController } from "../IController.js";

export class CreateInstanceController implements IController {

    private httpError: IHttpErrors;
    
    constructor(private createInstanceUseCase: ICreateInstanceUseCase) {
        this.httpError = new HttpErrors();
    }
    
    async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
        let response: Instance;

        const createInstanceInput = httpRequest.body as CreateInstanceInput;

        const createInstanceDTO: CreateInstanceDTO = {
            name: createInstanceInput.name,
            type: createInstanceInput.type,
            port: createInstanceInput.port,
            version: createInstanceInput.version,
            password: createInstanceInput.password,
            networkId: createInstanceInput.networkId,
            volumeId: createInstanceInput.volumeId
        }

        try {
            response = await this.createInstanceUseCase.execute(createInstanceDTO);
            return new HttpResponse(200, response);
        } catch(err) {
            return this.httpError.bad_request();
        }
    }
    
}