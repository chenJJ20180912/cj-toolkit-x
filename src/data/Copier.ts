import Asserts from "../utils/Asserts";
import objectUtils from "../utils/ObjectUtils";
import {DataCopier} from "../typings";

export class GeneralDataCopier implements DataCopier{
    /**
     * 深拷贝
     * @param val
     */
    deepClone<T>(val: T): T {
        Asserts.isNull(val,"数据不可为空!")
        return objectUtils.deepClone(val)
    }

    /**
     * 浅拷贝
     * @param val
     */
    simpleClone<T>(val: T): T {
        Asserts.isNull(val,"数据不可为空!")
        return JSON.parse(JSON.stringify(val))
    }
}
