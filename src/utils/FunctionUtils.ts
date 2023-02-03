export interface OriginalFunction<R> {
    (): R;
}

export interface FunctionProxy<R> {
    (done: OriginalFunction<R>, ...params): R;
}

export class FunctionUtils {
    /**
     * 包装一个对象中的目标方法
     * @param target 目标对象
     * @param fnName 方法名
     * @param wrapperFn 包装函数
     */
    proxy<R>(target: any, fnName: string, wrapperFn: FunctionProxy<R>) {
        if (!target) {
            return;
        }
        const _originalFn = target[fnName];
        if (_originalFn) {
            // 将原始的方法挂载在_original对象上
            if (!target._orginal) {
                target._orginal = {};
            }
            target._orginal[fnName] = _originalFn;
            target[fnName] = function () {
                const _args = arguments;
                const done: OriginalFunction<R> = () => {
                    return _originalFn.call(target, ..._args);
                };
                if (wrapperFn) {
                    return wrapperFn(done, ..._args);
                } else {
                    return done();
                }
            };
        }
    }

    /**
     * 执行原始的方法
     * @param target
     * @param fnName
     * @param _args
     */
    invokeOriginal(target: any, fnName: string, ..._args) {
        if (target._orginal) {
            const fn = target._orginal[fnName];
            if (fn) {
                return fn.call(target, ..._args);
            }
        }
    }
}

export const functionUtils = new FunctionUtils();
