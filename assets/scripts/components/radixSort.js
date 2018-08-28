import li from './li';
import Dom from '../dom';

const radixSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  // 设置一个长度为10的容器，每个成员是一个空数组
  const container = [];
  const initContainer = () => {
    container.splice(0, 10, ...[[], [], [], [], [], [], [], [], [], []]);
  };
  initContainer();
  // 找到最大值
  let max = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
  });
  // 计算出位数
  let decimal = 0;
  while (max > 0) {
    decimal += 1;
    max = Math.floor(max / 10);
  }
  decimal = (decimal >= 1) ? decimal : 1;
  // 最大值是2位数就排2次，3位数就排3次
  for (let time = 0; time < decimal; time += 1) {
    // 算出对应位数的数字，并按分组放进容器
    array.forEach((item) => {
      const index = Math.floor(item / (10 ** time)) % 10;
      container[index].push(item);
    });
    // 替换原数组并清空容器
    array.splice(0, array.length);
    container.forEach(team => array.push(...team));
    initContainer();
  }
  return array;
};

const param = {
  name: 'radixSort',
  query: 'radixSort',
  url: './assets/templates/radixSort.html',
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
        radixSort(this.data.array);
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
  implanted() { console.log('implanted radixSort'); },
};

export default param;
