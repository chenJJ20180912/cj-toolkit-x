class MathUtils {

    private isEmpty(val) {//判断对象是否是NULL或者时undefined
        if (typeof (val) == "undefined") return true;
        if (val == null || val == "null" || val == "undefined") return true;
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
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
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
        let r1: number, r2: number, m: number;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
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
        if (arg2 === 0) return 0;
        let t1 = 0, t2 = 0, r1, r2;
        if (this.isEmpty(arg1)) arg1 = 0;
        if (this.isEmpty(arg2)) {
            arg2 = 1;
            arg1 = 0;
        }
        try {
            t1 = arg1.toString().split(".")[1].length;
        } catch (e) {
        }
        try {
            t2 = arg2.toString().split(".")[1].length;
        } catch (e) {
        }
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }

    //数值相乘
    numberValueMultiply(arg1, arg2) {
        if (this.isEmpty(arg1)) arg1 = 0;
        if (this.isEmpty(arg2)) arg2 = 0;
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length;
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length;
        } catch (e) {
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

export default new MathUtils()
