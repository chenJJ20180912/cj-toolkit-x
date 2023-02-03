import { DataCopier } from "../typings";
export declare class GeneralDataCopier implements DataCopier {
    private objectUtils;
    /**
     * 深拷贝
     * @param val
     */
    deepClone<T>(val: T): T;
    /**
     * 浅拷贝
     * @param val
     */
    simpleClone<T>(val: T): T;
}
