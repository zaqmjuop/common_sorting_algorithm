import Dom from '../dom';
import li from './li';

/** 获取一个范围在[0,max)区间随机数
 * @param {number} max - 一个数字表示取值的上限
 */
const getRandom = (max = 20) => {
  if (!Number.isSafeInteger(max) || max < 0) { throw new TypeError(`取值上限不能是${max}`); }
  return Math.floor(Math.random() * max);
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
  },
  data() {
    return {
      array: [],
      items: [],
    };
  },
  methods: {
    /** 添加20个子组件li */
    init() {
      let promise = Promise.resolve(1);
      for (let index = 0; index < 20; index += 1) {
        promise = promise.then(() => this.appendChild(li, this.elements.ul, -1))
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
    },
    /** 按照20个随机数改变子组件li高度 */
    sendArray() {
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
      });
    },
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        this.methods.getRandom();
        this.methods.sendArray();
      });
      // 测试方法
      Dom.of(this.elements.test).on('click', () => {
        // const item = this.data.items[5];
        // const random = Math.floor(Math.random() * 20) + 1;
        // item.dispatchEvent('send', { order: random });
        const key1 = getRandom(20);
        let key2;
        for (let index = 0; index < 1000; index += 1) {
          key2 = getRandom(20) + 1;
          if (key2 !== key1) { break; }
        }
        this.methods.makeLiMoveTo(key1, key2);
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
        const item1 = this.data.items[index1];
        const item2 = this.data.items[index2];
        const order1 = item1.data.order;
        const order2 = item2.data.order;
        item1.dispatchEvent('send', { order: order2 });
        item2.dispatchEvent('send', { order: order1 });
      }
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
