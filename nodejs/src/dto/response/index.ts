export interface CommonResponseDTO<T> {
    data ?: T | null;
    message : string;
    statusCode : number;
}