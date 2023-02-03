import {getCurrentAppStore} from "../manager/context";
import Asserts from "../utils/Asserts";

/**
 * 属性自动注入
 * @param beanId beanId
 * @param options 一些其它的参数
 * @param appStore 当前bean存储的容器
 * @constructor
 */

export const AutoWried =
    (beanId?: string, options: AutoWriedOptions = {}, appStore = getCurrentAppStore()) => { // 装饰器工厂
        return function (target: any, attr: string) { // 装饰器
            const getValue = () => {
                beanId = beanId || attr;
                if (appStore?.has(beanId)) {
                    return appStore.getPlugin(beanId);
                }
                return new Proxy({
                    value: undefined
                }, {
                    get(target: any, p: PropertyKey): any {
                        if (!target.value) {
                            appStore = appStore || getCurrentAppStore();
                            Asserts.isNull(appStore, "当前尚未初始化appStore");
                            Reflect.set(target, "value", appStore.getPlugin(beanId,options.default));
                        }
                        if (p !== attr) {
                            // 非当前被拦截的属性
                            return target.value[p];
                        }
                        return target.value;

                    }
                });
            };
            target[attr] = getValue();
        };
    };


export declare interface AutoWriedOptions {
    default?: any;// 默认插件
}

