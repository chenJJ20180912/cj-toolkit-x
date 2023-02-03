import {installer} from "../src";
import {AppConfig, AppStore} from "../src";
import {AutoWried} from "../src";
import {AT} from "./t";

const appStore = installer({
    compiled(appConfig: AppConfig, appStore: AppStore) {
        appConfig.cache.type = "Memory";
    }
});

class A {

    @AutoWried("b")
    private _b: any | undefined;
    id = 1;

    constructor() {
        this.id = 1;
    }

    toString() {
        let b = this._b;
        b.toString();
    }
}


class B {
    toString() {
        console.log("B");
    }
}


appStore.install("b", new B());
// var a = new A();
// appStore.install("A", a);

// a.toString();

class C {
    toString() {
        console.log("C");
    }
}

class D extends AT {

}

class E extends D {

}

appStore.install("b", new C());
// a.toString();
var d = new D();
d.toString();

new E().toString();

// console.log(objectUtils.getObjType(a));
// console.log(objectUtils.getObjType(1));
// console.log(objectUtils.getObjType(new Date()));

export default  d
