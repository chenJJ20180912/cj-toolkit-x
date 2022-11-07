import Asserts from "../utils/Asserts";
import {AppPlugin} from "../typings";

export class AppConfig {

    cache: CacheConfig = new CacheConfig();

}

export class CacheConfig {
    // 缓存类型
    type: "Session" | "Local" | "Memory" | string = "Local";
    // 插件的名称
    pluginName: "cacheManager" | string = "cacheManager";
    // 过期检测
    ttlEnabled: boolean = true;
    // 过期检测的时间间隔 默认15秒检测一次
    ttlInterval: number = 15000;

}

export class AppStore {

    // 插件
    readonly plugins: { [key: string]: AppPlugin } = {};
    // 插件的名称
    readonly pluginsNames: Array<string> = [];

    has(pluginName: string): boolean {
        return !!this.plugins[pluginName];
    }

    /**
     * 使用插件
     * @param pluginName
     */
    getPlugin<T>(pluginName: string): any {
        const plugin = this.plugins[pluginName];
        Asserts.isNull(plugin, "没有注入当前插件:" + pluginName);
        return plugin as T;
    }

    /**
     * 安装一个组件
     * @param pluginName
     * @param plugin
     */
    install(pluginName: string, plugin: AppPlugin) {
        Asserts.isNull(plugin, "插件不可为空");
        const oldPlugin = this.plugins[pluginName];
        if (oldPlugin && "remove" in oldPlugin) {
            oldPlugin.remove(this);
        } else {
            this.pluginsNames.push(pluginName);
        }
        this.plugins[pluginName] = plugin;
        if (plugin && "install" in plugin) {
            plugin.install(this);
        }
    }

    /**
     * 上下文准备好了 逐个调用插件里面的ready 方法
     */
    ready() {
        this.pluginsNames.forEach(pluginName => {
            const plugin = this.getPlugin(pluginName);
            if ("ready" in plugin) {
                plugin.ready(this);
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

