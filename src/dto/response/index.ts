export interface CommonResponseDTO<T> {
    data ?: T;
    message : string;
    statusCode : number;
}