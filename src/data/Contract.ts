import Asserts from "../utils/Asserts";
import {DataContract} from "../typings";

export class UnsetDataContract implements DataContract{
    encode(data: string): string {
        Asserts.isNull(data, "数据不可为空!")
        return  data
    }

    decode(data: string): string {
        Asserts.isNull(data, "数据不可为空!")
        return data
    }
}


