import Asserts from "../utils/Asserts";
import objectUtils, {ObjectUtils} from "../utils/ObjectUtils";
import {AppPluginLife, DataCopier} from "../typings";
import {AppStore} from "../manager";

export class GeneralDataCopier implements DataCopier, AppPluginLife {

    private _objectUtils: ObjectUtils = objectUtils;

    /**
     * 深拷贝
     * @param val
     */
    deepClone<T>(val: T): T {
        Asserts.isNull(val, "数据不可为空!");
        return this._objectUtils.deepClone(val);
    }

    /**
     * 浅拷贝
     * @param val
     */
    simpleClone<T>(val: T): T {
        Asserts.isNull(val, "数据不可为空!");
        return Object.assign({}, val);
    }

    install(app: AppStore): void {
    }

    ready(app: AppStore): void {
        this._objectUtils = app.getPlugin("objectUtils") as ObjectUtils;
    }

    remove(app: AppStore): void {
    }
}
