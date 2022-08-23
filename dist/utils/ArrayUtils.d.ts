export declare interface KeyBuilder {
    buildKey(item: any, keys?: Array<string> | string): string;
}
export declare interface ValueBuilder {
    buildValue(item: any): any;
}
export declare class GeneralKeyBuilder implements KeyBuilder {
    splitter: string;
    buildKey(item: any, keys: Array<string> | string): string;
}
export declare class ArrayUtils {
    /**
     * 收集数组内部的值
     * @param arr 原本的数组
     * @param childKey 当前层级在上级的字段
     * @param fun(item) 处理当前层级的元素
     * @param deep 深度 往里面探索几个层级
     * @returns *[] 收集到的值
     */
    collectInnerVal(arr: any[] | undefined, childKey: string[] | undefined, fun: ValueBuilder, deep?: number): any[];
    /**
     * 将一个数组转换成为一棵树
     * @param data  源数据数组
     * @param idKey  对象的唯一主键
     * @param parentKey 父节点的主键
     * @param childKey 子数据在父对象中的属性名
     * @param defaultParentIdId 为数据上parentId为空的数据设置默认的parentId
     */
    arrayToTree(data?: any[], idKey?: string, parentKey?: string, childKey?: string, defaultParentIdId?: string): any[];
    /**
     * 对数组进行去重
     * @param data 源数据
     * @param key 属性
     * @param keyBuilder 唯一键的构建器
     */
    distinctArray(data?: any[], key?: string, keyBuilder?: KeyBuilder): string[];
    /**
     * 通过keys 获取Labels
     * @param data 数据集合
     * @param keys 关键字
     * @param labelKey 显示的label属性名
     * @param valueKey 值的属性名
     * @returns {*[]|*[]|[]}
     */
    getNamesByKeys(data?: any[], keys?: Array<string> | string, labelKey?: string, valueKey?: string): string | string[];
    /**
     * 将数组转换成为对象
     * @param data 数据
     * @param keyBuilder 键构建器
     * @param valueBuilder 值构建器
     * @returns {{}}
     */
    toMap(data: any[] | undefined, keyBuilder: KeyBuilder | string, valueBuilder: ValueBuilder | string): {
        [key: string]: any;
    };
}
declare const _default: ArrayUtils;
export default _default;
