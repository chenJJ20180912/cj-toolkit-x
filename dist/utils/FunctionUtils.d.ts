export interface OriginalFunction<R> {
    (): R;
}
export interface FunctionProxy<R> {
    (done: OriginalFunction<R>, ...params: any[]): R;
}
export declare class FunctionUtils {
    /**
     * 包装一个对象中的目标方法
     * @param target 目标对象
     * @param fnName 方法名
     * @param wrapperFn 包装函数
     */
    proxy<R>(target: any, fnName: string, wrapperFn: FunctionProxy<R>): void;
    /**
     * 执行原始的方法
     * @param target
     * @param fnName
     * @param _args
     */
    invokeOriginal(target: any, fnName: string, ..._args: any[]): any;
}
export declare const functionUtils: FunctionUtils;
