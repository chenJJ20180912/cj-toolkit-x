export declare class ObjectUtils {
    private readonly typeMapping;
    /**
     * 对象是否为promise
     * @param val
     */
    isPromise(val: any): boolean;
    /**
     * 对象是否为数组
     * @param val
     */
    isArray(val: any): boolean;
    /**
     * 是否为对象
     * @param val
     */
    isObject(val: any): boolean;
    addObjType(obj: any, typeName: string): void;
    getObjType(obj: any): string;
    deepClone(data: any): any;
    /**
     * 判断对象为空
     * @param obj
     */
    isEmpty(obj: any): boolean;
    /**
     * 判断对象为非空
     * @param obj
     */
    isNotEmpty(obj: any): boolean;
}
declare const _default: ObjectUtils;
export default _default;
