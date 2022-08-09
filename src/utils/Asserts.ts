/**
 * 异常处理器
 */
export declare interface AssertsErrorHandler {
    /**
     * 错误信息处理
     * @param args 参数
     * @param msg  错误消息
     */
    error(args:Array<any>, msg:string):void;
}

/**
 * 控制台打印日志
 */
export class ConsoleErrorHandler implements AssertsErrorHandler {
    error(args:Array<any>, msg:string):void {
        console.error(args)
        throw new Error(msg);
    }

}

/**
 * 断言类
 */
export class Asserts {

    readonly _defaultErrorHandler = new ConsoleErrorHandler();

    isNull(val:any, msg:string, handler: AssertsErrorHandler = this._defaultErrorHandler) {
        if (val === undefined || val === '' || val === null) {
            handler.error([val],msg)
        }
    }

    isNotNull(val:any, msg:string, handler: AssertsErrorHandler = this._defaultErrorHandler) {
        if (val !== undefined && val !== '' && val !== null) {
            handler.error([val],msg)
        }
    }

    isEmpty(val:any, msg:string, handler: AssertsErrorHandler = this._defaultErrorHandler) {
        this.isNull(val, msg,handler)
        if (Array.isArray(val) && val.length === 0) {
            handler.error([val],msg)
        }
    }

    isNotEmpty(val:any, msg:string, handler: AssertsErrorHandler = this._defaultErrorHandler){
        this.isNotNull(val,msg,handler)
        if (Array.isArray(val) && val.length > 0) {
            handler.error([val],msg)
        }
    }


}

export default new Asserts()
