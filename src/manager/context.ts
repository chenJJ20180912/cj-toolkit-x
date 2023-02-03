let currentAppStore;
let cbs: Array<Function> = [];

export function getCurrentAppStore() {
    return currentAppStore;
}

export function setCurrentAppStore(appStore) {
    currentAppStore = appStore;
}

/**
 * 执行所有的回调
 */
export function doNextTick() {
    cbs = cbs.filter(cb => cb() === false);
}

/**
 * 下一个生命周期执行
 * @param cb
 */
export function nextTick(cb) {
    if (cb) {
        cbs.push(cb);
    }
}
