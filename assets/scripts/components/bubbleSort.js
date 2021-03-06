import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

const param = {
  name: 'bubbleSort',
  query: 'bubbleSort',
  url: './assets/templates/bubbleSort.html',
  data() {
    return {
      array: [],
      items: [],
      bubbleSortedTimes: 0,
      /** 是否冒泡完成 0表示未开始，-1表示未完成，1表示完成 */
      isBubbleSortDone: 0,
      isRunning: false,
      speed: 500,
      exchangeTimes: 0,
    };
  },
  selectors: {
    ul: 'ul',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    speed: '*[name=speed]',
  },
  methods: {
    init() {
      // 20个<li>
      let promise = Promise.resolve();
      for (let index = 0; index < 20; index += 1) {
        const liParam = Object.assign({ present: { order: index + 1 } }, li);
        promise = promise
          .then(() => this.appendChild(liParam, this.elements.ul, -1))
          .then(item => this.data.items.push(item));
      }
      return promise;
    },
    /** 获取20个随机数 */
    getRandom() {
      if (this.data.isRunning) {
        return console.warn('正在运行中,你可以刷新页面重新开始');
      }
      this.data.isSorted = false;
      this.data.array = getRandomArray(20, 1, 99);
      // 改变Li高度
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
      });
      return this.data.array;
    },
    /** 操作Li位置的方法,2个li交换位置
     * @param {number} index1 - 一个数字，对应this.data.items[index1]
     * @param {number} index2 - 一个数字，对应this.data.items[index2]
     */
    exchange(index1, index2, mesc = 200) {
      if (!Number.isSafeInteger(index1) || index1 < 0 || index1 > this.data.items.length - 1) {
        throw new Error(`index1不能是${index1}`);
      }
      if (!Number.isSafeInteger(index2) || index2 < 0 || index2 > this.data.items.length - 1) {
        throw new Error(`index2不能是${index2}`);
      }
      if (index1 === index2) { return false; }
      const promise = new Promise((resolve) => {
        const item1 = this.data.items[index1];
        const item2 = this.data.items[index2];
        const order1 = item1.data.order;
        const order2 = item2.data.order;
        this.data.items.splice(index1, 1, item2);
        this.data.items.splice(index2, 1, item1);
        console.log(`替换 [${index1}]${item1.data.value} <-> [${index2}]${item2.data.value}`);
        item1.dispatchEvent('send', { order: order2 });
        item2.dispatchEvent('send', { order: order1 });
        this.data.exchangeTimes += 1;
        resolve(utils.wait(mesc));
      });
      return promise;
    },
    bubbleSortOnce() {
      // 若冒泡已经完成
      if (this.data.isBubbleSortDone) {
        return false;
      }
      // 排序之前
      const insideData = {
        hasChange: false,
      };
      let promise = Promise.resolve();
      // 排序
      for (let i = 0; i < this.data.items.length - this.data.bubbleSortedTimes - 1; i += 1) {
        promise = promise
          .then(() => {
            const item1 = this.data.items[i];
            const item2 = this.data.items[i + 1];
            let process = new Promise((resolve) => {
              // // 高亮一下
              item1.dispatchEvent('send', { method: 'highLight', time: this.data.speed });
              item2.dispatchEvent('send', { method: 'highLight', time: this.data.speed });
              resolve(utils.wait(this.data.speed));
            });
            if (item1.data.value > item2.data.value) {
              process = process
                .then(() => {
                  item1.dispatchEvent('send', { method: 'highLight', backColor: 'yellow', time: this.data.speed });
                  item2.dispatchEvent('send', { method: 'highLight', backColor: 'yellow', time: this.data.speed });
                  return utils.wait(this.data.speed);
                })
                .then(() => {
                  insideData.hasChange = true;
                  return this.methods.exchange(i, i + 1);
                });
            }
            return process;
          });
        // 这是循环的最后一次 高亮冒泡出的item
        if (i >= this.data.items.length - this.data.bubbleSortedTimes - 2) {
          promise = promise
            .then(() => {
              this.data.items[i + 1].dispatchEvent('send', { method: 'sorted' });
              // 冒泡是否完成
              if (!insideData.hasChange) {
                this.data.isBubbleSortDone = true;
              }
            });
        }
      }
      // 排序之后
      promise = promise
        .then(() => {
          this.data.bubbleSortedTimes += 1;
        });
      return promise;
    },
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        this.methods.getRandom();
      });
      // 冒泡排序
      Dom.of(this.elements.sort).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        if (this.data.isSorted || this.data.array.every(item => !item || item <= 0)) {
          this.methods.getRandom();
        }
        // 排序前
        this.data.isRunning = true;
        this.data.speed = 1000 - Number(this.elements.speed.value) * 100;
        this.data.bubbleSortedTimes = 0;
        this.data.isBubbleSortDone = false;
        this.data.exchangeTimes = 0;
        // 排序
        let promise = Promise.resolve();
        for (let i = 0; i < this.data.array.length; i += 1) {
          promise = promise
            .then(() => this.methods.bubbleSortOnce());
        }
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.isSorted = true;
            this.data.array = this.data.items.map(item => item.data.value);
            console.log(`done 交换次数${this.data.exchangeTimes}`);
          });
        return promise;
      });
    },
  },
  created() {
    const promise = Promise.resolve()
      .then(() => this.methods.init())
      .then(() => this.methods.bindEvents());
    return promise;
  },
};

export default param;
