import { AppStore } from "../manager";
export declare interface AppPluginLife {
    /**
     * 安装插件的时候调用
     * @param app
     */
    install(app: AppStore): void;
    /**
     * 上下文初始化完毕之后回调此函数
     * @param app
     */
    ready(app: AppStore): void;
    /**
     * 卸载的时候触发
     * @param app
     */
    remove(app: AppStore): void;
}
export declare type AppPlugin = Object | AppPluginLife;
/**
 * 数据拷贝工具
 */
export declare interface DataCopier {
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
/**
 * 数据编码器 解码器
 */
export declare interface DataContract {
    encode(data: string): string;
    decode(data: string): string;
}
/**
 * 定时器
 */
export declare interface Timer {
    /**
     * 开启定时器
     */
    start(targetFun: Function, that?: any): void;
    /**
     * 关闭定时器
     */
    stop(): void;
    /**
     * 周期
     */
    setInterval(interval: number): void;
    /**
     * 是否启用定时器
     */
    setEnabled(enabled: boolean): void;
}
export declare interface StorageProvider {
    getItem(key: string): string;
    setItem(key: string, value: string): void;
    removeItem(key: string): any;
}
export declare interface CacheManager {
    /**
     * 初始化缓存区域
     * @param region 缓存区域
     * @param val 初始值
     */
    initRegion(region: string, val?: any): void;
    /**
     * 重置缓存区域
     * @param region
     */
    resetRegion(region: string): void;
    setTtlEnabled(ttlEnable: boolean): void;
    setTtlInterval(ttlInterval: number): void;
    setValue(region: string, key: string, value: any): void;
    getValue(region: string, key: string): any;
    setRegionData(region: string, val: any): void;
    getRegionData(region: string): any;
    /**
     * 设置区域的ttl
     * @param reginName
     * @param ttl
     */
    ttl(reginName: string, ttl: number): void;
}
