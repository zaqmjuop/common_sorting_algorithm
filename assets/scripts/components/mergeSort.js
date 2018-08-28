import li from './li';
import Dom from '../dom';
import { mergeSort } from '../sort/index';

const param = {
  name: 'mergeSort',
  query: 'mergeSort',
  url: './assets/templates/mergeSort.html',
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
        mergeSort(this.data.array);
        console.log(this.data.array);
      });
    },
    mergeSort(array) {
      this.methods.shredding(array); // 递归分组
      this.methods.recursiveMergeSort(array); // 递归合并并排序
      return array;
    },
    /** 将分好组的数组合并并排序 */
    recursiveMergeSort(array) {
      if (!(array instanceof Array) || array.length < 2) { return array; }
      const isGrassRoots = array.every(item => !(item instanceof Array));
      if (isGrassRoots) {
        // 最底层初次排序 2个值一组的部分
        this.methods.insertionSort(array);
      } else {
        // 遍历替换原值
        let merge = [];
        array.forEach((item) => {
          this.methods.recursiveMergeSort(item); // 递归到底层
          merge = merge.concat(item); // 从底层开始合并
        });
        array.splice(0, array.length, ...merge); // 将元素组改为合并，降维
        this.methods.insertionSort(array); // 将合并排序
      }
      return array;
    },
    /** 插入排序 改变原数组 */
    insertionSort(array) {
      const container = []; // 准备一个空数组，向空数组内插入
      // 一次插入动作
      const onceInsert = (member) => {
        let isInserted = false;
        for (let i = 0; i < container.length; i += 1) {
          const item = container[i];
          // 插入条件
          if (item > member) {
            container.splice(i, 0, member); // 插入
            isInserted = true;
            break;
          }
        }
        // 若container中没有比member更大的值时
        if (!isInserted) { container.push(member); }
        return container;
      };
      // 将原数组中的值有序的插入到container
      array.forEach(item => onceInsert(item));
      // 改变原数组
      array.splice(0, array.length, ...container);
    },
    /** 把一个数组切碎成多元数组 */
    shredding(ary) {
      if (!(ary instanceof Array)) { return false; }
      const halve = (array) => {
        // 二分一个数组
        if (array.length <= 1) { return array; }
        const rightSrart = Math.ceil(array.length / 2);
        const left = array.slice(0, rightSrart);
        const right = array.slice(rightSrart, array.length);
        return [left, right];
      };
      const shredding = (array) => {
        if (array instanceof Array) {
          const isGrassRootsInNeed = array.every(item => !(item instanceof Array)) && array.length > 2;
          if (isGrassRootsInNeed) {
            // 负责二分最底层
            const halved = halve(array);
            if (halved[0].length > 2) { // 遍历前加一次遍历条件，减少遍历操作次数
              shredding(halved);
            }
            array.splice(0, array.length, ...halved);
          } else {
            // 负责递归最底层
            array.forEach(item => shredding(item));
          }
        }
      };
      shredding(ary);
      return ary;
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
  implanted() { console.log('implanted mergeSort'); },
};

export default param;
