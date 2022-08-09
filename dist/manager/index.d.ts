import { AppPlugin } from "../typings";
export declare class AppConfig {
    cache: CacheConfig;
}
export declare class CacheConfig {
    type: "Session" | "Local" | "Memory" | string;
    pluginName: "cacheManager" | string;
    ttlEnabled: boolean;
    ttlInterval: number;
}
export declare class AppStore {
    readonly plugins: {
        [key: string]: AppPlugin;
    };
    readonly pluginsNames: Array<string>;
    has(pluginName: string): boolean;
    /**
     * 使用插件
     * @param pluginName
     */
    getPlugin<T>(pluginName: string): any;
    /**
     * 安装一个组件
     * @param pluginName
     * @param plugin
     */
    install(pluginName: string, plugin: AppPlugin): void;
    /**
     * 上下文准备好了 逐个调用插件里面的ready 方法
     */
    ready(): void;
    remove(): void;
}
