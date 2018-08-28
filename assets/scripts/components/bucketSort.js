import li from './li';
import Dom from '../dom';
import { insertionSort } from '../sort/index';

const bucketSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  const DEFAULT_BUCKET_SIZE = 5;
  let max = array[0];
  let min = array[0];
  // 找到最大最小值
  array.forEach((item) => {
    if (item > max) { max = item; }
    if (item < min) { min = item; }
  });
  // 找到断点
  const breakpoints = []; // 中间的断点，不包括min和max
  const spacing = Math.floor((max - min) / 5);
  let breakpoint = min;
  for (let index = 0; index < DEFAULT_BUCKET_SIZE - 1; index += 1) {
    breakpoint += spacing;
    breakpoints.push(breakpoint);
  }
  // 创建一个二元数组容器,长度为DEFAULT_BUCKET_SIZE，每个成员是一个空数组
  const container = [];
  for (let index = 0; index < DEFAULT_BUCKET_SIZE; index += 1) {
    container.push([]);
  }
  // 将原数组按分组放入容器内
  array.forEach((item) => {
    let index = breakpoints.findIndex(point => (point >= item));
    if (index < 0) { index = DEFAULT_BUCKET_SIZE - 1; }
    container[index].push(item);
  });
  // 对容器每组进行插入排序
  container.forEach(item => insertionSort(item));
  // 替换原数组
  array.splice(0, array.length);
  container.forEach(item => array.push(...item));
  return array;
};

const param = {
  name: 'bucketSort',
  query: 'bucketSort',
  url: './assets/templates/bucketSort.html',
  data() {
    return {
      array: [],
      items: [],
    };
  },
  selectors: {
    ul: 'ul',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
  },
  methods: {
    init() {
      let promise = Promise.resolve();
      for (let index = 0; index < 20; index += 1) {
        const liParam = Object.assign({ present: { order: index + 1 } }, li);
        promise = promise.then(() => this.appendChild(liParam, this.elements.ul, -1))
          .then(item => this.data.items.push(item));
      }
      return promise;
    },
    /** 获取20个随机数 */
    getRandom(number = 20) {
      if (!Number.isSafeInteger(number)) { throw new TypeError(`参数number不能是${number}`); }
      const ary = new Array(number);
      for (let index = 0; index < ary.length; index += 1) {
        ary[index] = Math.trunc(100 * Math.random()) + 1;
      }
      this.data.array = ary;
      this.data.bubbleSortedTimes = 0;
      this.data.isBubbleSortDone = 0;
      this.data.isFinished = false;
    },
    /** 按照20个随机数改变子组件li高度 */
    sendArray() {
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
      });
    },
    /** 操作Li位置的方法,2个li交换位置
   * @param {number} index1 - 一个数字，对应this.data.items[index1]
   * @param {number} index2 - 一个数字，对应this.data.items[index2]
   */
    exchange(index1, index2) {
      if (!Number.isSafeInteger(index1) || index1 < 0 || index1 > 19) {
        throw new Error(`index1不能是${index1}`);
      }
      if (!Number.isSafeInteger(index2) || index2 < 0 || index2 > 19) {
        throw new Error(`index2不能是${index2}`);
      }
      if (index1 !== index2) {
        this.data.exchangePromise = this.data.exchangePromise
          .then(() => {
            const item1 = this.data.items[index1];
            const item2 = this.data.items[index2];
            const order1 = item1.data.order;
            const order2 = item2.data.order;
            console.log('替换', item1.data.value, item2.data.value);
            item1.dispatchEvent('send', { order: order2 });
            item2.dispatchEvent('send', { order: order1 });
          });
      }
      return this.data.exchangePromise;
    },
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        this.methods.getRandom();
        return this.methods.sendArray();
      });
      Dom.of(this.elements.sort).on('click', () => {
        console.log('点击了排序');
        bucketSort(this.data.array);
        console.log(this.data.array);
      });
    },
    getArray() {
      const array = this.data.items.map(item => item.data.value);
      this.data.array = array;
      return array;
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
  implanted() { console.log('implanted bucketSort'); },
};

export default param;
