import li from './li';
import Dom from '../dom';
import utils from '../utils';

const param = {
  name: 'insertionSort',
  query: 'insertionSort',
  url: './assets/templates/insertionSort.html',
  data() {
    return {
      array: [],
      items: [],
      container: [],
      sortTimes: 0,
      compared: false,
    };
  },
  selectors: {
    ul: 'ul',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    container: '*[name=container]',
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
        item.dispatchEvent('send', { method: 'unfall' });
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
        let promise = Promise.resolve();
        for (let i = 0; i < this.data.items.length; i += 1) {
          promise = promise
            .then(() => this.methods.sortOnce())
            .then(() => utils.wait(1000));
        }
        promise = promise.then(() => {
          const res = this.data.container.map(item => item.data.value);
          console.log('排序完成', res);
        });
      });
    },
    sortOnce() {
      let promise = Promise.resolve(this.data.compared = false);
      for (let i = 0; i < this.data.container.length; i += 1) {
        promise = promise.then(() => {
          if (this.data.compared) { return false; }
          const cpt = this.data.items[this.data.sortTimes];
          const item = this.data.container[i];
          item.dispatchEvent('send', { method: 'highLight', time: 1000 });
          if (item.data.value > cpt.data.value) {
            this.data.compared = true;
          }
          return utils.wait(1000);
        });
      }

      promise = promise
        .then(() => {
          const cpt = this.data.items[this.data.sortTimes];
          this.methods.insertContainer(cpt);
          // 在这里加比较动画
          this.data.container.forEach((item, index) => {
            if (item !== cpt) {
              item.dispatchEvent('send', { order: index + 1 });
            }
          });
          return utils.wait(1000);
        })
        .then(() => {
          const cpt = this.data.items[this.data.sortTimes];
          const order = this.data.container.findIndex(item => item === cpt) + 1;
          cpt.dispatchEvent('send', { order });
          cpt.dispatchEvent('send', { method: 'select' });
          cpt.dispatchEvent('send', { method: 'fall' });
          this.data.sortTimes += 1;
          return utils.wait(100);
        });
      return promise;
    },
    insertContainer(cpt) {
      for (let i = 0; i < this.data.container.length; i += 1) {
        const item = this.data.container[i];
        if (cpt.data.value < item.data.value) {
          this.data.container.splice(i, 0, cpt);
          break;
        }
      }
      if (!this.data.container.includes(cpt)) {
        this.data.container.push(cpt);
      }
      return this.data.container;
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
  implanted() { console.log('implanted insertionSort'); },
};

export default param;
