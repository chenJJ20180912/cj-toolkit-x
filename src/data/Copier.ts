import Asserts from "../utils/Asserts";
import {ObjectUtils} from "../utils/ObjectUtils";
import {DataCopier} from "../typings";
import {AutoWried} from "../annotations";

export class GeneralDataCopier implements DataCopier {

    @AutoWried()
    private objectUtils: ObjectUtils | undefined;

    /**
     * 深拷贝
     * @param val
     */
    deepClone<T>(val: T): T {
        Asserts.isNull(val, "数据不可为空!");
        return this.objectUtils?.deepClone(val);
    }

    /**
     * 浅拷贝
     * @param val
     */
    simpleClone<T>(val: T): T {
        Asserts.isNull(val, "数据不可为空!");
        return Object.assign({}, val);
    }

}
