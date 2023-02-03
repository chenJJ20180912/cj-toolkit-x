import {AppStore, CacheConfig} from "../manager";
import Asserts from "../utils/Asserts";
import {
    AppPlugin,
    AppPluginLife,
    CacheManager,
    CacheManagerRegionBuilder,
    DataContract,
    DataCopier,
    StorageProvider,
    Timer
} from "../typings";
import {GeneralTimer} from "../timer";
import {AutoWried} from "../annotations";

/**
 * 缓存管理器的属性工厂
 */
export declare interface CacheManagerPropertyFactory {

    newCacheRegion(cache: AbstractCacheManager, key: string, val?: any): CacheRegion;

    newTimer(_this: AbstractCacheManager): Timer;
}

/**
 * 缓存管理器的属性工厂默认实现
 */
class CacheManagerPropertyFactoryImpl implements CacheManagerPropertyFactory {
    newCacheRegion(cache: AbstractCacheManager, key: string, val?: any): CacheRegion {
        return new CacheRegion(cache, key, val);
    }

    newTimer(_this: AbstractCacheManager): Timer {
        const targetFun =
            (that: AbstractCacheManager) => {
                Object.keys(that._reginData).forEach(reginName => {
                    const region = that.getRegion(reginName);
                    // 缓存已经过期了
                    if (region.isInvalid()) {
                        // 重置缓存区域
                        that.resetRegion(reginName);
                    }
                });
            };
        // 默认每15秒刷新一次缓存
        return new GeneralTimer(15000, targetFun, _this);
    }
}

export class GeneralCacheRegionBuilder implements CacheManagerRegionBuilder {

    prefix: string;

    @AutoWried("dataContract")
    dataContract!: DataContract;


    constructor(cacheConfig: CacheConfig) {
        this.prefix = cacheConfig.prefix;
    }

    buildRegionName(regionName: string): string {
        if (this.prefix) {
            regionName = this.prefix + regionName;
        }
        return this.dataContract?.encode(regionName);
    }
}

/**
 * 抽象的缓存管理器
 */
export abstract class AbstractCacheManager implements CacheManager, AppPluginLife {

    // 缓存存储介质
    readonly storageProvider: StorageProvider;

    // 内部的数据存储对象
    readonly _reginData: { [key: string]: CacheRegion } = {};

    // 同步数据的任务队列 存储的是需要修改的缓存的名称
    private _queue: Set<string> = new Set<string>();
    /**
     * ttl 定时器
     * @private
     */
    private ttlTimer: Timer;

    private ttlEnable: boolean = false;

    private cacheManagerPropertyFactory: CacheManagerPropertyFactory;

    @AutoWried("dataCopier")
    private dataCopier!: DataCopier;
    @AutoWried("dataContract")
    private dataContract!: DataContract;
    @AutoWried("cacheRegionBuilder")
    private regionBuilder!: CacheManagerRegionBuilder;

    constructor(storageProvider: StorageProvider,
                cacheManagerPropertyFactory: CacheManagerPropertyFactory) {
        this.cacheManagerPropertyFactory = cacheManagerPropertyFactory;
        this.storageProvider = storageProvider;
        this.ttlTimer = cacheManagerPropertyFactory.newTimer(this);
    }

    install(app: AppStore) {
    }

    ready(app: AppStore) {
        if (this.ttlEnable) {
            // 开启定时器
            this.ttlTimer.start();
        }
    }

    remove(app: AppStore): AppPlugin {
        // 清除定时器
        this.ttlTimer.stop();
        return this;
    }

    setTtlEnabled(ttlEnable: boolean) {
        this.ttlEnable = ttlEnable;
    }

    setTtlInterval(ttlInterval: number) {
        this.ttlTimer.setInterval(ttlInterval);
    }

    /**
     * 初始化缓存区域
     * @param reginName 缓存区域
     * @param val 初始值
     * @param ttl 过期时间
     */
    initRegion(reginName: string, val?: any, ttl: number = -1) {
        const realReginName = this.buildRegionName(reginName);
        this._reginData[realReginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, realReginName, val);
        this.ttl(reginName, ttl);
        // 第一次直接将数据从缓存写到存储上
        this.sync(reginName);
        this.onChange(reginName);
    }

    /**
     * 重置缓存区域
     * @param reginName
     */
    resetRegion(reginName: string) {
        // 清除掉区域内的所有数据
        this.getRegion(reginName).clearValue(true);
    }

    /**
     * 获取缓存区域
     * @param reginName 缓存区域
     * @param defaultVal 默认值
     * @private
     */
    getRegion(reginName: string, defaultVal?: any): CacheRegion {
        reginName = this.buildRegionName(reginName);
        let cacheRegion = this._reginData[reginName];
        if (!cacheRegion) {
            cacheRegion = this._reginData[reginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, reginName, defaultVal);
        }
        return cacheRegion;
    }

    /**
     * 构建真正的regionName
     * @param reginName
     */
    buildRegionName(reginName: string) {
        Asserts.isNull(reginName, "缓存区域不可为空!");
        return this.regionBuilder?.buildRegionName(reginName) || reginName;
    }

    setValue(reginName: string, key: string, value: any) {
        const cacheRegion = this.getRegion(reginName);
        cacheRegion.setValue(key, value);
        this.onChange(reginName);
    }

    getValue(reginName: string, key: string, defaultVal?: any) {
        const cacheRegion = this.getRegion(reginName);
        let val = cacheRegion.getValue(key);
        if (val === undefined) {
            if (defaultVal !== undefined) {
                val = defaultVal;
                cacheRegion.setValue(key, defaultVal);
            } else {
                return val;
            }
        }
        return this.deepClone(val);
    }

    setRegionData(reginName: string, val: any, ttl: number = -1) {
        const cacheRegion = this.getRegion(reginName);
        cacheRegion.setRegionData(val);
        this.ttl(reginName, -1);
        this.onChange(reginName);
    }

    getRegionData(reginName: string, defaultVal?: any) {
        const cacheRegion = this.getRegion(reginName);
        let val = cacheRegion.getRegionData();
        if (val === undefined) {
            if (defaultVal !== undefined) {
                val = defaultVal;
                cacheRegion.setRegionData(defaultVal);
            } else {
                return val;
            }
        }
        return this.deepClone(val);
    }

    /**
     * 深克隆当前对象
     * @param val
     */
    deepClone(val: any) {
        return this.dataCopier?.deepClone(val);
    }


    encodeData(val: string): string {
        return (this.dataContract as DataContract).encode(val);
    }

    decodeData(val: string): string {
        return (this.dataContract as DataContract).decode(val);
    }

    /**
     * 当前region 发生改变
     * @param reginName
     */
    protected onChange(reginName: string) {
        if (!!this._queue.size) {
            setTimeout(() => {
                this.sync();
            }, 0);
        }
        this._queue.add(reginName);
    }

    /**
     * 立即持久化数据 从缓存对象到存储对象
     */
    sync(regionNames: Array<string> | string | undefined = undefined) {
        // 获取需要持久化的区域
        const taskQueue: string[] = [];
        if (regionNames) {
            if (Array.isArray(regionNames)) {
                taskQueue.push(...regionNames);
            } else {
                taskQueue.push(regionNames);
            }
        } else {
            this._queue.forEach(regionName => {
                taskQueue.push(regionName);
            });
            // 清空任务队列
            this._queue.clear();
        }
        // 逐个执行持久化
        taskQueue.forEach(reginName => {
            this.getRegion(reginName).sync();
        });
    }

    /**
     * 立即刷新缓存 从存储到缓存对象
     */
    refresh(regionNames: Array<string> | string | undefined = undefined) {
        // 获取需要刷新缓存的区域
        const taskQueue: string[] = [];
        if (regionNames) {
            if (Array.isArray(regionNames)) {
                taskQueue.push(...regionNames);
            } else {
                taskQueue.push(regionNames);
            }
        } else {
            Object.keys(this._reginData).forEach(regionName => {
                taskQueue.push(regionName);
            });
        }
        taskQueue.forEach(regionName => {
            this.getRegion(regionName).refresh();
        });
    }

    /**
     * 设置区域的ttl
     * @param reginName
     * @param ttl
     */
    ttl(reginName: string, ttl: number) {
        this.getRegion(reginName).setTtl(ttl);
    }

}

export class CacheRegion {

    readonly _cacheManager: AbstractCacheManager;
    /**
     * 区域名称
     */
    readonly _regionName: string;

    /**
     * 缓存失效时间
     */
    ttl: number = -1;

    // 内部的数据存储对象
    private _data: { [key: string]: any };

    // 对于简易属性的键
    readonly _simpleKey = "_s";

    /**
     * 当前区域是否为空
     * @private
     */
    private _empty: boolean = false;

    constructor(cache: AbstractCacheManager, key: string, val?: any) {
        this._cacheManager = cache;
        this._regionName = key;
        if (val === undefined) {
            // 获取到当前存储的json
            let valJson: string = this._cacheManager.storageProvider.getItem(this._regionName);
            if (valJson) {
                valJson = this._cacheManager.decodeData(valJson);
            } else {
                valJson = "{}";
            }
            // 将json 解析为对象
            val = JSON.parse(valJson);
        } else {
            if (typeof val === "object") {
                // 如果指定了初始值 那么直接使用它
                val = this._cacheManager.deepClone(val);
            } else {
                // 简单属性直接挂载在simpleKey上
                const newVal: { [key: string]: any } = {};
                newVal[this._simpleKey] = val;
                val = newVal;
            }
        }
        this._data = val;
        // 默认不过期
        this.ttl = -1;
    }

    /**
     * 设置过期时间
     * @param ttl
     */
    setTtl(ttl: number) {
        if (ttl <= 0) {
            this.ttl = -1;
        } else {
            this.ttl = new Date().getTime() + ttl;
        }
    }

    /**
     * 当前缓存是否非法
     */
    isInvalid() {
        return this.ttl !== -1 && this.ttl <= new Date().getTime();
    }

    /**
     * 直接设置区域的数据
     * @param val
     */
    setRegionData(val: any) {
        Asserts.isNull(val, "值不可为空!");
        if (typeof val === "object") {
            // 如果指定了初始值 那么直接使用它
            this._data = this._cacheManager.deepClone(val);
        } else {
            // 简单属性直接挂载在simpleKey上
            this._data[this._simpleKey] = val;
        }
        this._empty = false;
    }

    /**
     * 获取区域的数据
     */
    getRegionData() {
        if (!this._empty) {
            if (this.isSimple()) {
                return this._data[this._simpleKey];
            }
            // 有值才返回
            if (Object.keys(this._data).length) {
                return this._data;
            }
        }
    }

    /**
     * 设置值
     * @param key
     * @param val
     */
    setValue(key: string, val: any) {
        if (val === undefined) {
            delete this._data[key];
        } else {
            this._data[key] = this._cacheManager.deepClone(val);
        }
        this._empty = false;
    }

    /**
     * 获取值
     * @param key
     */
    getValue(key: string): any {
        const sourceVal = this._data[key];
        if (sourceVal) {
            return sourceVal;
        }
    }


    /**
     * 同步内存与存储对象
     */
    sync() {
        // json 序列化的时候对date 进行特殊处理一下
        const saveData = this._cacheManager.deepClone(this._data);
        this._cacheManager.storageProvider.setItem(this._regionName, this._cacheManager.encodeData(JSON.stringify(saveData)));
    }

    /**
     * 从存储对象同步数据到内存
     */
    refresh() {
        // 获取到当前存储的json
        let valJson: string = this._cacheManager.storageProvider.getItem(this._regionName);
        if (valJson) {
            valJson = this._cacheManager.decodeData(valJson);
        } else {
            valJson = "{}";
        }
        // 将json 解析为对象
        this._data = JSON.parse(valJson);
    }

    /**
     * 清除数据
     */
    clearValue(focus: boolean = false) {
        this._empty = true;
        this.ttl = -1;
        if (Array.isArray(this._data)) {
            this._data = [];
        } else {
            this._data = {};
        }
        if (focus) {
            this.sync();
        }
    }

    /**
     * 是否是一个简单对象的缓存
     */
    isSimple() {
        const keys = Object.keys(this._data);
        return keys.length === 1 && keys[0] === this._simpleKey;
    }

}

/**
 * 通过localStorage 进行存储
 */
export class LocalStorageCacheManager extends AbstractCacheManager {
    constructor() {
        // @ts-ignore
        super(localStorage, new CacheManagerPropertyFactoryImpl());
    }
}

/**
 * 通过sessionStorage 进行存储数据
 */
export class SessionStorageCacheManager extends AbstractCacheManager {
    constructor() {
        // @ts-ignore
        super(sessionStorage, new CacheManagerPropertyFactoryImpl());
    }
}

/**
 * 通过内存对数据进行存储
 */
export class MemoryStorageCacheManager extends AbstractCacheManager {
    constructor() {
        // 内存数据集
        const memoryData: { [key: string]: string } = {};
        const memoryStorage: StorageProvider = {
            getItem(key: string): string {
                return memoryData[key];
            },

            setItem(key: string, value: string) {
                memoryData[key] = value;
            },
            removeItem(key: string) {
                delete memoryData[key];
            }
        };
        super(memoryStorage, new CacheManagerPropertyFactoryImpl());
    }
}

