import {Timer} from "../typings";

export class GeneralTimer implements Timer {

    /**
     * 定时器id
     * @private
     */
    private timerId: any;

    /**
     * 周期
     */
    interval: number;

    /**
     * 是否启用定时器
     */
    enabled: boolean = true;
    /**
     * 是否正在运行
     */
    running: boolean = false;

    /**
     * 代理的目标任务
     */
    _targetProxyJob: GeneralTimerJob;

    constructor(interval: number = 15000, targetFun: Function, that?: any) {
        this.interval = interval;
        this._targetProxyJob = new GeneralTimerJob(targetFun, that);
    }

    start() {
        if (!this.running) {
            // 新的定时器
            if (this.interval > 0 && this.enabled) {
                this.running = true;
                this.timerId = setInterval(() => {
                    // 执行代理方法
                    this._targetProxyJob.invoke();
                }, this.interval);
            }
        }
    }

    updateThat(that: any) {
        this._targetProxyJob.that = that;
    }

    updateTargetFun(targetFun: Function) {
        this._targetProxyJob.targetFun = targetFun;
    }

    stop() {
        if (this.running) {
            clearInterval(this.timerId);
        }
        this.running = false;
    }

    setInterval(interval: number = 15000) {
        this.interval = interval;
        if (this.running) {
            this.stop();
            this.start();
        }
    }
}


export class GeneralTimerJob {
    targetFun: Function;
    that: any;

    constructor(targetFun: Function, that: any) {
        this.targetFun = targetFun;
        this.that = that;
    }

    invoke() {
        if (this.targetFun) {
            if (this.that) {
                this.targetFun.call(this.that, this.that);
            } else {
                this.targetFun();
            }
        }
    }
}
