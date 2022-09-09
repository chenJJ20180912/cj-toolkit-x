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
}
declare const _default: ObjectUtils;
export default _default;
