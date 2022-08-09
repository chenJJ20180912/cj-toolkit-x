import { Timer } from "../typings";
export declare class GeneralTimer implements Timer {
    /**
     * 定时器id
     * @private
     */
    private timerId;
    /**
     * 周期
     */
    interval: number;
    /**
     * 是否启用定时器
     */
    enabled: boolean;
    constructor(interval?: number);
    start(targetFun: Function, that?: any): void;
    stop(): void;
    setEnabled(enabled: boolean): void;
    setInterval(interval?: number): void;
}
