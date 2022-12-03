import { AppConfig, AppStore } from "./manager";
import { allConstructs } from "./export";
export default allConstructs;
export declare const appStore: AppStore;
export declare const appConfig: AppConfig;
export declare interface AppRunHook {
    /**
     * 所有工作之前调用
     * @param appConfig
     * @param appStore
     */
    compiled?(appConfig: AppConfig, appStore: AppStore): any;
    /**
     * 准备好的换进之前调用
     * @param appStore
     */
    beforeReady?(appStore: AppStore): any;
    /**
     * 准备好的换进之后调用
     * @param appStore
     */
    afterReady?(appStore: AppStore): any;
}
/**
 * 安装器 里面实现配置信息的解析
 * @param hook 钩子
 */
export declare const installer: (hook: AppRunHook) => void;
