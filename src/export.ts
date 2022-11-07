import * as timer from "./timer";
import * as cache from "./cache";
import * as Contract from "./data/Contract";
import * as Copier from "./data/Copier";
import * as manager from "./manager";
import * as ArrayUtils from "./utils/ArrayUtils";
import * as ObjectUtils from "./utils/ObjectUtils";
import * as DateUtils from "./utils/DateUtils";
import * as MathUtils from "./utils/MathUtils";
import * as Asserts from "./utils/Asserts";

export const allConstructs = {
    ...timer,// 定时器
    ...cache,// 缓存
    ...Contract, // 数据加密解密
    ...Copier,// 数据赋值
    ...manager,// 管理器
    ...ArrayUtils,// 数组工具
    ...ObjectUtils,// 对象工具
    ...DateUtils,// 日期工具类
    ...MathUtils,// 数学方面
    ...Asserts// 断言
};
