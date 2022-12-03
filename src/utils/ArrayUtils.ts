export declare interface KeyBuilder {

    buildKey(item: any, keys?: Array<string> | string): string;
}

export declare interface ValueBuilder {

    buildValue(item: any): any;
}

export class GeneralKeyBuilder implements KeyBuilder {

    splitter = "$";

    buildKey(item: any, keys: Array<string> | string): string {
        let pkey: string = "";
        if (Object.keys(item).length) {
            if (Array.isArray(keys)) {
                keys.forEach((itemKey, idx) => {
                    pkey += item[itemKey] + this.splitter + idx;
                });
            } else {
                pkey = item[keys];
            }
        } else {
            // 如果传入的直接是字符串 或者日期 或者。。。。。
            pkey = item;
        }
        return pkey;
    }
}

export class ArrayUtils {
    /**
     * 收集数组内部的值
     * @param arr 原本的数组
     * @param childKey 当前层级在上级的字段
     * @param fun(item) 处理当前层级的元素
     * @param deep 深度 往里面探索几个层级
     * @returns *[] 收集到的值
     */
    collectInnerVal(arr: any[] = [], childKey = ["children"], fun: ValueBuilder, deep: number = 1) {
        let newArr: any[] = [];
        if (!fun) {
            fun = {
                buildValue(item) {
                    return item;
                }
            };
        }
        // 当前的深度
        const curDeep: number = deep - 1;
        for (let i = 0; i < arr.length; i++) {
            const innerArr: any[] = arr[i][childKey[curDeep]] || [];
            if (curDeep === 0) {
                newArr = newArr.concat(innerArr.map(item => fun.buildValue(item)));
            } else if (innerArr.length) {
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
    treeToArray<T extends Record<string, any>>(tree: T | T[] = [],
                                               idKey = "id",
                                               parentKey = "parentId",
                                               childKey = "children",
                                               removeRelation = false): T[] {
        const data: Array<any> = [];
        if (!tree) {
            return data;
        }
        const _treeToArray = (node: T) => {
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
        if (data?.length) {
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
    arrayToTree(data: any[] = [],
                idKey = "id",
                parentKey = "parentId",
                childKey = "children"
    ) {
        // 根节点数组
        const parentIds = new Set<any>();
        const existParentIds = new Set();
        const dataMap: { [key: string]: any } = {};
        // 收集没有parentId 的数据 直接认为是最外层
        const noParentData: any[] = [];
        const noParentDataIds: any[] = [];
        data.forEach(function (item: { [key: string]: any }) {
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
                    dataMap[parentId] = parent = {};
                    parent[childKey] = [];
                    parent[idKey] = parentId;
                }
                parentIds.delete(id);
                existParentIds.add(id);
                parent[childKey].push(item);
            } else {
                noParentDataIds.push(id);
                noParentData.push(item);
            }
        });
        const root: any[] = [];
        parentIds.forEach(pid => {
            if (noParentDataIds.indexOf(pid) === -1) {
                root.push(dataMap[pid]);
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
    distinctArray(data: any[] = [], key: string = "", keyBuilder: KeyBuilder = new GeneralKeyBuilder()) {
        const keyLst = new Set();
        const distinctLst: string[] = [];
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
    getNamesByKeys(data: any[] = [], keys: Array<string> | string = [], labelKey = "label", valueKey = "value") {
        if (!keys || !keys.length) {
            return keys || [];
        }
        if (typeof keys === "string") {
            keys = (keys as string).split(",");
        }
        // 将数组转换成为map
        const dataMap = this.toMap(data, valueKey, labelKey);
        const labels: string[] = [];
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
    toMap(data: Array<any> = [], keyBuilder: KeyBuilder | string, valueBuilder: ValueBuilder | string) {
        const map: { [key: string]: any } = {};
        if (typeof keyBuilder === "string") {
            const key = (keyBuilder as string);
            keyBuilder = {
                buildKey(item: any) {
                    return item[key];
                }
            };
        }
        if (!valueBuilder) {
            valueBuilder = {
                buildValue(item: any) {
                    return item;
                }
            };
        } else if (typeof valueBuilder === "string") {
            const key = (valueBuilder as string);
            valueBuilder = {
                buildValue(item: { [x: string]: any; }) {
                    return item[key];
                }
            };
        }
        data.forEach(item => {
            const pkey = (keyBuilder as KeyBuilder).buildKey(item);
            map[pkey] = (valueBuilder as ValueBuilder).buildValue(item);
        });
        return map;
    }

    /**
     * 如果当前对象不是一个数组 那么将它包装为一个数组
     * @param obj
     */
    wrappedToArray(obj: any): Array<any> {
        if (obj === undefined) {
            return [];
        }
        if (Array.isArray(obj)) {
            return obj;
        }
        return [obj];
    }
}

export default new ArrayUtils();


