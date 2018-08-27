import li from './li';
import Dom from '../dom';

function countingSort(array) {
  // 筛选数组中一共存在几种值，并将其排序
  const keys = [...new Set(array)];
  keys.sort((a, b) => a - b);
  // 设一个容器，容器的每个成员是一个数组，值相同的成员放到同一数组
  const container = keys.map(() => []);
  array.forEach((item) => {
    const index = keys.indexOf(item);
    container[index].push(item);
  });
  // 清空原数组
  array.splice(0, array.length);
  // 把容器中每个数组中的成员重新放回原数组
  container.forEach((team) => {
    team.forEach((item) => {
      array.push(item);
    });
  });
  return array;
}


const param = {
  name: 'countingSort',
  query: 'countingSort',
  url: './assets/templates/countingSort.html',
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
        ary[index] = Math.trunc(10 * Math.random()) + 1;
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
        countingSort(this.data.array);
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
  implanted() { console.log('implanted countingSort'); },
};

export default param;
