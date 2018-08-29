import Component from './component';
import Dom from '../dom';
import bubbleSort from './bubbleSort';
import selectionSort from './selectionSort';
import insertionSort from './insertionSort';
import shellSort from './shellSort';
import mergeSort from './mergeSort';
import quickSort from './quickSort';
import heapSort from './heapSort';
import countingSort from './countingSort';
import bucketSort from './bucketSort';
import radixSort from './radixSort';

const bubbleSortParam = Component.of(bubbleSort);
const selectionSortParam = Component.of(selectionSort);
const insertionSortParam = Component.of(insertionSort);
const shellSortParam = Component.of(shellSort);
const mergeSortParam = Component.of(mergeSort);
const quickSortParam = Component.of(quickSort);
const heapSortParam = Component.of(heapSort);
const countingSortParam = Component.of(countingSort);
const bucketSortParam = Component.of(bucketSort);
const radixSortParam = Component.of(radixSort);

const initParam = shellSortParam;

/**
 * 返回一个等待若干好眠的promise
 * @param {number} mesc - 等待的毫秒数
 */
const wait = (mesc) => {
  if (!Number.isSafeInteger(mesc) || mesc < 0) { throw new TypeError(`mesc不能是${mesc}`); }
  const promise = new Promise((resolve) => {
    setTimeout(() => resolve(mesc), mesc);
  });
  return promise;
};

/** 获取一个范围在[0,max)区间随机数
 * @param {number} max - 一个数字表示取值的上限
 */
const getRandom = (max = 20) => {
  if (!Number.isSafeInteger(max) || max < 0) { throw new TypeError(`取值上限不能是${max}`); }
  return Math.trunc(Math.random() * max);
};
/** 应用主体组件 */

const param = {
  query: 'welcome',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  selectors: {
    getRandom: '*[name=get-random]',
    test: '*[name=test]',
    ul: 'ul',
    container: '.container',
    bubbleSort: '*[name=bubbleSort]',
    selectionSort: '*[name=selectionSort]',
    insertionSort: '*[name=insertionSort]',
    shellSort: '*[name=shellSort]',
    mergeSort: '*[name=mergeSort]',
    quickSort: '*[name=quickSort]',
    heapSort: '*[name=heapSort]',
    countingSort: '*[name=countingSort]',
    bucketSort: '*[name=bucketSort]',
    radixSort: '*[name=radixSort]',
  },
  data() {
    return {
      array: [],
      items: [],
      exchangePromise: Promise.resolve(1),
      bubbleSortPromise: Promise.resolve(1),
      bubbleSortedTimes: 0,
      isBubbleSortFinished: false,
      currentPromise: null,
    };
  },
  methods: {
    /** 添加20个子组件li */
    init() {
      const promise = Promise.resolve()
        .then(() => {
          this.data.current = initParam;
          return this.appendChild(this.data.current, this.elements.container, 0);
        });
      return promise;
    },
    getArray() {
      if (this.data.items) {
        this.methods.sortItemsByOrder();
        this.data.array = this.data.items.map(item => item.data.value);
      }
      return this.data.array;
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
    },
    /** 按照20个随机数改变子组件li高度 */
    sendArray() {
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
      });
    },
    bubbleSortOnce() {
      // 冒泡一次流程
      if (this.data.bubbleSortedTimes >= this.data.items.length - 1) {
        console.log('排序已经结束，请点击最左侧按钮从新开始');
        return this.data.bubbleSortPromise;
      }
      // 排序开始前准备
      this.data.bubbleSortPromise = this.data.bubbleSortPromise
        .then(() => {
          this.methods.getArray();
          this.data.isBubbleSortFinished = true;
          console.log(this.data.array);
        });
      // -1 是因为若长度20那么应比较19次
      for (let i = 0; i < this.data.items.length - this.data.bubbleSortedTimes - 1; i += 1) {
        this.data.bubbleSortPromise = this.data.bubbleSortPromise
          .then(() => {
            const item1 = this.data.items[i];
            const item2 = this.data.items[i + 1];
            let result = false;
            if (item1.data.value <= item2.data.value) {
              // 高亮一下
              item1.dispatchEvent('send', { method: 'highLight', time: 1000 });
              item2.dispatchEvent('send', { method: 'highLight', time: 1000 });
            } else {
              this.data.items[i] = item2;
              this.data.items[i + 1] = item1;
              this.data.isBubbleSortFinished = false;
              result = this.methods.exchange(i, i + 1);
            }
            return result;
          })
          .then(() => {
            // 判断该条数据已经冒泡
            const isBubbled = (i >= (this.data.items.length - this.data.bubbleSortedTimes - 2));
            if (isBubbled) { this.data.items[i + 1].dispatchEvent('send', { method: 'sorted' }); }
          })
          .then(() => wait(1000));
      }
      // 一次冒泡结束
      this.data.bubbleSortPromise = this.data.bubbleSortPromise.then(() => {
        this.methods.getArray();
        // 排序结束条件
        const isFinished = this.data.isBubbleSortFinished
          || (this.data.items.length - this.data.bubbleSortedTimes - 2 === 0);
        if (isFinished) { console.log('冒泡完成'); }
        this.data.bubbleSortedTimes += 1;
      });
      return this.data.bubbleSortPromise;
    },
    changeCurrent(cpt) {
      if (!Component.isComponent(cpt)) { throw new TypeError(`${cpt}不是组件`); }
      if (this.data.current === cpt) { return Promise.resolve(cpt); }
      const beforeCurrent = this.data.current;
      this.data.current = cpt;
      return this.replaceChild(this.data.current, beforeCurrent);
    },
    bindEvents() {
      Dom.of(this.elements.bubbleSort).on('click', () => this.methods.changeCurrent(bubbleSortParam));
      Dom.of(this.elements.selectionSort).on('click', () => this.methods.changeCurrent(selectionSortParam));
      Dom.of(this.elements.insertionSort).on('click', () => this.methods.changeCurrent(insertionSortParam));
      Dom.of(this.elements.shellSort).on('click', () => this.methods.changeCurrent(shellSortParam));
      Dom.of(this.elements.mergeSort).on('click', () => this.methods.changeCurrent(mergeSortParam));
      Dom.of(this.elements.quickSort).on('click', () => this.methods.changeCurrent(quickSortParam));
      Dom.of(this.elements.heapSort).on('click', () => this.methods.changeCurrent(heapSortParam));
      Dom.of(this.elements.countingSort).on('click', () => this.methods.changeCurrent(countingSortParam));
      Dom.of(this.elements.bucketSort).on('click', () => this.methods.changeCurrent(bucketSortParam));
      Dom.of(this.elements.radixSort).on('click', () => this.methods.changeCurrent(radixSortParam));
    },
    sortItemsByOrder() {
      this.data.items.sort((a, b) => (a.data.order - b.data.order));
      return this.data.items;
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
    /** 操作li位置的方法，把一个li移动到指定顺位 */
    /** 操作Li位置的方法,2个li交换位置
     * @param {number} index1 - 一个数字，对应this.data.items[index1]
     * @param {number} order - 一个数字，使this.data.items[index1]移动的目标顺位
     * @todo
     */
    makeLiMoveTo(index, order) {
      if (!Number.isSafeInteger(index) || index < 0 || index > 19) {
        throw new Error(`index不能是${index}`);
      }
      if (!Number.isSafeInteger(order) || order < 1 || order > 20) {
        throw new Error(`order不能是${order}`);
      }
      const item = this.data.items[index];
      const beforeOrder = item.data.order;
      if (beforeOrder === order) { return false; }
      const orderInterval = { min: 0, max: 0, feed: 0 };
      if (order > beforeOrder) {
        orderInterval.min = beforeOrder + 1;
        orderInterval.max = order;
        orderInterval.feed = -1;
      } else {
        orderInterval.min = order;
        orderInterval.max = beforeOrder - 1;
        orderInterval.feed = 1;
      }
      const passItems = this.data.items.filter((cpt) => {
        const isPass = cpt.data.order <= orderInterval.max && cpt.data.order >= orderInterval.min;
        return isPass;
      });
      passItems.forEach((cpt) => {
        const destination = cpt.data.order + orderInterval.feed;
        cpt.dispatchEvent('send', { order: destination });
      });
      return item.dispatchEvent('send', { order });
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
};
export default param;
