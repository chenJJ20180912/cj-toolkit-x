import {AppStore} from "../manager";
import Asserts from "../utils/Asserts";
import {AppPlugin, AppPluginLife, CacheManager, DataContract, DataCopier, StorageProvider, Timer} from "../typings";
import {GeneralTimer} from "../timer";

/**
 * 缓存管理器的属性工厂
 */
export declare interface CacheManagerPropertyFactory {

    newCacheRegion(cache: AbstractCacheManager, key: string, val?: any): CacheRegion;

    newTimer(): Timer;
}

/**
 * 缓存管理器的属性工厂默认实现
 */
class CacheManagerPropertyFactoryImpl implements CacheManagerPropertyFactory {
    newCacheRegion(cache: AbstractCacheManager, key: string, val?: any): CacheRegion {
        return new CacheRegion(cache, key, val);
    }

    newTimer(): Timer {
        return new GeneralTimer();
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

    _app: AppStore | undefined;

    // 同步数据的任务队列 存储的是需要修改的缓存的名称
    private _queue: Set<string> = new Set<string>();
    /**
     * ttl 定时器
     * @private
     */
    private ttlTimer: Timer;

    private cacheManagerPropertyFactory: CacheManagerPropertyFactory;

    constructor(storageProvider: StorageProvider,
                cacheManagerPropertyFactory: CacheManagerPropertyFactory) {
        this.cacheManagerPropertyFactory = cacheManagerPropertyFactory;
        this.storageProvider = storageProvider;
        this.ttlTimer = cacheManagerPropertyFactory.newTimer();
    }

    install(app: AppStore) {
        this._app = app;
    }

    ready(app: AppStore) {
        this.ttlTimer.start(() => {
            Object.keys(this._reginData).forEach(reginName => {
                const region = this.getRegion(reginName);
                // 缓存已经过期了
                if (region.isInvalid()) {
                    // 重置缓存区域
                    this.resetRegion(reginName);
                }
            });
        });
    }

    remove(app: AppStore): AppPlugin {
        // 清除定时器
        this.ttlTimer.stop();
        return this;
    }

    setTtlEnabled(ttlEnable: boolean) {
        this.ttlTimer.setEnabled(ttlEnable);
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
        Asserts.isNull(reginName, "缓存区域不可为空!");
        this._reginData[reginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, reginName, val);
        this.ttl(reginName, ttl);
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
    protected getRegion(reginName: string, defaultVal?: any): CacheRegion {
        Asserts.isNull(reginName, "缓存区域不可为空!");
        let cacheRegion = this._reginData[reginName];
        if (!cacheRegion) {
            cacheRegion = this._reginData[reginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, reginName, defaultVal);
        }
        return cacheRegion;
    }

    setValue(reginName: string, key: string, value: any) {
        const cacheRegion = this.getRegion(reginName);
        cacheRegion.setValue(key, value);
        this.onChange(reginName);
    }

    getValue(reginName: string, key: string, defaultVal?: any) {
        const cacheRegion = this.getRegion(reginName);
        let val = cacheRegion.getValue(key);
        if (val === undefined && defaultVal !== undefined) {
            val = defaultVal;
            cacheRegion.setValue(key, defaultVal);
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
        if (val === undefined && defaultVal !== undefined) {
            val = defaultVal;
            cacheRegion.setRegionData(defaultVal);
        }
        return this.deepClone(val);
    }

    /**
     * 深克隆当前对象
     * @param val
     */
    deepClone(val: any) {
        if (this._app && val !== undefined) {
            return (this._app.getPlugin("dataCopier") as DataCopier).deepClone(val);
        }
        return val;
    }


    encodeData(val: string): string {
        if (!this._app) {
            return val;
        }
        return (this._app.getPlugin("dataContract") as DataContract).encode(val);
    }

    decodeData(val: string): string {
        if (!this._app) {
            return val;
        }
        return (this._app.getPlugin("dataContract") as DataContract).decode(val);
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
     * 持久化数据
     */
    sync() {
        // 获取需要持久化的区域
        const taskQueue: string[] = [];
        this._queue.forEach(regionName => {
            taskQueue.push(regionName);
        });
        // 清空任务队列
        this._queue.clear();
        // 逐个执行持久化
        taskQueue.forEach(reginName => {
            this.getRegion(reginName).sync();
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
     * 清除数据
     */
    clearValue(focus:boolean = false) {
        this._empty = true;
        this.ttl = -1;
        // 移除对象上的值
        Object.keys(this._data).forEach(p => {
            delete this._data[p];
        });
        if(focus){
            this.sync()
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
