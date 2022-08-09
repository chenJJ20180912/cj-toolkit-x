export class ObjectUtils{

    private readonly typeMapping:{[key:string]:string} = {
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

    isObject(val: any):boolean{
        return this.getObjType(val) === 'object'
    }
    addObjType(obj: any, typeName: string) {
        let toString = Object.prototype.toString;
        this.typeMapping[toString.call(obj)] = typeName;
    }

    getObjType(obj: any):string {
        let toString = Object.prototype.toString;
        if (obj instanceof Element) {
            return "element";
        }
        return this.typeMapping[toString.call(obj)];
    }

    deepClone(data: any):any {
        let type = this.getObjType(data);
        if (Array.isArray(data)) {
            let obj:any[] = []
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
            return  obj;
        } else if (type === "object") {
            let obj:{[key:string]:string} = {};
            for (let key in data) {
                if (data) {
                    delete data.$parent;
                }
                obj[key] = this.deepClone(data[key]);
            }
            return  obj
        }
        return data;
    }
}


export default new ObjectUtils();
