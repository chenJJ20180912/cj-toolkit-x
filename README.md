js:

```javascript
import {
    appStore,
    installer
} from "cj-toolkit-x/dist";

const hook = {
    /**
     * 所有工作之前调用
     * @param appConfig
     * @param appStore
     */
    compiled(appConfig, appStore) {
        console.log(appConfig);
    },
    /**
     * 准备好的换进之前调用
     * @param appStore
     */
    beforeReady(appStore) {

    },
    /**
     * 准备好的换进之后调用
     * @param appStore
     */
    afterReady(appStore) {


    }
}
// 安装当前插件
installer(hook)
// 日期工具类
export const dateUtils = appStore.getPlugin("dateUtils");
// 对象工具类
export const objectUtils = appStore.getPlugin("objectUtils");
// 数组工具类
export const arrayUtils = appStore.getPlugin("arrayUtils");
// 数据编解码插件
export const dataContract = appStore.getPlugin("dataContract");
// 对象拷贝工具
export const dataCopier = appStore.getPlugin("dataCopier");
// 缓存管理器
export const cacheManager = appStore.getPlugin("cacheManager");
```

ts:

```typescript
import {
    AppConfig,
    AppStore,
    appStore,
    ArrayUtils,
    CacheManager,
    DataContract,
    DataCopier,
    DateUtils,
    installer,
    ObjectUtils
} from "cj-toolkit-x/dist";

const hook: AppRunHook = {

    /**
     * 所有工作之前调用
     * @param appConfig
     * @param appStore
     */
    compiled(appConfig: AppConfig, appStore: AppStore) {

    },

    /**
     * 准备好的环境之前调用
     * @param appStore
     */
    beforeReady(appStore: AppStore) {

    },
    /**
     * 准备好的环境之后调用
     * @param appStore
     */
    afterReady(appStore: AppStore) {

    }
}
// 安装插件
installer(hook)
// 日期工具类
export const dateUtils = appStore.getPlugin("dateUtils") as DateUtils;
// 对象工具类
export const objectUtils = appStore.getPlugin("objectUtils") as ObjectUtils;
// 数组工具类
export const arrayUtils = appStore.getPlugin("arrayUtils") as ArrayUtils;
// 数据编解码插件
export const dataContract = appStore.getPlugin("dataContract") as DataContract;
// 对象拷贝工具
export const dataCopier = appStore.getPlugin("dataCopier") as DataCopier;
// 缓存管理器
export const cacheManager = appStore.getPlugin("cacheManager") as CacheManager;
```
