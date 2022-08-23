import { AppPluginLife, DataCopier } from "../typings";
import { AppStore } from "../manager";
export declare class GeneralDataCopier implements DataCopier, AppPluginLife {
    private _objectUtils;
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
    install(app: AppStore): void;
    ready(app: AppStore): void;
    remove(app: AppStore): void;
}
