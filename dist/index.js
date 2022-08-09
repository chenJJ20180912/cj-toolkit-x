(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.index = global.index || {}));
})(this, (function (exports) { 'use strict';

    /**
     * 控制台打印日志
     */
    class ConsoleErrorHandler {
        error(args, msg) {
            console.error(args);
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
            if (val === undefined || val === '' || val === null) {
                handler.error([val], msg);
            }
        }
        isNotNull(val, msg, handler = this._defaultErrorHandler) {
            if (val !== undefined && val !== '' && val !== null) {
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

    class AppConfig {
        constructor() {
            this.cache = new CacheConfig();
        }
    }
    class CacheConfig {
        constructor() {
            // 缓存类型
            this.type = "Local";
            // 插件的名称
            this.pluginName = "cacheManager";
            // 过期检测
            this.ttlEnabled = true;
            // 过期检测的时间间隔
            this.ttlInterval = 1000;
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
         * @param pluginName
         */
        getPlugin(pluginName) {
            const plugin = this.plugins[pluginName];
            Asserts$1.isNull(plugin, "没有注入当前插件:" + pluginName);
            return plugin;
        }
        /**
         * 安装一个组件
         * @param pluginName
         * @param plugin
         */
        install(pluginName, plugin) {
            Asserts$1.isNull(plugin, "插件不可为空");
            const oldPlugin = this.plugins[pluginName];
            if (oldPlugin && "remove" in oldPlugin) {
                oldPlugin.remove(this);
            }
            else {
                this.pluginsNames.push(pluginName);
            }
            this.plugins[pluginName] = plugin;
            if (plugin && "install" in plugin) {
                plugin.install(this);
            }
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
            console.log("appStore is ready!");
            console.log(this);
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
                "[object Object]": "object"
            };
        }
        isObject(val) {
            return this.getObjType(val) === 'object';
        }
        addObjType(obj, typeName) {
            let toString = Object.prototype.toString;
            this.typeMapping[toString.call(obj)] = typeName;
        }
        getObjType(obj) {
            let toString = Object.prototype.toString;
            if (obj instanceof Element) {
                return "element";
            }
            return this.typeMapping[toString.call(obj)];
        }
        deepClone(data) {
            let type = this.getObjType(data);
            if (Array.isArray(data)) {
                let obj = [];
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
                    obj.push(this.deepClone(data[i]));
                }
                return obj;
            }
            else if (type === "object") {
                let obj = {};
                for (let key in data) {
                    if (data) {
                        delete data.$parent;
                    }
                    obj[key] = this.deepClone(data[key]);
                }
                return obj;
            }
            return data;
        }
    }
    var objectUtils = new ObjectUtils();

    class GeneralDataCopier {
        /**
         * 深拷贝
         * @param val
         */
        deepClone(val) {
            Asserts$1.isNull(val, "数据不可为空!");
            return objectUtils.deepClone(val);
        }
        /**
         * 浅拷贝
         * @param val
         */
        simpleClone(val) {
            Asserts$1.isNull(val, "数据不可为空!");
            return JSON.parse(JSON.stringify(val));
        }
    }

    class GeneralTimer {
        constructor(interval = 15000) {
            /**
             * 是否启用定时器
             */
            this.enabled = true;
            this.interval = interval;
        }
        start(targetFun, that) {
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
        setEnabled(enabled) {
            this.enabled = enabled;
        }
        setInterval(interval = 15000) {
            this.interval = interval;
        }
    }

    class CacheManagerPropertyFactoryImpl {
        newCacheRegion(cache, key, val) {
            return new CacheRegion(cache, key, val);
        }
        newTimer() {
            return new GeneralTimer();
        }
    }
    /**
     * 抽象的缓存管理器
     */
    class AbstractCacheManager {
        constructor(storageProvider, cacheManagerPropertyFactory) {
            // 内部的数据存储对象
            this._reginData = {};
            // 同步数据的任务队列 存储的是需要修改的缓存的名称
            this._queue = new Set();
            this.cacheManagerPropertyFactory = cacheManagerPropertyFactory;
            this.storageProvider = storageProvider;
            this.ttlTimer = cacheManagerPropertyFactory.newTimer();
        }
        install(app) {
            this._app = app;
        }
        ready(app) {
            this.ttlTimer.start(() => {
                Object.keys(this._reginData).forEach(reginName => {
                    const region = this.getRegion(reginName);
                    // 缓存已经过期了
                    if (region.isInvalid()) {
                        // 重置缓存区域
                        this.resetRegion(reginName);
                    }
                });
            });
        }
        remove(app) {
            // 清除定时器
            this.ttlTimer.stop();
            return this;
        }
        setTtlEnabled(ttlEnable) {
            this.ttlTimer.setEnabled(ttlEnable);
        }
        setTtlInterval(ttlInterval) {
            this.ttlTimer.setInterval(ttlInterval);
        }
        /**
         * 初始化缓存区域
         * @param region 缓存区域
         * @param val 初始值
         * @param ttl 过期时间
         */
        initRegion(region, val, ttl = -1) {
            Asserts$1.isNull(region, "缓存区域不可为空!");
            this._reginData[region] = this.cacheManagerPropertyFactory.newCacheRegion(this, region, val);
            this.ttl(region, ttl);
            this.onChange(region);
        }
        /**
         * 重置缓存区域
         * @param region
         */
        resetRegion(region) {
            // 清除掉区域内的所有数据
            this.getRegion(region).clearValue();
            this.onChange(region);
        }
        /**
         * 获取缓存区域
         * @param region
         * @private
         */
        getRegion(region) {
            Asserts$1.isNull(region, "缓存区域不可为空!");
            let cacheRegion = this._reginData[region];
            if (!cacheRegion) {
                cacheRegion = this._reginData[region] = this.cacheManagerPropertyFactory.newCacheRegion(this, region);
            }
            return cacheRegion;
        }
        setValue(region, key, value) {
            const cacheRegion = this.getRegion(region);
            cacheRegion.setValue(key, value);
            this.onChange(region);
        }
        getValue(region, key) {
            const cacheRegion = this.getRegion(region);
            const val = cacheRegion.getValue(key);
            if (val !== undefined) {
                return this.deepClone(val);
            }
        }
        setRegionData(region, val, ttl = -1) {
            const cacheRegion = this.getRegion(region);
            cacheRegion.setRegionData(val);
            this.ttl(region, -1);
            this.onChange(region);
        }
        getRegionData(region) {
            const cacheRegion = this.getRegion(region);
            const val = cacheRegion.getRegionData();
            if (val !== undefined) {
                return this.deepClone(val);
            }
        }
        /**
         * 深克隆当前对象
         * @param val
         */
        deepClone(val) {
            if (this._app) {
                return this._app.getPlugin("dataCopier").deepClone(val);
            }
            return val;
        }
        encodeData(val) {
            if (!this._app) {
                return val;
            }
            return this._app.getPlugin("dataContract").encode(val);
        }
        decodeData(val) {
            if (!this._app) {
                return val;
            }
            return this._app.getPlugin("dataContract").decode(val);
        }
        /**
         * 当前region 发生改变
         * @param region
         */
        onChange(region) {
            if (!!this._queue.size) {
                setTimeout(() => {
                    this.sync();
                }, 0);
            }
            this._queue.add(region);
        }
        /**
         * 持久化数据
         */
        sync() {
            // 获取需要持久化的区域
            const taskQueue = [];
            this._queue.forEach(regionName => {
                taskQueue.push(regionName);
            });
            // 清空任务队列
            this._queue.clear();
            // 逐个执行持久化
            taskQueue.forEach(reginName => {
                this.getRegion(reginName).sync();
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
            this._data[key] = this._cacheManager.deepClone(val);
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
            this._cacheManager.storageProvider.setItem(this._regionName, this._cacheManager.encodeData(JSON.stringify(this._data)));
        }
        /**
         * 清除数据
         */
        clearValue() {
            this._empty = true;
            this.ttl = -1;
            // 移除对象上的值
            Object.keys(this._data).forEach(p => {
                delete this._data[p];
            });
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
         * 将一个数组转换成为一棵树
         * @param data  源数据数组
         * @param idKey  对象的唯一主键
         * @param parentKey 父节点的主键
         * @param childKey 子数据在父对象中的属性名
         * @param defaultParentIdId 为数据上parentId为空的数据设置默认的parentId
         */
        arrayToTree(data = [], idKey = "id", parentKey = "parentId", childKey = "children", defaultParentIdId = "_root") {
            // 根节点数组
            const parentIds = new Set();
            const existParentIds = new Set();
            const dataMap = {};
            data.forEach(function (item) {
                const id = item[idKey];
                // 处理当前节点
                let cur = dataMap[id];
                item[childKey] = cur ? cur[childKey] : [];
                dataMap[id] = item;
                // 处理父亲节点
                const parentId = item[parentKey] || defaultParentIdId;
                if (parentId) {
                    if (!existParentIds.has(parentId)) {
                        // 收集父节点的id
                        parentIds.add(parentId);
                        existParentIds.add(parentId);
                    }
                    let parent = dataMap[parentId];
                    if (!parent) {
                        dataMap[parentId] = parent = {};
                        parent[childKey] = [];
                        parent[idKey] = parentId;
                    }
                    parentIds.delete(id);
                    existParentIds.add(id);
                    parent[childKey].push(item);
                }
            });
            const root = [];
            if (dataMap[defaultParentIdId]) {
                (dataMap[defaultParentIdId].children || []).forEach(data => {
                    root.push(data);
                });
            }
            else {
                parentIds.forEach(pid => {
                    root.push(dataMap[pid]);
                });
            }
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
         *      * @param data 数据集合
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
    }
    var arrayUtils = new ArrayUtils();

    /**
     * 日期工具类
     */
    class DateUtils {
        constructor() {
            /**格式为yyyy-MM-dd HH:mm:ss*/
            // 年月日 时分秒
            this.date_formatter_long = "yyyy-MM-dd HH:mm:ss";
            /**格式为yyyy-MM-dd*/
            // 年月日
            this.date_formatter_short = "yyyy-MM-dd";
        }
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
            if (!date) {
                return undefined;
            }
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
            if (!date) {
                return undefined;
            }
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
            if (!date) {
                return undefined;
            }
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
            let startDateStr = this.dateToString(startDate, this.date_formatter_short);
            // 复制一份开始日期
            const endDateStr = this.dateToString(endDate, this.date_formatter_short);
            let startDateClone = this.stringToDate(startDateStr);
            do {
                if (returnDate) {
                    date_all[i] = this.stringToDate(startDateStr);
                }
                else {
                    date_all[i] = startDateStr;
                }
                startDateClone.setDate(startDateClone.getDate() + 1);
                startDateStr = this.dateToString(startDateClone, this.date_formatter_short);
                i++;
            } while (endDateStr.localeCompare(startDateStr) !== -1);
            return date_all;
        }
    }
    var dateUtils = new DateUtils();

    // 构建一个appStore对象
    const appStore = new AppStore();
    // 安装一些工具类
    appStore.install("objectUtils", objectUtils);
    appStore.install("arrayUtils", arrayUtils);
    appStore.install("dateUtils", dateUtils);
    // 数据编解码插件
    appStore.install("dataContract", new UnsetDataContract());
    //
    appStore.install("dataCopier", new GeneralDataCopier());
    const appConfig = new AppConfig();
    /**
     * 安装器 里面实现配置信息的解析
     * @param hook 钩子
     */
    const installer = (hook) => {
        hook.compiled && hook.compiled(appConfig, appStore);
        // 安装缓存管理器
        appConfig.cache && installCacheManager(appConfig.cache);
        hook.beforeReady && hook.beforeReady(appStore);
        // 准备好上下文环境
        appStore.ready();
        hook.afterReady && hook.afterReady(appStore);
    };
    // 安装缓存管理器
    const installCacheManager = (cacheConfig) => {
        if (!cacheConfig) {
            return;
        }
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

    exports.appConfig = appConfig;
    exports.appStore = appStore;
    exports.installer = installer;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
