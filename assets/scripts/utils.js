const getEnv = () => {
  let isBrowser;
  try {
    isBrowser = !!window;
  } catch (error) {
    isBrowser = false;
  }
  const env = (isBrowser) ? 'browser' : 'node';
  return env;
};

const isKeyEnter = event => ((event instanceof KeyboardEvent) && (event.keyCode === 13));

const isElement = element => (element && (element.nodeType === 1));

const isString = str => (str && (typeof str === 'string'));

const isFunction = (param) => {
  const res = param && (typeof param === 'function');
  return res;
};

const now = new Date();

const formatDate = (parameter) => {
  // parameter可以是表示时间字符串 如'2018/01/01'或'2018-01-01'或Date
  // 返回表示时间的字符串格式'2018-01-01'
  const date = (parameter && parameter instanceof Date)
    ? parameter
    : new Date(String(parameter));
  const result = (date.getTime()) ? date.toLocaleDateString().replace(/\//g, '-') : '';
  return result;
};

const formatTime = (date) => {
  if (!(date instanceof Date)) { throw new TypeError(`formatTime 参数date不能是${date}`); }
  const str = date.toTimeString().match(/^\S+/)[0];
  return str;
};

const isValidDate = (date) => {
  const result = date && date instanceof Date && date.getTime();
  return result;
};

const newPromise = () => new Promise(resolve => resolve(1));

const differDay = (datea, dateb) => {
  // 两个日期相差几日 返回值是一个整数 1代表dateb是datea的后一天 -1代表dateb是datea的前一天 0代表是同一天
  if (!(datea instanceof Date) || !(dateb instanceof Date)) {
    throw new TypeError(`differDay的参数不能是 ${datea} 和 ${dateb}`);
  }
  const dateaStart = new Date(datea.toDateString());
  const datebStart = new Date(dateb.toDateString());
  const msecs = datebStart.getTime() - dateaStart.getTime();
  const days = msecs / 86400000;
  return days;
};

const isEmptyString = (content) => {
  // 是否是空Falsely或空字符串
  const isFalsely =
    (content === null) ||
    (content === undefined) ||
    (content === false) ||
    (content === []) ||
    (content === {});
  const isEmpty = !String(content).match(/\S/);
  return isFalsely || isEmpty;
};

const isEffectiveString = content => (typeof content === 'string' && content.match(/\S/));

const classify = (ary, callback) => {
  // 把一个数组按照callback((item)=>{})分成两部分
  // 返回一个数组包含2个数组，callback返回true的在第一个一个数组，其他的在第二个数组
  if (!(ary instanceof Array)) { throw new TypeError(`classify ${ary} 不是Array`); }
  if (!(callback instanceof Function)) { throw new TypeError(`classify ${callback} 不是Function`); }
  const result = [[], []];
  ary.forEach((item) => {
    const allot = callback(item);
    if (allot) {
      result[0].push(item);
    } else {
      result[1].push(item);
    }
  });
  return result;
};

const flat = (ary, deep) => {
  // 递归到指定深度将所有子数组连接，并返回一个新数组。
  if (!(ary instanceof Array)) { throw new TypeError(`flat ${ary} 不是Array`); }
  if (deep && (!Number.isSafeInteger(deep) || deep < 1)) { throw new TypeError(`flat ${deep} 不是Integer或deep < 1`); }
  let result = ary;
  const times = deep || 1;
  const core = (array) => {
    const container = [];
    array.forEach((item) => {
      if (item instanceof Array) {
        item.forEach(i => container.push(i));
      } else {
        container.push(item);
      }
    });
    return container;
  };
  for (let index = 0; index < times; index += 1) {
    result = core(result);
  }
  return result;
};
/** 冒泡 返回一个新的数组
 * @param {Array} ary - 需要排序的数组
 * @param {Function}  callback - callback(item)比较callback的返回值
 */
const bubbleSort = (ary, callback) => {
  if (!(ary instanceof Array)) { throw new TypeError(`Array不能是${ary}`); }
  const res = ary.slice(0);
  let bubbledCount = 0;
  const bubble = () => {
    for (let i = 0; i < res.length - 1 - bubbledCount; i += 1) {
      if (callback(res[0]) > callback(res[1])) {
        const tmp = res[i];
        res[i] = res[i + 1];
        res[i + 1] = tmp;
      }
    }
  };
  for (let i = 0; i < res.length - 1; i += 1) {
    bubbledCount = i;
    bubble();
  }
  return res;
};

/** 工具方法集合 */
const utils = {
  isElement,
  isKeyEnter,
  isString,
  isFunction,
  isEmptyString,
  isEffectiveString,
  newPromise,
  formatDate,
  formatTime,
  now,
  isValidDate,
  differDay,
  classify,
  flat,
  getEnv,
  bubbleSort,
};

export default utils;
