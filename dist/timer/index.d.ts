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
    /**
     * 是否正在运行
     */
    running: boolean;
    /**
     * 代理的目标任务
     */
    _targetProxyJob: GeneralTimerJob;
    constructor(interval: number | undefined, targetFun: Function, that?: any);
    start(): void;
    updateThat(that: any): void;
    updateTargetFun(targetFun: Function): void;
    stop(): void;
    setInterval(interval?: number): void;
}
export declare class GeneralTimerJob {
    targetFun: Function;
    that: any;
    constructor(targetFun: Function, that: any);
    invoke(): void;
}
