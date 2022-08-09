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

    constructor(interval: number = 15000) {
        this.interval = interval;
    }

    start(targetFun: Function, that?:any) {
        // 先停止掉原本的定时器
        this.stop();
        // 新的定时器
        if (this.interval > 0 && this.enabled) {
            this.timerId = setInterval(() => {
                targetFun(that);
            }, this.interval);
        }
    }

    stop() {
        clearInterval(this.timerId);
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    setInterval(interval: number = 15000) {
        this.interval = interval;
    }
}
