(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.index = global.index || {}));
})(this, (function (exports) { 'use strict';

    class GeneralTimer {
        constructor(interval = 15000, targetFun, that) {
            /**
             * 是否启用定时器
             */
            this.enabled = true;
            /**
             * 是否正在运行
             */
            this.running = false;
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
        updateThat(that) {
            this._targetProxyJob.that = that;
        }
        updateTargetFun(targetFun) {
            this._targetProxyJob.targetFun = targetFun;
        }
        stop() {
            if (this.running) {
                clearInterval(this.timerId);
            }
            this.running = false;
        }
        setInterval(interval = 15000) {
            this.interval = interval;
            if (this.running) {
                this.stop();
                this.start();
            }
        }
    }
    class GeneralTimerJob {
        constructor(targetFun, that) {
            this.targetFun = targetFun;
            this.that = that;
        }
        invoke() {
            if (this.targetFun) {
                if (this.that) {
                    this.targetFun.call(this.that, this.that);
                }
                else {
                    this.targetFun();
                }
            }
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    /**
     * 控制台打印日志
     */
    class ConsoleErrorHandler {
        error(args, msg) {
            console.error(msg, args);
            throw new Error(msg);
        }
    }
    /**
     * 断言类
     */
    class Asserts {
        constructor() {
            this._defaultErrorHandler = new ConsoleErrorHandler();
        }
        isNull(val, msg, handler = this._defaultErrorHandler) {
            if (val === undefined || val === "" || val === null) {
                handler.error([val], msg);
            }
        }
        isNotNull(val, msg, handler = this._defaultErrorHandler) {
            if (val !== undefined && val !== "" && val !== null) {
                handler.error([val], msg);
            }
        }
        isEmpty(val, msg, handler = this._defaultErrorHandler) {
            this.isNull(val, msg, handler);
            if (Array.isArray(val) && val.length === 0) {
                handler.error([val], msg);
            }
        }
        isNotEmpty(val, msg, handler = this._defaultErrorHandler) {
            this.isNotNull(val, msg, handler);
            if (Array.isArray(val) && val.length > 0) {
                handler.error([val], msg);
            }
        }
    }
    var Asserts$1 = new Asserts();

    let currentAppStore;
    function getCurrentAppStore() {
        return currentAppStore;
    }
    function setCurrentAppStore(appStore) {
        currentAppStore = appStore;
    }

    /**
     * 属性自动注入
     * @param beanId beanId
     * @param options 一些其它的参数
     * @param appStore 当前bean存储的容器
     * @constructor
     */
    const AutoWried = (beanId, options = {}, appStore = getCurrentAppStore()) => {
        return function (target, attr) {
            const getValue = () => {
                beanId = beanId || attr;
                if (appStore === null || appStore === void 0 ? void 0 : appStore.has(beanId)) {
                    return appStore.getPlugin(beanId);
                }
                return new Proxy({
                    value: undefined
                }, {
                    get(target, p, receiver) {
                        if (!target.value) {
                            appStore = appStore || getCurrentAppStore();
                            Asserts$1.isNull(appStore, "当前尚未初始化appStore");
                            Reflect.set(target, "value", appStore.getPlugin(beanId, options.default));
                        }
                        if (p !== attr) {
                            // 非当前被拦截的属性
                            return target.value[p];
                        }
                        return target.value;
                    }
                });
            };
            target[attr] = getValue();
        };
    };

    /**
     * 缓存管理器的属性工厂默认实现
     */
    class CacheManagerPropertyFactoryImpl {
        newCacheRegion(cache, key, val) {
            return new CacheRegion(cache, key, val);
        }
        newTimer(_this) {
            const targetFun = (that) => {
                Object.keys(that._reginData).forEach(reginName => {
                    const region = that.getRegion(reginName);
                    // 缓存已经过期了
                    if (region.isInvalid()) {
                        // 重置缓存区域
                        that.resetRegion(reginName);
                    }
                });
            };
            // 默认每15秒刷新一次缓存
            return new GeneralTimer(15000, targetFun, _this);
        }
    }
    class GeneralCacheRegionBuilder {
        constructor(cacheConfig) {
            this.prefix = cacheConfig.prefix;
        }
        buildRegionName(regionName) {
            var _a;
            if (this.prefix) {
                regionName = this.prefix + regionName;
            }
            return (_a = this.dataContract) === null || _a === void 0 ? void 0 : _a.encode(regionName);
        }
    }
    __decorate([
        AutoWried("dataContract")
    ], GeneralCacheRegionBuilder.prototype, "dataContract", void 0);
    /**
     * 抽象的缓存管理器
     */
    class AbstractCacheManager {
        constructor(storageProvider, cacheManagerPropertyFactory) {
            // 内部的数据存储对象
            this._reginData = {};
            // 同步数据的任务队列 存储的是需要修改的缓存的名称
            this._queue = new Set();
            this.ttlEnable = false;
            this.cacheManagerPropertyFactory = cacheManagerPropertyFactory;
            this.storageProvider = storageProvider;
            this.ttlTimer = cacheManagerPropertyFactory.newTimer(this);
        }
        install(app) {
        }
        ready(app) {
            if (this.ttlEnable) {
                // 开启定时器
                this.ttlTimer.start();
            }
        }
        remove(app) {
            // 清除定时器
            this.ttlTimer.stop();
            return this;
        }
        setTtlEnabled(ttlEnable) {
            this.ttlEnable = ttlEnable;
        }
        setTtlInterval(ttlInterval) {
            this.ttlTimer.setInterval(ttlInterval);
        }
        /**
         * 初始化缓存区域
         * @param reginName 缓存区域
         * @param val 初始值
         * @param ttl 过期时间
         */
        initRegion(reginName, val, ttl = -1) {
            const realReginName = this.buildRegionName(reginName);
            this._reginData[realReginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, realReginName, val);
            this.ttl(reginName, ttl);
            // 第一次直接将数据从缓存写到存储上
            this.sync(reginName);
            this.onChange(reginName);
        }
        /**
         * 重置缓存区域
         * @param reginName
         */
        resetRegion(reginName) {
            // 清除掉区域内的所有数据
            this.getRegion(reginName).clearValue(true);
        }
        /**
         * 获取缓存区域
         * @param reginName 缓存区域
         * @param defaultVal 默认值
         * @private
         */
        getRegion(reginName, defaultVal) {
            reginName = this.buildRegionName(reginName);
            let cacheRegion = this._reginData[reginName];
            if (!cacheRegion) {
                cacheRegion = this._reginData[reginName] = this.cacheManagerPropertyFactory.newCacheRegion(this, reginName, defaultVal);
            }
            return cacheRegion;
        }
        /**
         * 构建真正的regionName
         * @param reginName
         */
        buildRegionName(reginName) {
            var _a;
            Asserts$1.isNull(reginName, "缓存区域不可为空!");
            return ((_a = this.regionBuilder) === null || _a === void 0 ? void 0 : _a.buildRegionName(reginName)) || reginName;
        }
        setValue(reginName, key, value) {
            const cacheRegion = this.getRegion(reginName);
            cacheRegion.setValue(key, value);
            this.onChange(reginName);
        }
        getValue(reginName, key, defaultVal) {
            const cacheRegion = this.getRegion(reginName);
            let val = cacheRegion.getValue(key);
            if (val === undefined) {
                if (defaultVal !== undefined) {
                    val = defaultVal;
                    cacheRegion.setValue(key, defaultVal);
                }
                else {
                    return val;
                }
            }
            return this.deepClone(val);
        }
        setRegionData(reginName, val, ttl = -1) {
            const cacheRegion = this.getRegion(reginName);
            cacheRegion.setRegionData(val);
            this.ttl(reginName, -1);
            this.onChange(reginName);
        }
        getRegionData(reginName, defaultVal) {
            const cacheRegion = this.getRegion(reginName);
            let val = cacheRegion.getRegionData();
            if (val === undefined) {
                if (defaultVal !== undefined) {
                    val = defaultVal;
                    cacheRegion.setRegionData(defaultVal);
                }
                else {
                    return val;
                }
            }
            return this.deepClone(val);
        }
        /**
         * 深克隆当前对象
         * @param val
         */
        deepClone(val) {
            var _a;
            return (_a = this.dataCopier) === null || _a === void 0 ? void 0 : _a.deepClone(val);
        }
        encodeData(val) {
            return this.dataContract.encode(val);
        }
        decodeData(val) {
            return this.dataContract.decode(val);
        }
        /**
         * 当前region 发生改变
         * @param reginName
         */
        onChange(reginName) {
            if (!!this._queue.size) {
                setTimeout(() => {
                    this.sync();
                }, 0);
            }
            this._queue.add(reginName);
        }
        /**
         * 立即持久化数据 从缓存对象到存储对象
         */
        sync(regionNames = undefined) {
            // 获取需要持久化的区域
            const taskQueue = [];
            if (regionNames) {
                if (Array.isArray(regionNames)) {
                    taskQueue.push(...regionNames);
                }
                else {
                    taskQueue.push(regionNames);
                }
            }
            else {
                this._queue.forEach(regionName => {
                    taskQueue.push(regionName);
                });
                // 清空任务队列
                this._queue.clear();
            }
            // 逐个执行持久化
            taskQueue.forEach(reginName => {
                this.getRegion(reginName).sync();
            });
        }
        /**
         * 立即刷新缓存 从存储到缓存对象
         */
        refresh(regionNames = undefined) {
            // 获取需要刷新缓存的区域
            const taskQueue = [];
            if (regionNames) {
                if (Array.isArray(regionNames)) {
                    taskQueue.push(...regionNames);
                }
                else {
                    taskQueue.push(regionNames);
                }
            }
            else {
                Object.keys(this._reginData).forEach(regionName => {
                    taskQueue.push(regionName);
                });
            }
            taskQueue.forEach(regionName => {
                this.getRegion(regionName).refresh();
            });
        }
        /**
         * 设置区域的ttl
         * @param reginName
         * @param ttl
         */
        ttl(reginName, ttl) {
            this.getRegion(reginName).setTtl(ttl);
        }
    }
    __decorate([
        AutoWried("dataCopier")
    ], AbstractCacheManager.prototype, "dataCopier", void 0);
    __decorate([
        AutoWried("dataContract")
    ], AbstractCacheManager.prototype, "dataContract", void 0);
    __decorate([
        AutoWried("cacheRegionBuilder")
    ], AbstractCacheManager.prototype, "regionBuilder", void 0);
    class CacheRegion {
        constructor(cache, key, val) {
            /**
             * 缓存失效时间
             */
            this.ttl = -1;
            // 对于简易属性的键
            this._simpleKey = "_s";
            /**
             * 当前区域是否为空
             * @private
             */
            this._empty = false;
            this._cacheManager = cache;
            this._regionName = key;
            if (val === undefined) {
                // 获取到当前存储的json
                let valJson = this._cacheManager.storageProvider.getItem(this._regionName);
                if (valJson) {
                    valJson = this._cacheManager.decodeData(valJson);
                }
                else {
                    valJson = "{}";
                }
                // 将json 解析为对象
                val = JSON.parse(valJson);
            }
            else {
                if (typeof val === "object") {
                    // 如果指定了初始值 那么直接使用它
                    val = this._cacheManager.deepClone(val);
                }
                else {
                    // 简单属性直接挂载在simpleKey上
                    const newVal = {};
                    newVal[this._simpleKey] = val;
                    val = newVal;
                }
            }
            this._data = val;
            // 默认不过期
            this.ttl = -1;
        }
        /**
         * 设置过期时间
         * @param ttl
         */
        setTtl(ttl) {
            if (ttl <= 0) {
                this.ttl = -1;
            }
            else {
                this.ttl = new Date().getTime() + ttl;
            }
        }
        /**
         * 当前缓存是否非法
         */
        isInvalid() {
            return this.ttl !== -1 && this.ttl <= new Date().getTime();
        }
        /**
         * 直接设置区域的数据
         * @param val
         */
        setRegionData(val) {
            Asserts$1.isNull(val, "值不可为空!");
            if (typeof val === "object") {
                // 如果指定了初始值 那么直接使用它
                this._data = this._cacheManager.deepClone(val);
            }
            else {
                // 简单属性直接挂载在simpleKey上
                this._data[this._simpleKey] = val;
            }
            this._empty = false;
        }
        /**
         * 获取区域的数据
         */
        getRegionData() {
            if (!this._empty) {
                if (this.isSimple()) {
                    return this._data[this._simpleKey];
                }
                // 有值才返回
                if (Object.keys(this._data).length) {
                    return this._data;
                }
            }
        }
        /**
         * 设置值
         * @param key
         * @param val
         */
        setValue(key, val) {
            if (val === undefined) {
                delete this._data[key];
            }
            else {
                this._data[key] = this._cacheManager.deepClone(val);
            }
            this._empty = false;
        }
        /**
         * 获取值
         * @param key
         */
        getValue(key) {
            const sourceVal = this._data[key];
            if (sourceVal) {
                return sourceVal;
            }
        }
        /**
         * 同步内存与存储对象
         */
        sync() {
            // json 序列化的时候对date 进行特殊处理一下
            const saveData = this._cacheManager.deepClone(this._data);
            this._cacheManager.storageProvider.setItem(this._regionName, this._cacheManager.encodeData(JSON.stringify(saveData)));
        }
        /**
         * 从存储对象同步数据到内存
         */
        refresh() {
            // 获取到当前存储的json
            let valJson = this._cacheManager.storageProvider.getItem(this._regionName);
            if (valJson) {
                valJson = this._cacheManager.decodeData(valJson);
            }
            else {
                valJson = "{}";
            }
            // 将json 解析为对象
            this._data = JSON.parse(valJson);
        }
        /**
         * 清除数据
         */
        clearValue(focus = false) {
            this._empty = true;
            this.ttl = -1;
            if (Array.isArray(this._data)) {
                this._data = [];
            }
            else {
                this._data = {};
            }
            if (focus) {
                this.sync();
            }
        }
        /**
         * 是否是一个简单对象的缓存
         */
        isSimple() {
            const keys = Object.keys(this._data);
            return keys.length === 1 && keys[0] === this._simpleKey;
        }
    }
    /**
     * 通过localStorage 进行存储
     */
    class LocalStorageCacheManager extends AbstractCacheManager {
        constructor() {
            // @ts-ignore
            super(localStorage, new CacheManagerPropertyFactoryImpl());
        }
    }
    /**
     * 通过sessionStorage 进行存储数据
     */
    class SessionStorageCacheManager extends AbstractCacheManager {
        constructor() {
            // @ts-ignore
            super(sessionStorage, new CacheManagerPropertyFactoryImpl());
        }
    }
    /**
     * 通过内存对数据进行存储
     */
    class MemoryStorageCacheManager extends AbstractCacheManager {
        constructor() {
            // 内存数据集
            const memoryData = {};
            const memoryStorage = {
                getItem(key) {
                    return memoryData[key];
                },
                setItem(key, value) {
                    memoryData[key] = value;
                },
                removeItem(key) {
                    delete memoryData[key];
                }
            };
            super(memoryStorage, new CacheManagerPropertyFactoryImpl());
        }
    }

    class UnsetDataContract {
        encode(data) {
            Asserts$1.isNull(data, "数据不可为空!");
            return data;
        }
        decode(data) {
            Asserts$1.isNull(data, "数据不可为空!");
            return data;
        }
    }

    class GeneralDataCopier {
        /**
         * 深拷贝
         * @param val
         */
        deepClone(val) {
            var _a;
            Asserts$1.isNull(val, "数据不可为空!");
            return (_a = this.objectUtils) === null || _a === void 0 ? void 0 : _a.deepClone(val);
        }
        /**
         * 浅拷贝
         * @param val
         */
        simpleClone(val) {
            Asserts$1.isNull(val, "数据不可为空!");
            return Object.assign({}, val);
        }
    }
    __decorate([
        AutoWried()
    ], GeneralDataCopier.prototype, "objectUtils", void 0);

    class AppConfig {
        constructor() {
            this.cache = new CacheConfig();
            /**
             * 日期转json 格式化开关
             */
            this.dateToJsonFormat = true;
        }
    }
    class CacheConfig {
        constructor() {
            // 缓存类型
            this.type = "Local";
            // 插件的名称
            this.pluginName = "cacheManager";
            // 前缀
            this.prefix = "";
            // 过期检测
            this.ttlEnabled = true;
            // 过期检测的时间间隔 默认15秒检测一次
            this.ttlInterval = 15000;
        }
    }
    class AppStore {
        constructor() {
            // 插件
            this.plugins = {};
            // 插件的名称
            this.pluginsNames = [];
        }
        has(pluginName) {
            return !!this.plugins[pluginName];
        }
        /**
         * 使用插件
         * @param pluginName 插件名称
         * @param defaultPlugin 默认插件
         */
        getPlugin(pluginName, defaultPlugin) {
            let plugin = this.plugins[pluginName];
            if (!plugin) {
                if (defaultPlugin) {
                    // @ts-ignore
                    plugin = this.install(pluginName, defaultPlugin);
                }
                Asserts$1.isNull(plugin, "没有注入当前插件:" + pluginName);
            }
            return plugin.getProxy();
        }
        /**
         * 安装一个组件
         * @param pluginName 插件名称
         * @param plugin 插件
         * @param checkExist 是否检查已存在
         */
        install(pluginName, plugin, checkExist = false) {
            Asserts$1.isNull(plugin, "插件不可为空");
            let pluginProxy = this.plugins[pluginName];
            if (pluginProxy) {
                if (checkExist) {
                    // 插件已存在
                    return undefined;
                }
                if ("remove" in pluginProxy) {
                    pluginProxy.remove();
                }
                // 更新插件
                // @ts-ignore
                pluginProxy.setPlugin(plugin);
            }
            else {
                pluginProxy = new AppPluginProxy(plugin);
                this.pluginsNames.push(pluginName);
                this.plugins[pluginName] = pluginProxy;
            }
            if ("install" in plugin) {
                plugin.install();
            }
            return pluginProxy;
        }
        /**
         * 上下文准备好了 逐个调用插件里面的ready 方法
         */
        ready() {
            this.pluginsNames.forEach(pluginName => {
                const plugin = this.getPlugin(pluginName);
                if ("ready" in plugin) {
                    plugin.ready(this);
                }
            });
        }
        remove() {
            this.pluginsNames.forEach(pluginName => {
                const plugin = this.getPlugin(pluginName);
                if ("remove" in plugin) {
                    plugin.remove(this);
                }
            });
        }
    }
    class AppPluginProxy {
        constructor(plugin) {
            this._originalPlugin = plugin;
        }
        setPlugin(plugin) {
            this.originalPlugin = plugin;
        }
        getProxy() {
            if (!this.proxy) {
                this.proxy = new Proxy(this.originalPlugin, this);
            }
            return this.proxy;
        }
        defineProperty(target, p, attributes) {
            return Reflect.defineProperty(this.originalPlugin, p, attributes);
        }
        deleteProperty(target, p) {
            return Reflect.deleteProperty(this.originalPlugin, p);
        }
        enumerate(target) {
            // @ts-ignore
            return Reflect.enumerate(this.originalPlugin);
        }
        get(target, p, receiver) {
            return Reflect.get(this.originalPlugin, p);
        }
        getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(this.originalPlugin, p);
        }
        getPrototypeOf(target) {
            return Reflect.getPrototypeOf(this.originalPlugin);
        }
        has(target, p) {
            return Reflect.has(this.originalPlugin, p);
        }
        isExtensible(target) {
            return Reflect.isExtensible(this.originalPlugin);
        }
        ownKeys(target) {
            return Reflect.ownKeys(this.originalPlugin);
        }
        preventExtensions(target) {
            return Reflect.preventExtensions(this.originalPlugin);
        }
        set(target, p, value, receiver) {
            return Reflect.set(this.originalPlugin, p, value, receiver);
        }
        setPrototypeOf(target, v) {
            return Reflect.setPrototypeOf(this.originalPlugin, v);
        }
        get originalPlugin() {
            return this._originalPlugin;
        }
        set originalPlugin(value) {
            this._originalPlugin = value;
        }
    }

    class GeneralKeyBuilder {
        constructor() {
            this.splitter = "$";
        }
        buildKey(item, keys) {
            let pkey = "";
            if (Object.keys(item).length) {
                if (Array.isArray(keys)) {
                    keys.forEach((itemKey, idx) => {
                        pkey += item[itemKey] + this.splitter + idx;
                    });
                }
                else {
                    pkey = item[keys];
                }
            }
            else {
                // 如果传入的直接是字符串 或者日期 或者。。。。。
                pkey = item;
            }
            return pkey;
        }
    }
    class ArrayUtils {
        /**
         * 收集数组内部的值
         * @param arr 原本的数组
         * @param childKey 当前层级在上级的字段
         * @param fun(item) 处理当前层级的元素
         * @param deep 深度 往里面探索几个层级
         * @returns *[] 收集到的值
         */
        collectInnerVal(arr = [], childKey = ["children"], fun, deep = 1) {
            let newArr = [];
            if (!fun) {
                fun = {
                    buildValue(item) {
                        return item;
                    }
                };
            }
            // 当前的深度
            const curDeep = deep - 1;
            for (let i = 0; i < arr.length; i++) {
                const innerArr = arr[i][childKey[curDeep]] || [];
                if (curDeep === 0) {
                    newArr = newArr.concat(innerArr.map(item => fun.buildValue(item)));
                }
                else if (innerArr.length) {
                    // 递归往下找
                    newArr = newArr.concat(this.collectInnerVal(innerArr, childKey, fun, curDeep));
                }
            }
            return newArr;
        }
        /**
         * 将树转换成为数组
         * @param tree 树对象
         * @param idKey  对象的唯一主键
         * @param parentKey 父节点的主键
         * @param childKey 子数据在父对象中的属性名
         * @param removeRelation 移除关联字段
         */
        treeToArray(tree = [], idKey = "id", parentKey = "parentId", childKey = "children", removeRelation = false) {
            const data = [];
            if (!tree) {
                return data;
            }
            const _treeToArray = (node) => {
                if (!node) {
                    return;
                }
                data.push(node);
                const children = node[childKey] || [];
                children.forEach(child => {
                    child[parentKey] = node[idKey];
                    _treeToArray(child);
                });
                if (removeRelation) {
                    delete node[childKey];
                }
            };
            if (Array.isArray(tree)) {
                // 森林
                tree.forEach(node => {
                    _treeToArray(node);
                });
                return data;
            }
            // 单个树
            _treeToArray(tree);
            if (data === null || data === void 0 ? void 0 : data.length) {
                return data[0];
            }
            return [];
        }
        /**
         * 将一个数组转换成为一棵树
         * @param data  源数据数组
         * @param idKey  对象的唯一主键
         * @param parentKey 父节点的主键
         * @param childKey 子数据在父对象中的属性名
         */
        arrayToTree(data = [], idKey = "id", parentKey = "parentId", childKey = "children") {
            // 根节点数组
            const parentIds = new Set();
            const existParentIds = new Set();
            const dataMap = {};
            // 收集没有parentId 的数据 直接认为是最外层
            const noParentData = [];
            const noParentDataIds = [];
            data.forEach(function (item) {
                const id = item[idKey];
                // 处理当前节点
                let cur = dataMap[id];
                item[childKey] = cur ? cur[childKey] : [];
                dataMap[id] = item;
                // 处理父亲节点
                const parentId = item[parentKey];
                if (parentId) {
                    if (!existParentIds.has(parentId)) {
                        // 收集父节点的id
                        parentIds.add(parentId);
                        existParentIds.add(parentId);
                    }
                    let parent = dataMap[parentId];
                    if (!parent) {
                        dataMap[parentId] = parent = {
                            $temp: true
                        };
                        parent[childKey] = [];
                        parent[idKey] = parentId;
                    }
                    parentIds.delete(id);
                    existParentIds.add(id);
                    parent[childKey].push(item);
                }
                else {
                    noParentDataIds.push(id);
                    noParentData.push(item);
                }
            });
            const root = [];
            parentIds.forEach(pid => {
                if (noParentDataIds.indexOf(pid) === -1) {
                    const node = dataMap[pid];
                    if (node.$temp) {
                        root.push(...node[childKey]);
                    }
                    else {
                        root.push(node);
                    }
                }
            });
            root.push(...noParentData);
            return root;
        }
        /**
         * 对数组进行去重
         * @param data 源数据
         * @param key 属性
         * @param keyBuilder 唯一键的构建器
         */
        distinctArray(data = [], key = "", keyBuilder = new GeneralKeyBuilder()) {
            const keyLst = new Set();
            const distinctLst = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let pkey = keyBuilder.buildKey(item, key);
                if (!keyLst.has(pkey)) {
                    keyLst.add(pkey);
                    distinctLst.push(item);
                }
            }
            return distinctLst;
        }
        /**
         * 通过keys 获取Labels
         * @param data 数据集合
         * @param keys 关键字
         * @param labelKey 显示的label属性名
         * @param valueKey 值的属性名
         * @returns {*[]|*[]|[]}
         */
        getNamesByKeys(data = [], keys = [], labelKey = "label", valueKey = "value") {
            if (!keys || !keys.length) {
                return keys || [];
            }
            if (typeof keys === "string") {
                keys = keys.split(",");
            }
            // 将数组转换成为map
            const dataMap = this.toMap(data, valueKey, labelKey);
            const labels = [];
            keys.forEach(item => {
                const label = dataMap[item];
                labels.push(label);
            });
            return labels;
        }
        /**
         * 将数组转换成为对象
         * @param data 数据
         * @param keyBuilder 键构建器
         * @param valueBuilder 值构建器
         * @returns {{}}
         */
        toMap(data = [], keyBuilder, valueBuilder) {
            const map = {};
            if (typeof keyBuilder === "string") {
                const key = keyBuilder;
                keyBuilder = {
                    buildKey(item) {
                        return item[key];
                    }
                };
            }
            if (!valueBuilder) {
                valueBuilder = {
                    buildValue(item) {
                        return item;
                    }
                };
            }
            else if (typeof valueBuilder === "string") {
                const key = valueBuilder;
                valueBuilder = {
                    buildValue(item) {
                        return item[key];
                    }
                };
            }
            data.forEach(item => {
                const pkey = keyBuilder.buildKey(item);
                map[pkey] = valueBuilder.buildValue(item);
            });
            return map;
        }
        /**
         * 如果当前对象不是一个数组 那么将它包装为一个数组
         * @param obj
         */
        wrappedToArray(obj) {
            if (obj === undefined) {
                return [];
            }
            if (Array.isArray(obj)) {
                return obj;
            }
            return [obj];
        }
    }
    var arrayUtils = new ArrayUtils();

    class ObjectUtils {
        constructor() {
            this.typeMapping = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regExp",
                "[object Undefined]": "undefined",
                "[object Null]": "null",
                "[object Object]": "object",
                "[object Promise]": "Promise"
            };
        }
        /**
         * 对象是否为promise
         * @param val
         */
        isPromise(val) {
            return val && typeof val === "object" && val.then && typeof val.then === "function";
        }
        /**
         * 对象是否为数组
         * @param val
         */
        isArray(val) {
            return Array.isArray(val);
        }
        /**
         * 对象是否为函数
         * @param val
         */
        isFunction(val) {
            return this.getObjType(val) === "function";
        }
        /**
         * 是否为对象
         * @param val
         */
        isObject(val) {
            return this.getObjType(val) === "object";
        }
        addObjType(obj, typeName) {
            let toString = Object.prototype.toString;
            this.typeMapping[toString.call(obj)] = typeName;
        }
        getConstructorName(obj) {
            var _a;
            const constructorName = (_a = obj === null || obj === void 0 ? void 0 : obj.constructor) === null || _a === void 0 ? void 0 : _a.name;
            if (constructorName) {
                // 如果有构造函数 则构造函数名字就是当前对象的类型
                return constructorName;
            }
        }
        getObjType(obj) {
            const constructorName = this.getConstructorName(obj);
            if (constructorName) {
                return constructorName.toLowerCase();
            }
            let toString = Object.prototype.toString;
            // if (Element && obj instanceof Element) {
            //     return "element";
            // }
            const typeString = toString.call(obj);
            const type = this.typeMapping[typeString];
            if (type) {
                return type;
            }
            if (typeString.startsWith("[") && typeString.endsWith("]")) {
                return typeString.replace("[object ", "").replace("]", "");
            }
            return typeString;
        }
        deepClone(data, map = new WeakMap()) {
            let type = this.getObjType(data);
            if (Array.isArray(data)) {
                let obj = map.get(data);
                if (!obj) {
                    obj = [];
                    map.set(data, obj);
                    for (let i = 0, len = data.length; i < len; i++) {
                        data[i] = (() => {
                            if (data[i] === 0) {
                                return data[i];
                            }
                            return data[i];
                        })();
                        if (data[i]) {
                            delete data[i].$parent;
                        }
                        obj.push(this.deepClone(data[i], map));
                    }
                }
                return obj;
            }
            else if (type === "object") {
                let obj = map.get(data);
                if (!obj) {
                    obj = {};
                    map.set(data, obj);
                    for (let key in data) {
                        if (data) {
                            delete data.$parent;
                        }
                        obj[key] = this.deepClone(data[key], map);
                    }
                }
                return obj;
            }
            return data;
        }
        /**
         * 判断对象为空
         * @param obj
         */
        isEmpty(obj) {
            if (obj === undefined) {
                return true;
            }
            const type = this.getObjType(obj);
            if (type === "string" && "" === obj) {
                return true;
            }
            if (type === "array" && !obj.length) {
                return true;
            }
            if (obj.isEmpty && obj.isEmpty()) {
                return true;
            }
            return false;
        }
        /**
         * 判断对象为非空
         * @param obj
         */
        isNotEmpty(obj) {
            return !this.isEmpty(obj);
        }
    }
    var objectUtils = new ObjectUtils();

    /**
     * 日期工具类
     */
    class DateUtils {
        /**
         * 获取时间
         * @param date
         * @returns {*}
         */
        getDate(date) {
            if (date == null)
                date = new Date();
            if (typeof date === "string") {
                date = this.stringToDate(date);
            }
            return date;
        }
        /**
         * 日期转字符串
         * @param fmt
         * @param date
         * @returns {*}
         */
        dateToString(date, fmt) {
            let ret;
            if (!date) {
                return "";
            }
            if (!fmt) {
                fmt = "yyyy-MM-dd";
            }
            date = this.getDate(date);
            const opt = {
                "y+": date.getFullYear().toString(),
                "M+": (date.getMonth() + 1).toString(),
                "d+": date.getDate().toString(),
                "H+": date.getHours().toString(),
                "m+": date.getMinutes().toString(),
                "s+": date.getSeconds().toString() // 秒
                // 有其他格式化字符需求可以继续添加，必须转化成字符串
            };
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (ret) {
                    fmt = fmt.replace(ret[1], ret[1].length === 1 ? opt[k] : this.padStart(opt[k], ret[1].length, "0"));
                }
            }
            return fmt;
        }
        /**
         * 字符串转日期 yyyy-MM-dd HH:mm:ss
         * @param str 时间字符串
         * @param format 时间格式
         */
        stringToDate(str, format) {
            Asserts$1.isEmpty(str, "时间字符串不能为空!");
            if (format) {
                // 先设置默认的年月日时分秒
                let year = "1970", month = "01", day = "01", hour = "00", minute = "00", second = "00";
                let idx = format.indexOf("yyyy");
                if (idx > -1) {
                    year = str.substring(idx, idx + 4);
                }
                idx = format.indexOf("MM");
                if (idx > -1) {
                    month = str.substring(idx, idx + 2);
                }
                idx = format.indexOf("dd");
                if (idx > -1) {
                    day = str.substring(idx, idx + 2);
                }
                // 不考虑12小时 即hh
                idx = format.indexOf("HH");
                if (idx > -1) {
                    hour = str.substring(idx, idx + 2);
                }
                idx = format.indexOf("mm");
                if (idx > -1) {
                    minute = str.substring(idx, idx + 2);
                }
                idx = format.indexOf("ss");
                if (idx > -1) {
                    second = str.substring(idx, idx + 2);
                }
                // 重新组装字符串
                str = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
            }
            return new Date(str.replace(/-/g, "/"));
        }
        /**
         * 源串左侧补字符
         * @param source 源串
         * @param length 补全之后的长度
         * @param char
         */
        padStart(source, length, char) {
            // 补全后的结果
            let result = "";
            // 需要补全的长度
            let len = 0;
            // 根据source是否为空对数据进行处理
            source ? (len = length - source.length) : (source = "");
            for (let i = 0; i < len; i++) {
                result += char;
            }
            return result + source;
        }
        /**
         * 日期加减
         * @param date
         * @param num
         * @returns {Date}
         */
        addDay(date, num) {
            date = this.getDate(date);
            let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            newDate.setDate(newDate.getDate() + num);
            return newDate;
        }
        /**
         * 月份加减
         * @param date
         * @param num
         */
        addMonth(date, num) {
            date = this.getDate(date);
            let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            newDate.setMonth(newDate.getMonth() + num);
            return newDate;
        }
        /**
         * 年份加减
         * @param date
         * @param num
         */
        addYear(date, num) {
            date = this.getDate(date);
            let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            newDate.setFullYear(newDate.getFullYear() + num);
            return newDate;
        }
        /**
         * 获取日期是周几
         * @param date
         * @param weeks
         * @returns {string}
         */
        getWeekDate(date, weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]) {
            if (!date) {
                return "";
            }
            let day = this.getDate(date).getDay();
            return weeks[day];
        }
        /**
         * 计算两个日期之间的天数差
         * @param firstDate
         * @param secondDate
         * @returns {string}
         */
        subDay(firstDate, secondDate) {
            const begainDate = this.getDate(firstDate);
            const endingDate = this.getDate(secondDate);
            const diff = Math.abs(begainDate.getTime() - endingDate.getTime());
            return parseInt(String(diff / (1000 * 60 * 60 * 24)));
        }
        /**
         * 计算两个日期之间的月份差
         * date1，date2
         */
        subMonth(date1, date2) {
            date1 = this.dateToString(date1, "yyyy-MM-dd");
            date2 = this.dateToString(date2, "yyyy-MM-dd");
            //用-分成数组
            const date1Arr = date1.split("-");
            const date2Arr = date2.split("-");
            //获取年,月数
            const year1 = parseInt(date1Arr[0]), year2 = parseInt(date2Arr[0]), month1 = parseInt(date1Arr[1]), month2 = parseInt(date2Arr[1]);
            return Math.abs((year2 - year1) * 12 + (month2 - month1) + 1);
        }
        /**
         * 计算两个日期之间的年份差
         * date1，date2
         */
        subYear(date1, date2) {
            date1 = this.dateToString(date1, "yyyy-MM-dd");
            date2 = this.dateToString(date2, "yyyy-MM-dd");
            //用-分成数组
            //用-分成数组
            const date1Arr = date1.split("-");
            const date2Arr = date2.split("-");
            //获取年,月数
            const year1 = parseInt(date1Arr[0]), year2 = parseInt(date2Arr[0]);
            return Math.abs((year2 - year1));
        }
        /**
         * 计算某一月份有多少天，如果用户不传date,则默认查找当前月份
         */
        getDaysOfMonths(date) {
            let curDate;
            if (!date) {
                curDate = new Date();
            }
            else {
                curDate = this.getDate(date);
            }
            /* 获取当前月份 */
            const curMonth = curDate.getMonth();
            /*  生成实际的月份: 由于curMonth会比实际月份小1, 故需加1 */
            curDate.setMonth(curMonth + 1);
            /* 将日期设置为0, 这里为什么要这样设置, 我不知道原因, 这是从网上学来的 */
            curDate.setDate(0);
            /* 返回当月的天数 */
            return curDate.getDate();
        }
        /**
         * 获取区间内的所有日期
         * @param startDate 开始日期
         * @param endDate 结束日期
         * @param returnDate 返回日期类型
         */
        getDatesInRange(startDate, endDate, returnDate = true) {
            const date_all = [];
            let i = 0;
            let startDateStr = this.dateToString(startDate, DateUtils.date_formatter_short);
            // 复制一份开始日期
            const endDateStr = this.dateToString(endDate, DateUtils.date_formatter_short);
            let startDateClone = this.stringToDate(startDateStr);
            do {
                if (returnDate) {
                    date_all[i] = this.stringToDate(startDateStr);
                }
                else {
                    date_all[i] = startDateStr;
                }
                startDateClone.setDate(startDateClone.getDate() + 1);
                startDateStr = this.dateToString(startDateClone, DateUtils.date_formatter_short);
                i++;
            } while (endDateStr.localeCompare(startDateStr) !== -1);
            return date_all;
        }
        /**
         * 格式化日期
         * 将日期进行格式化
         * @param date 日期对象
         * @param format 单位  year 年 month 月 day 日 hour 小时 minute 分钟
         */
        trunc(date, format = "day") {
            // 获取日期格式的日期
            date = this.getDate(date);
            let dateStr = "";
            switch (format) {
                case "year":
                    dateStr = this.dateToString(date, "yyyy") + "-01-01 00:00:00";
                    break;
                case "month":
                    dateStr = this.dateToString(date, "yyyy-MM") + "-01 00:00:00";
                    break;
                case "day":
                    dateStr = this.dateToString(date, "yyyy-MM-dd") + " 00:00:00";
                    break;
                case "hour":
                    dateStr = this.dateToString(date, "yyyy-MM-dd HH") + " :00:00";
                    break;
                case "minute":
                    dateStr = this.dateToString(date, "yyyy-MM-dd HH:mm") + ":00";
                    break;
            }
            return this.stringToDate(dateStr, DateUtils.date_formatter_long);
        }
        /**
         * 获取本月第一天
         * @param date
         */
        getFirstDayOfMonth(date) {
            // 获取日期格式的日期
            return this.stringToDate(this.dateToString(date, "yyyy-MM") + "-01", DateUtils.date_formatter_short);
        }
        /**
         * 获取本月最后一天
         * @param date
         */
        getLastDayOfMonth(date) {
            date = this.getDate(date);
            return this.addDay(this.addMonth(date, 1), -1);
        }
    }
    /**格式为yyyy-MM-dd HH:mm:ss*/
    // 年月日 时分秒
    DateUtils.date_formatter_long = "yyyy-MM-dd HH:mm:ss";
    /**格式为yyyy-MM-dd*/
    // 年月日
    DateUtils.date_formatter_short = "yyyy-MM-dd";
    var dateUtils = new DateUtils();

    class MathUtils {
        isEmpty(val) {
            if (typeof (val) == "undefined")
                return true;
            if (val == null || val == "null" || val == "undefined")
                return true;
            return (val + "").replace(/　/g, "").trim() == "";
        }
        /* 质朴长存法 补0 */
        pad(num, n) {
            let len = num.toString().length;
            while (len < n) {
                num = "0" + num;
                len++;
            }
            return num;
        }
        //数值相加
        numberValueAdd(arg1, arg2) {
            let r1, r2, m;
            try {
                r1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            const r = this.numberValueMultiply(arg1, m) + this.numberValueMultiply(arg2, m);
            let result = this.numberValueDivide(r, m);
            if (isNaN(result)) {
                result = 0;
            }
            return result;
        }
        //数值相减
        numberValueSubtract(arg1, arg2) {
            let r1, r2, m;
            try {
                r1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            const r = this.numberValueMultiply(arg1, m) - this.numberValueMultiply(arg2, m);
            let result = this.numberValueDivide(r, m);
            if (isNaN(result)) {
                result = 0;
            }
            return result;
        }
        //数值相除
        numberValueDivide(arg1, arg2) {
            if (arg2 === 0)
                return 0;
            let t1 = 0, t2 = 0, r1, r2;
            if (this.isEmpty(arg1))
                arg1 = 0;
            if (this.isEmpty(arg2)) {
                arg2 = 1;
                arg1 = 0;
            }
            try {
                t1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
            }
            try {
                t2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
            }
            r1 = Number(arg1.toString().replace(".", ""));
            r2 = Number(arg2.toString().replace(".", ""));
            return (r1 / r2) * Math.pow(10, t2 - t1);
        }
        //数值相乘
        numberValueMultiply(arg1, arg2) {
            if (this.isEmpty(arg1))
                arg1 = 0;
            if (this.isEmpty(arg2))
                arg2 = 0;
            let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
            try {
                m += s1.split(".")[1].length;
            }
            catch (e) {
            }
            try {
                m += s2.split(".")[1].length;
            }
            catch (e) {
            }
            let result = Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
            if (isNaN(result)) {
                result = 0;
            }
            return result;
        }
        //保留几位小数
        changeDp(val, dp) {
            let f_x = parseFloat(val);
            if (isNaN(f_x)) {
                return 0;
            }
            const dpVal = Math.pow(10, dp);
            f_x = this.numberValueDivide(Math.round(this.numberValueMultiply(f_x, dpVal)), dpVal);
            return f_x;
        }
    }
    var mathUtils = new MathUtils();

    class FunctionUtils {
        /**
         * 包装一个对象中的目标方法
         * @param target 目标对象
         * @param fnName 方法名
         * @param wrapperFn 包装函数
         */
        proxy(target, fnName, wrapperFn) {
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
                    const done = () => {
                        return _originalFn.call(target, ..._args);
                    };
                    if (wrapperFn) {
                        return wrapperFn(done, ..._args);
                    }
                    else {
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
        invokeOriginal(target, fnName, ..._args) {
            if (target._orginal) {
                const fn = target._orginal[fnName];
                if (fn) {
                    return fn.call(target, ..._args);
                }
            }
        }
    }
    const functionUtils = new FunctionUtils();

    /**
     * 安装器 里面实现配置信息的解析
     * @param hook 钩子
     * @param appConfig 配置对象
     */
    const installer = (hook = {}, appConfig = new AppConfig()) => {
        const appStore = new AppStore();
        setCurrentAppStore(appStore);
        // 执行钩子函数
        hook.compiled && hook.compiled(appConfig, appStore);
        // 安装一些必要的工具类
        installIfNecessary(appStore, true);
        // 设置日期转json格式化
        if (appConfig.dateToJsonFormat) {
            setDateToJsonFormat(appStore);
        }
        // 安装缓存管理器
        appConfig.cache && installCacheManager(appStore, appConfig.cache);
        hook.beforeReady && hook.beforeReady(appStore);
        // 准备好上下文环境
        appStore.ready();
        hook.afterReady && hook.afterReady(appStore);
        return appStore;
    };
    // 安装缓存管理器
    const installCacheManager = (appStore, cacheConfig) => {
        if (!cacheConfig) {
            return;
        }
        appStore.install("cacheRegionBuilder", new GeneralCacheRegionBuilder(cacheConfig), true);
        const pluginName = cacheConfig.pluginName || "cacheManager";
        let cacheManager;
        if (appStore.has(pluginName)) {
            cacheManager = appStore.getPlugin(pluginName);
        }
        else {
            switch (cacheConfig.type) {
                case "Memory":
                    cacheManager = new MemoryStorageCacheManager();
                    break;
                case "Session":
                    cacheManager = new SessionStorageCacheManager();
                    break;
                default:
                    cacheManager = new LocalStorageCacheManager();
                    break;
            }
            appStore.install(pluginName, cacheManager);
        }
        // 设置属性信息
        cacheManager.setTtlEnabled(cacheConfig.ttlEnabled);
        cacheManager.setTtlInterval(cacheConfig.ttlInterval);
    };
    function setDateToJsonFormat(appStore) {
        /*
         * 重写时间的toJSON方法，因为在调用JSON.stringify的时候，时间转换就调用的toJSON，这样会导致少8个小时，所以重写它的toJSON方法
         */
        Date.prototype.toJSON = function () {
            // 从插件中获取到
            const dateUtils = appStore.getPlugin("dateUtils");
            return dateUtils.dateToString(this, "yyyy-MM-dd HH:mm:ss"); // util.formatDate是自定义的个时间格式化函数
        };
    }
    // 安装一些必须要的插件
    function installIfNecessary(appStore, checkExist = true) {
        appStore.install("objectUtils", objectUtils, checkExist);
        appStore.install("arrayUtils", arrayUtils, checkExist);
        appStore.install("dateUtils", dateUtils, checkExist);
        // 数据编解码插件
        appStore.install("dataContract", new UnsetDataContract(), checkExist);
        // 对象拷贝器
        appStore.install("dataCopier", new GeneralDataCopier(), checkExist);
        // 数学工具类
        appStore.install("mathUtils", mathUtils, checkExist);
        // 函数工具类
        appStore.install("functionUtils", functionUtils, checkExist);
    }

    exports.AbstractCacheManager = AbstractCacheManager;
    exports.AppConfig = AppConfig;
    exports.AppStore = AppStore;
    exports.ArrayUtils = ArrayUtils;
    exports.Asserts = Asserts;
    exports.AutoWried = AutoWried;
    exports.CacheConfig = CacheConfig;
    exports.CacheRegion = CacheRegion;
    exports.ConsoleErrorHandler = ConsoleErrorHandler;
    exports.DateUtils = DateUtils;
    exports.FunctionUtils = FunctionUtils;
    exports.GeneralCacheRegionBuilder = GeneralCacheRegionBuilder;
    exports.GeneralDataCopier = GeneralDataCopier;
    exports.GeneralKeyBuilder = GeneralKeyBuilder;
    exports.GeneralTimer = GeneralTimer;
    exports.LocalStorageCacheManager = LocalStorageCacheManager;
    exports.MathUtils = MathUtils;
    exports.MemoryStorageCacheManager = MemoryStorageCacheManager;
    exports.ObjectUtils = ObjectUtils;
    exports.SessionStorageCacheManager = SessionStorageCacheManager;
    exports.UnsetDataContract = UnsetDataContract;
    exports.functionUtils = functionUtils;
    exports.installer = installer;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
