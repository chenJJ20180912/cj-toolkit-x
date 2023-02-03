import { AppConfig, AppStore } from "./manager";
import { AppRunHook } from "./typings";
/**
 * 安装器 里面实现配置信息的解析
 * @param hook 钩子
 * @param appConfig 配置对象
 */
export declare const installer: (hook?: AppRunHook, appConfig?: AppConfig) => AppStore;
