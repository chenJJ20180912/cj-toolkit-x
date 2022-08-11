import {AppConfig, AppStore, CacheConfig} from "./manager";
import {UnsetDataContract} from "./data/Contract";
import {GeneralDataCopier} from "./data/Copier";
import {LocalStorageCacheManager, MemoryStorageCacheManager, SessionStorageCacheManager} from "./cache";
import objectUtils  from "./utils/ObjectUtils";
import arrayUtils from "./utils/ArrayUtils";
import dateUtils from "./utils/DateUtils";
import {CacheManager} from "./typings";
// 构建一个appStore对象
export const appStore = new AppStore();

// 安装一些工具类
appStore.install("objectUtils",objectUtils);
appStore.install("arrayUtils", arrayUtils);
appStore.install("dateUtils", dateUtils);
// 数据编解码插件
appStore.install("dataContract", new UnsetDataContract());
//
appStore.install("dataCopier", new GeneralDataCopier());


export const appConfig = new AppConfig();

export declare interface AppRunHook {

    /**
     * 所有工作之前调用
     * @param appConfig
     * @param appStore
     */
    compiled?(appConfig: AppConfig, appStore: AppStore);

    /**
     * 准备好的换进之前调用
     * @param appStore
     */
    beforeReady?(appStore: AppStore);
    /**
     * 准备好的换进之后调用
     * @param appStore
     */
    afterReady?(appStore: AppStore);
}

/**
 * 安装器 里面实现配置信息的解析
 * @param hook 钩子
 */
export const installer = (hook:AppRunHook) => {
    hook.compiled && hook.compiled(appConfig, appStore);
    // 安装缓存管理器
    appConfig.cache && installCacheManager(appConfig.cache);
    hook.beforeReady && hook.beforeReady(appStore);
    // 准备好上下文环境
    appStore.ready();
    hook.afterReady && hook.afterReady(appStore);
};

// 安装缓存管理器
const installCacheManager = (cacheConfig: CacheConfig) => {
    if (!cacheConfig) {
        return;
    }
    const pluginName = cacheConfig.pluginName || "cacheManager";
    let cacheManager: CacheManager;
    if (appStore.has(pluginName)) {
        cacheManager = (appStore.getPlugin(pluginName) as CacheManager);
    } else {
        switch (cacheConfig.type) {
            case "Memory":
                cacheManager = new MemoryStorageCacheManager();
                break;
            case "Session":
                cacheManager = new SessionStorageCacheManager();
                break;
            default:
                cacheManager = new LocalStorageCacheManager();
                break;
        }
        appStore.install(pluginName, cacheManager);
    }
    // 设置属性信息
    cacheManager.setTtlEnabled(cacheConfig.ttlEnabled);
    cacheManager.setTtlInterval(cacheConfig.ttlInterval);
};
