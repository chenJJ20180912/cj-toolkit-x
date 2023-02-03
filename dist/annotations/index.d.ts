/**
 * 属性自动注入
 * @param beanId beanId
 * @param options 一些其它的参数
 * @param appStore 当前bean存储的容器
 * @constructor
 */
export declare const AutoWried: (beanId?: string | undefined, options?: AutoWriedOptions, appStore?: any) => (target: any, attr: string) => void;
export declare interface AutoWriedOptions {
    default?: any;
}
