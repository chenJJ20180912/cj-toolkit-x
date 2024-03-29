import { AppStore, CacheConfig } from "../manager";
import { AppPlugin, AppPluginLife, CacheManager, CacheManagerRegionBuilder, DataContract, StorageProvider, Timer } from "../typings";
/**
 * 缓存管理器的属性工厂
 */
export declare interface CacheManagerPropertyFactory {
    newCacheRegion(cache: AbstractCacheManager, key: string, val?: any): CacheRegion;
    newTimer(_this: AbstractCacheManager): Timer;
}
export declare class GeneralCacheRegionBuilder implements CacheManagerRegionBuilder {
    prefix: string;
    dataContract: DataContract;
    constructor(cacheConfig: CacheConfig);
    buildRegionName(regionName: string): string;
}
/**
 * 抽象的缓存管理器
 */
export declare abstract class AbstractCacheManager implements CacheManager, AppPluginLife {
    readonly storageProvider: StorageProvider;
    readonly _reginData: {
        [key: string]: CacheRegion;
    };
    private _queue;
    /**
     * ttl 定时器
     * @private
     */
    private ttlTimer;
    private ttlEnable;
    private cacheManagerPropertyFactory;
    private dataCopier;
    private dataContract;
    private regionBuilder;
    constructor(storageProvider: StorageProvider, cacheManagerPropertyFactory: CacheManagerPropertyFactory);
    install(app: AppStore): void;
    ready(app: AppStore): void;
    remove(app: AppStore): AppPlugin;
    setTtlEnabled(ttlEnable: boolean): void;
    setTtlInterval(ttlInterval: number): void;
    /**
     * 初始化缓存区域
     * @param reginName 缓存区域
     * @param val 初始值
     * @param ttl 过期时间
     */
    initRegion(reginName: string, val?: any, ttl?: number): void;
    /**
     * 重置缓存区域
     * @param reginName
     */
    resetRegion(reginName: string): void;
    /**
     * 获取缓存区域
     * @param reginName 缓存区域
     * @param defaultVal 默认值
     * @private
     */
    getRegion(reginName: string, defaultVal?: any): CacheRegion;
    /**
     * 构建真正的regionName
     * @param reginName
     */
    buildRegionName(reginName: string): string;
    setValue(reginName: string, key: string, value: any): void;
    getValue(reginName: string, key: string, defaultVal?: any): any;
    setRegionData(reginName: string, val: any, ttl?: number): void;
    getRegionData(reginName: string, defaultVal?: any): any;
    /**
     * 深克隆当前对象
     * @param val
     */
    deepClone(val: any): any;
    encodeData(val: string): string;
    decodeData(val: string): string;
    /**
     * 当前region 发生改变
     * @param reginName
     */
    protected onChange(reginName: string): void;
    /**
     * 立即持久化数据 从缓存对象到存储对象
     */
    sync(regionNames?: Array<string> | string | undefined): void;
    /**
     * 立即刷新缓存 从存储到缓存对象
     */
    refresh(regionNames?: Array<string> | string | undefined): void;
    /**
     * 设置区域的ttl
     * @param reginName
     * @param ttl
     */
    ttl(reginName: string, ttl: number): void;
}
export declare class CacheRegion {
    readonly _cacheManager: AbstractCacheManager;
    /**
     * 区域名称
     */
    readonly _regionName: string;
    /**
     * 缓存失效时间
     */
    ttl: number;
    private _data;
    readonly _simpleKey = "_s";
    /**
     * 当前区域是否为空
     * @private
     */
    private _empty;
    constructor(cache: AbstractCacheManager, key: string, val?: any);
    /**
     * 设置过期时间
     * @param ttl
     */
    setTtl(ttl: number): void;
    /**
     * 当前缓存是否非法
     */
    isInvalid(): boolean;
    /**
     * 直接设置区域的数据
     * @param val
     */
    setRegionData(val: any): void;
    /**
     * 获取区域的数据
     */
    getRegionData(): any;
    /**
     * 设置值
     * @param key
     * @param val
     */
    setValue(key: string, val: any): void;
    /**
     * 获取值
     * @param key
     */
    getValue(key: string): any;
    /**
     * 同步内存与存储对象
     */
    sync(): void;
    /**
     * 从存储对象同步数据到内存
     */
    refresh(): void;
    /**
     * 清除数据
     */
    clearValue(focus?: boolean): void;
    /**
     * 是否是一个简单对象的缓存
     */
    isSimple(): boolean;
}
/**
 * 通过localStorage 进行存储
 */
export declare class LocalStorageCacheManager extends AbstractCacheManager {
    constructor();
}
/**
 * 通过sessionStorage 进行存储数据
 */
export declare class SessionStorageCacheManager extends AbstractCacheManager {
    constructor();
}
/**
 * 通过内存对数据进行存储
 */
export declare class MemoryStorageCacheManager extends AbstractCacheManager {
    constructor();
}
