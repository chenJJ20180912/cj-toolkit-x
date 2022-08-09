export declare class ObjectUtils {
    private readonly typeMapping;
    isObject(val: any): boolean;
    addObjType(obj: any, typeName: string): void;
    getObjType(obj: any): string;
    deepClone(data: any): any;
}
declare const _default: ObjectUtils;
export default _default;
