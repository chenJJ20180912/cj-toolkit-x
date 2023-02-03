import Asserts from "../utils/Asserts";
import {AppPlugin, AppPluginLife} from "../typings";

export class AppConfig {

    cache: CacheConfig = new CacheConfig();

    /**
     * 日期转json 格式化开关
     */
    dateToJsonFormat = true;

}

export class CacheConfig {
    // 缓存类型
    type: "Session" | "Local" | "Memory" | string = "Local";
    // 插件的名称
    pluginName: "cacheManager" | string = "cacheManager";
    // 前缀
    prefix: string = "";
    // 过期检测
    ttlEnabled: boolean = true;
    // 过期检测的时间间隔 默认15秒检测一次
    ttlInterval: number = 15000;

}

export class AppStore {

    // 插件
    readonly plugins: { [key: string]: AppPluginProxy<AppPlugin> } = {};
    // 插件的名称
    readonly pluginsNames: Array<string> = [];

    has(pluginName: string): boolean {
        return !!this.plugins[pluginName];
    }

    /**
     * 使用插件
     * @param pluginName 插件名称
     * @param defaultPlugin 默认插件
     */
    getPlugin<T extends AppPlugin>(pluginName: string, defaultPlugin?: T): T {
        let plugin: AppPluginProxy<AppPlugin> = this.plugins[pluginName];
        if (!plugin) {
            if (defaultPlugin) {
                // @ts-ignore
                plugin = this.install(pluginName, defaultPlugin);
            }
            Asserts.isNull(plugin, "没有注入当前插件:" + pluginName);
        }
        return plugin.getProxy() as T;
    }

    /**
     * 安装一个组件
     * @param pluginName 插件名称
     * @param plugin 插件
     * @param checkExist 是否检查已存在
     */
    install<T extends AppPlugin>(pluginName: string, plugin: T, checkExist = false): AppPluginProxy<T> | undefined {
        Asserts.isNull(plugin, "插件不可为空");
        let pluginProxy: AppPluginProxy<T> = this.plugins[pluginName] as AppPluginProxy<T>;
        if (pluginProxy) {
            if (checkExist) {
                // 插件已存在
                return undefined;
            }
            if ("remove" in pluginProxy) {
                (pluginProxy as AppPluginLife).remove();
            }
            // 更新插件
            // @ts-ignore
            pluginProxy.setPlugin(plugin);
        } else {
            pluginProxy = new AppPluginProxy(plugin);
            this.pluginsNames.push(pluginName);
            this.plugins[pluginName] = pluginProxy;
        }
        if ("install" in plugin) {
            (plugin as AppPluginLife).install();
        }
        return pluginProxy;
    }

    /**
     * 上下文准备好了 逐个调用插件里面的ready 方法
     */
    ready() {
        this.pluginsNames.forEach(pluginName => {
            const plugin = this.getPlugin(pluginName);
            if ("ready" in plugin) {
                (plugin as AppPluginLife).ready(this);
            }
        });
    }

    remove() {
        this.pluginsNames.forEach(pluginName => {
            const plugin = this.getPlugin(pluginName);
            if ("remove" in plugin) {
                plugin.remove(this);
            }
        });
    }

}

class AppPluginProxy<T extends AppPlugin> implements ProxyHandler<T> {

    private _originalPlugin: T;

    private proxy;

    constructor(plugin: T) {
        this._originalPlugin = plugin;
    }

    setPlugin(plugin: T) {
        this.originalPlugin = plugin;
    }

    getProxy() {
        if (!this.proxy) {
            this.proxy = new Proxy(this.originalPlugin, this);
        }
        return this.proxy;
    }

    defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
        return Reflect.defineProperty(this.originalPlugin, p, attributes);
    }

    deleteProperty(target: T, p: PropertyKey): boolean {
        return Reflect.deleteProperty(this.originalPlugin, p);
    }

    enumerate(target: T): PropertyKey[] {
        // @ts-ignore
        return Reflect.enumerate(this.originalPlugin);
    }

    get(target: T, p: PropertyKey, receiver: any): any {
        return Reflect.get(this.originalPlugin, p);
    }

    getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor | undefined {
        return Reflect.getOwnPropertyDescriptor(this.originalPlugin, p);
    }

    getPrototypeOf(target: T): object | null {
        return Reflect.getPrototypeOf(this.originalPlugin);
    }

    has(target: T, p: PropertyKey): boolean {
        return Reflect.has(this.originalPlugin, p);
    }

    isExtensible(target: T): boolean {
        return Reflect.isExtensible(this.originalPlugin);
    }

    ownKeys(target: T): PropertyKey[] {
        return Reflect.ownKeys(this.originalPlugin);
    }

    preventExtensions(target: T): boolean {
        return Reflect.preventExtensions(this.originalPlugin);
    }

    set(target: T, p: PropertyKey, value: any, receiver: any): boolean {
        return Reflect.set(this.originalPlugin, p, value, receiver);
    }

    setPrototypeOf(target: T, v: any): boolean {
        return Reflect.setPrototypeOf(this.originalPlugin, v);
    }


    get originalPlugin(): T {
        return this._originalPlugin;
    }

    set originalPlugin(value: T) {
        this._originalPlugin = value;
    }
}
