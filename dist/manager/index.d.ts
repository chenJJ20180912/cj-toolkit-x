import { AppPlugin } from "../typings";
export declare class AppConfig {
    cache: CacheConfig;
    /**
     * 日期转json 格式化开关
     */
    dateToJsonFormat: boolean;
}
export declare class CacheConfig {
    type: "Session" | "Local" | "Memory" | string;
    pluginName: "cacheManager" | string;
    prefix: string;
    ttlEnabled: boolean;
    ttlInterval: number;
}
export declare class AppStore {
    readonly plugins: {
        [key: string]: AppPluginProxy<AppPlugin>;
    };
    readonly pluginsNames: Array<string>;
    has(pluginName: string): boolean;
    /**
     * 使用插件
     * @param pluginName 插件名称
     * @param defaultPlugin 默认插件
     */
    getPlugin<T extends AppPlugin>(pluginName: string, defaultPlugin?: T): T;
    /**
     * 安装一个组件
     * @param pluginName 插件名称
     * @param plugin 插件
     * @param checkExist 是否检查已存在
     */
    install<T extends AppPlugin>(pluginName: string, plugin: T, checkExist?: boolean): AppPluginProxy<T> | undefined;
    /**
     * 上下文准备好了 逐个调用插件里面的ready 方法
     */
    ready(): void;
    remove(): void;
}
declare class AppPluginProxy<T extends AppPlugin> implements ProxyHandler<T> {
    private _originalPlugin;
    private proxy;
    constructor(plugin: T);
    setPlugin(plugin: T): void;
    getProxy(): any;
    defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean;
    deleteProperty(target: T, p: PropertyKey): boolean;
    enumerate(target: T): PropertyKey[];
    get(target: T, p: PropertyKey, receiver: any): any;
    getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined;
    getPrototypeOf(target: T): object | null;
    has(target: T, p: PropertyKey): boolean;
    isExtensible(target: T): boolean;
    ownKeys(target: T): PropertyKey[];
    preventExtensions(target: T): boolean;
    set(target: T, p: PropertyKey, value: any, receiver: any): boolean;
    setPrototypeOf(target: T, v: any): boolean;
    get originalPlugin(): T;
    set originalPlugin(value: T);
}
export {};
