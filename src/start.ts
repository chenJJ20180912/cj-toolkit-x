import {AppConfig, AppStore, CacheConfig} from "./manager";
import objectUtils from "./utils/ObjectUtils";
import arrayUtils from "./utils/ArrayUtils";
import dateUtils, {DateUtils} from "./utils/DateUtils";
import {AppRunHook, CacheManager} from "./typings";
import mathUtils from "./utils/MathUtils";
import {setCurrentAppStore} from "./manager/context";
import {
    GeneralCacheRegionBuilder,
    LocalStorageCacheManager,
    MemoryStorageCacheManager,
    SessionStorageCacheManager
} from "./cache";
import {GeneralDataCopier} from "./data/Copier";
import {UnsetDataContract} from "./data/Contract";
import {functionUtils} from "./utils/FunctionUtils";


/**
 * 安装器 里面实现配置信息的解析
 * @param hook 钩子
 * @param appConfig 配置对象
 */
export const installer = (hook: AppRunHook = {}, appConfig = new AppConfig()): AppStore => {
    const appStore = new AppStore();
    setCurrentAppStore(appStore);
    // 执行钩子函数
    hook.compiled && hook.compiled(appConfig, appStore);
    // 安装一些必要的工具类
    installIfNecessary(appStore, true);
    // 设置日期转json格式化
    if (appConfig.dateToJsonFormat) {
        setDateToJsonFormat(appStore);
    }
    // 安装缓存管理器
    appConfig.cache && installCacheManager(appStore, appConfig.cache);
    hook.beforeReady && hook.beforeReady(appStore);
    // 准备好上下文环境
    appStore.ready();
    hook.afterReady && hook.afterReady(appStore);
    return appStore;
};

// 安装缓存管理器
const installCacheManager = (appStore: AppStore, cacheConfig: CacheConfig) => {
    if (!cacheConfig) {
        return;
    }
    appStore.install("cacheRegionBuilder",new GeneralCacheRegionBuilder(cacheConfig),true)
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

function setDateToJsonFormat(appStore: AppStore) {
    /*
     * 重写时间的toJSON方法，因为在调用JSON.stringify的时候，时间转换就调用的toJSON，这样会导致少8个小时，所以重写它的toJSON方法
     */
    Date.prototype.toJSON = function () {
        // 从插件中获取到
        const dateUtils = appStore.getPlugin("dateUtils") as DateUtils;
        return dateUtils.dateToString(this, "yyyy-MM-dd HH:mm:ss"); // util.formatDate是自定义的个时间格式化函数
    };
}

// 安装一些必须要的插件
function installIfNecessary(appStore, checkExist = true) {
    appStore.install("objectUtils", objectUtils, checkExist);
    appStore.install("arrayUtils", arrayUtils, checkExist);
    appStore.install("dateUtils", dateUtils, checkExist);
    // 数据编解码插件
    appStore.install("dataContract", new UnsetDataContract(), checkExist);
    // 对象拷贝器
    appStore.install("dataCopier", new GeneralDataCopier(), checkExist);
    // 数学工具类
    appStore.install("mathUtils", mathUtils, checkExist);
    // 函数工具类
    appStore.install("functionUtils", functionUtils, checkExist);
}

