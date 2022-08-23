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
     * @param reginName 缓存区域
     * @param val 初始值
     */
    initRegion(reginName: string, val?: any): void;
    /**
     * 重置缓存区域
     * @param reginName
     */
    resetRegion(reginName: string): void;
    /**
     * 开关过期检测定时器
     * @param ttlEnable
     */
    setTtlEnabled(ttlEnable: boolean): void;
    /**
     * 设置过期检测定时器的检测周期
     * @param ttlInterval
     */
    setTtlInterval(ttlInterval: number): void;
    /**
     * 设置缓存值
     * @param reginName 区域名称
     * @param key 缓存的键名
     * @param value 缓存的值
     */
    setValue(reginName: string, key: string, value: any): void;
    /**
     * 获取缓存的值
     * @param reginName 缓存区域名称
     * @param key 缓存的键名
     * @param defaultVal 找不到的时候赋予的默认值
     */
    getValue(reginName: string, key: string, defaultVal?: any): any;
    /**
     * 设置缓存区域的值
     * @param reginName  缓存区域名称
     * @param val 缓存区域的值
     */
    setRegionData(reginName: string, val: any): void;
    /**
     * 设置缓存区域的值
     * @param reginName  缓存区域名称
     * @param defaultVal 找不到的时候赋予的默认值
     */
    getRegionData(reginName: string, defaultVal?: any): any;
    /**
     * 设置区域的ttl
     * @param reginName     缓存区域名称
     * @param ttl
     */
    ttl(reginName: string, ttl: number): void;
}
