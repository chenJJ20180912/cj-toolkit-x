import {AutoWried} from "../src";

export class AT {
    @AutoWried("b")
    private _sr:any;

    toString(){
        this._sr.toString()
    }
}
