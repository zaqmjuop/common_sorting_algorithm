import li from './li';
import Dom from '../dom';
import utils from '../utils';

const param = {
  name: 'bubbleSort',
  query: 'bubbleSort',
  url: './assets/templates/bubbleSort.html',
  data() {
    return {
      array: [],
      items: [],
      bubbleSortPromise: Promise.resolve(),
      exchangePromise: Promise.resolve(),
      bubbleSortedTimes: 0,
      isFinished: false,
      /** 是否冒泡完成 0表示未开始，-1表示未完成，1表示完成 */
      isBubbleSortDone: 0,
      isRunning: false,
    };
  },
  selectors: {
    ul: 'ul',
    getRandom: '*[name=get-random]',
    bubbleSort: '*[name=bubble-sort]',
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
        ary[index] = Math.floor(100 * Math.random());
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
    bubbleSortOnce() {
      // 若冒泡已经完成
      if (this.data.isBubbleSortDone === 1) {
        return Promise.resolve(console.log('冒泡已经完成'));
      }
      this.data.bubbleSortPromise = this.data.bubbleSortPromise
        .then(() => {
          this.data.isBubbleSortDone = 0;
          console.log(this.methods.getArray());
        });
      for (let i = 0; i < this.data.items.length - this.data.bubbleSortedTimes - 1; i += 1) {
        this.data.bubbleSortPromise = this.data.bubbleSortPromise
          .then(() => {
            const item1 = this.data.items[i];
            const item2 = this.data.items[i + 1];
            let result = false;
            if (item1.data.value <= item2.data.value) {
              // 高亮一下
              item1.dispatchEvent('send', { method: 'highLight', time: 200 });
              item2.dispatchEvent('send', { method: 'highLight', time: 200 });
            } else {
              this.data.items[i] = item2;
              this.data.items[i + 1] = item1;
              this.data.isBubbleSortDone = -1;
              result = this.methods.exchange(i, i + 1);
            }
            return result;
          })
          .then(() => utils.wait(200));
        // 这是循环的最后一次 高亮冒泡出的item
        if (i >= this.data.items.length - this.data.bubbleSortedTimes - 2) {
          this.data.bubbleSortPromise = this.data.bubbleSortPromise
            .then(() => {
              this.data.items[i + 1].dispatchEvent('send', { method: 'sorted' });
              // 冒泡是否完成
              if (this.data.isBubbleSortDone === 0) { this.data.isBubbleSortDone = 1; }
            });
        }
      }
      // 排序一次之后
      this.data.bubbleSortPromise = this.data.bubbleSortPromise.then(() => {
        this.data.bubbleSortedTimes += 1;
      });
      return this.data.bubbleSortPromise;
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
      // 冒泡排序
      Dom.of(this.elements.bubbleSort).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        if (this.data.isFinished) {
          return console.warn('排序已经完成，请点击get-random重新开始');
        }
        let promise = Promise.resolve(this.data.isRunning = true);
        for (let i = 0; i < this.data.array.length; i += 1) {
          promise = promise.then(() => this.methods.bubbleSortOnce());
        }
        promise = promise.then(() => {
          console.log('冒泡完成');
          this.data.isFinished = true;
          this.data.isRunning = false;
          console.log(this.methods.getArray());
        });
        return promise;
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
  implanted() { console.log('implanted bubbleSort'); },
};

export default param;
