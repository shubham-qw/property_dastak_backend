import { IsNumber } from "class-validator";

export class SavePropertiesDto {
    userId: number;
    propertyId: number;
}

export class SavePropertiesBodyDto {
    @IsNumber()
    propertyId: number;
}