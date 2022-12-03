export declare class DateUtils {
    /**格式为yyyy-MM-dd HH:mm:ss*/
    date_formatter_long: string;
    /**格式为yyyy-MM-dd*/
    date_formatter_short: string;
    /**
     * 获取时间
     * @param date
     * @returns {*}
     */
    getDate(date: string | Date): Date;
    /**
     * 日期转字符串
     * @param fmt
     * @param date
     * @returns {*}
     */
    dateToString(date: Date | string, fmt: string): string;
    /**
     * 字符串转日期 yyyy-MM-dd HH:mm:ss
     * @param str 时间字符串
     * @param format 时间格式
     */
    stringToDate(str: string, format?: string): Date;
    /**
     * 源串左侧补字符
     * @param source 源串
     * @param length 补全之后的长度
     * @param char
     */
    padStart(source: string, length: number, char: string): string;
    /**
     * 日期加减
     * @param date
     * @param num
     * @returns {Date}
     */
    addDay(date: string | Date, num: number): Date | undefined;
    /**
     * 月份加减
     * @param date
     * @param num
     */
    addMonth(date: string | Date, num: number): Date | undefined;
    /**
     * 年份加减
     * @param date
     * @param num
     */
    addYear(date: string | Date, num: number): Date | undefined;
    /**
     * 获取日期是周几
     * @param date
     * @param weeks
     * @returns {string}
     */
    getWeekDate(date: Date | string, weeks?: string[]): string;
    /**
     * 计算两个日期之间的天数差
     * @param firstDate
     * @param secondDate
     * @returns {string}
     */
    subDay(firstDate: Date | string, secondDate: Date | string): number;
    /**
     * 计算两个日期之间的月份差
     * date1，date2
     */
    subMonth(date1: Date | string, date2: Date | string): number;
    /**
     * 计算两个日期之间的年份差
     * date1，date2
     */
    subYear(date1: Date | string, date2: Date | string): number;
    /**
     * 计算某一月份有多少天，如果用户不传date,则默认查找当前月份
     */
    getDaysOfMonths(date: Date | string): number;
    /**
     * 获取区间内的所有日期
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param returnDate 返回日期类型
     */
    getDatesInRange(startDate: Date | string, endDate: Date | string, returnDate?: boolean): Date[] | String[];
    /**
     * 格式化日期
     * 将日期进行格式化
     * @param date 日期对象
     * @param format 单位  year 年 month 月 day 日 hour 小时 minute 分钟
     */
    trunc(date: Date | string, format?: DateTruncUnit): Date;
}
declare type DateTruncUnit = "year" | "month" | "day" | "hour" | "minute";
declare const _default: DateUtils;
export default _default;
