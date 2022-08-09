import { DataContract } from "../typings";
export declare class UnsetDataContract implements DataContract {
    encode(data: string): string;
    decode(data: string): string;
}
