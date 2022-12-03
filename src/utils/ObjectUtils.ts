export class ObjectUtils {

    private readonly typeMapping: { [key: string]: string } = {
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


    /**
     * 对象是否为promise
     * @param val
     */
    isPromise(val: any): boolean {
        return val && typeof val === "object" && val.then && typeof val.then === "function";
    }

    /**
     * 对象是否为数组
     * @param val
     */
    isArray(val: any): boolean {
        return Array.isArray(val);
    }

    /**
     * 是否为对象
     * @param val
     */
    isObject(val: any): boolean {
        return this.getObjType(val) === "object";
    }

    addObjType(obj: any, typeName: string) {
        let toString = Object.prototype.toString;
        this.typeMapping[toString.call(obj)] = typeName;
    }

    getObjType(obj: any): string {
        let toString = Object.prototype.toString;
        if (obj instanceof Element) {
            return "element";
        }
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

    deepClone(data: any): any {
        let type = this.getObjType(data);
        if (Array.isArray(data)) {
            let obj: any[] = [];
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
        } else if (type === "object") {
            let obj: { [key: string]: string } = {};
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

    /**
     * 判断对象为空
     * @param obj
     */
    isEmpty(obj: any) {
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
    isNotEmpty(obj:any){
        return !this.isEmpty(obj)
    }
}


export default new ObjectUtils();
