import li from './li';
import Dom from '../dom';
import utils from '../utils';

const param = {
  name: 'selectionSort',
  query: 'selectionSort',
  url: './assets/templates/selectionSort.html',
  data() {
    return {
      array: [],
      items: [],
      exchangePromise: Promise.resolve(),
      sortPromise: Promise.resolve(),
      currentPromise: Promise.resolve(),
      sortTimes: 0,
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
      this.data.sortTimes = 0;
    },
    /** 按照20个随机数改变子组件li高度 */
    sendArray() {
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
        item.dispatchEvent('send', { method: 'unselect' });
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
    /** 排序一次 */
    sortOnce() {
      if (this.data.sortTimes > this.data.items.length - 2) {
        return console.warn('排序已完成,你可以点击左侧按钮重新开始');
      }
      const lets = { index: this.data.sortTimes, minIndex: this.data.sortTimes };
      // 排序之前
      this.data.sortPromise = this.data.sortPromise
        .then(() => {
          this.methods.updateOrder();
          console.log(this.data.array);
          this.data.items[lets.index].dispatchEvent('send', { method: 'select' });
        });
      for (let i = this.data.sortTimes + 1; i < this.data.items.length; i += 1) {
        this.data.sortPromise = this.data.sortPromise
          .then(() => {
            // 高亮待选
            this.data.items[i].dispatchEvent('send', { method: 'highLight', time: 11 });
            return utils.wait(11);
          })
          .then(() => {
            // 切换选择项
            const item1 = this.data.items[lets.minIndex];
            const item2 = this.data.items[i];
            if (item2.data.value < item1.data.value) {
              this.data.items[lets.minIndex].dispatchEvent('send', { method: 'unselect' });
              lets.minIndex = i;
              this.data.items[lets.minIndex].dispatchEvent('send', { method: 'select' });
            }
            return utils.wait(11);
          });
      }
      // 交换
      this.data.sortPromise = this.data.sortPromise
        .then(() => {
          if (lets.minIndex === lets.index) { return false; }
          return this.methods.exchange(lets.index, lets.minIndex);
        })
        .then(() => {
          // 排序之后
          this.data.sortTimes += 1;
          this.methods.updateOrder();
        });
      return this.data.sortPromise;
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
      // 选择排序
      Dom.of(this.elements.sort).on('click', () => {
        if (this.data.sortTimes > this.data.items.length - 2) {
          return console.warn('排序已完成,你可以点击左侧按钮重新开始');
        }
        for (let i = 0; i < this.data.items.length - 1; i += 1) {
          this.data.currentPromise = this.data.currentPromise
            .then(() => this.methods.sortOnce());
        }
        this.data.currentPromise = this.data.currentPromise
          .then(() => console.log('排序完成'));
        return this.data.currentPromise;
      });
    },
    updateOrder() {
      this.data.items.sort((a, b) => (a.data.order - b.data.order));
      const array = this.data.items.map(item => item.data.value);
      this.data.array = array;
      return array;
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
};

export default param;
