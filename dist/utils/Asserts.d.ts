/**
 * 异常处理器
 */
export declare interface AssertsErrorHandler {
    /**
     * 错误信息处理
     * @param args 参数
     * @param msg  错误消息
     */
    error(args: Array<any>, msg: string): void;
}
/**
 * 控制台打印日志
 */
export declare class ConsoleErrorHandler implements AssertsErrorHandler {
    error(args: Array<any>, msg: string): void;
}
/**
 * 断言类
 */
export declare class Asserts {
    readonly _defaultErrorHandler: ConsoleErrorHandler;
    isNull(val: any, msg: string, handler?: AssertsErrorHandler): void;
    isNotNull(val: any, msg: string, handler?: AssertsErrorHandler): void;
    isEmpty(val: any, msg: string, handler?: AssertsErrorHandler): void;
    isNotEmpty(val: any, msg: string, handler?: AssertsErrorHandler): void;
}
declare const _default: Asserts;
export default _default;
