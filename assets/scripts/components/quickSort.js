import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

const param = {
  name: 'quickSort',
  query: 'quickSort',
  url: './assets/templates/quickSort.html',
  data() {
    return {
      array: [],
      items: [],
      exchangePromise: Promise.resolve(),
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
        item.dispatchEvent('send', { backColor: '' });
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
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        this.methods.getRandom();
      });
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
        this.data.exchangeTimes = 0;
        this.data.startIndex = 0;
        this.data.endIndex = this.data.items.length - 1;
        console.log('点击了排序');
        // 排序
        let promise = Promise.resolve();
        promise = promise
          .then(() => this.methods.quickSortRecursion());
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.isSorted = true;
            this.data.array = this.data.items.map(item => item.data.value);
            this.data.items.forEach((item) => {
              item.dispatchEvent('send', { backColor: '' });
            });
            console.log(`done。 交换次数${this.data.exchangeTimes}`, this.data.array);
          });
        return promise;
      });
    },
    quickSortOnce(startIndex = 0, endIndex = this.data.items.length - 1) {
      // 分组
      let leftIndex = startIndex; // 左端点
      let rightIndex = endIndex; // 右端点
      const pivot = this.data.items[leftIndex]; // 取左端点值为基准
      // 显示范围
      Dom.of(this.data.items[leftIndex].template).addClass('yellow');
      for (let index = leftIndex + 1; index <= rightIndex; index += 1) {
        this.data.items[index].methods.select();
      }
      // 从右侧收紧 找到第一个较小值停止
      for (; leftIndex < rightIndex; rightIndex -= 1) {
        if (this.data.items[rightIndex].data.value < pivot.data.value) {
          break;
        }
      }
      // 从左侧收紧 找到第一个较大值停止
      for (; leftIndex < rightIndex; leftIndex += 1) {
        if (this.data.items[leftIndex].data.value > pivot.data.value) {
          break;
        }
      }
      // 右向左动画
      let promise = Promise.resolve();
      for (let index = endIndex; index >= rightIndex; index -= 1) {
        const item = this.data.items[index];
        promise = promise
          .then(() => {
            // 高亮一下
            item.methods.highLight(this.data.speed);
            return utils.wait(this.data.speed);
          })
          .then(() => {
            if (index !== rightIndex || rightIndex === startIndex) {
              return false;
            }
            return this.methods.exchange(startIndex, index);
          })
          .then(() => {
            // 取消高亮
            item.methods.unselect();
            return utils.wait(this.data.speed);
          });
      }
      // 左向右动画
      for (let index = startIndex + 1; index <= leftIndex; index += 1) {
        const item = this.data.items[index];
        promise = promise
          .then(() => {
            if (index === leftIndex && item.data.value <= pivot.data.value) {
              return false;
            }
            // 高亮一下
            item.methods.highLight(this.data.speed);
            return utils.wait(this.data.speed);
          }).then(() => {
            if (index !== leftIndex || leftIndex === rightIndex) {
              return false;
            }
            return this.methods.exchange(rightIndex, index);
          })
          .then(() => {
            // 取消高亮
            item.methods.unselect();
            return utils.wait(this.data.speed);
          });
      }
      // 交换之后
      promise = promise
        .then(() => {
          this.data.startIndex = leftIndex;
          this.data.endIndex = Math.max(rightIndex - 1, leftIndex);
        });
      return promise;
    },
    quickSortLoop() {
      const promise = Promise.resolve()
        // 执行一次排序
        .then(() => {
          if (this.data.endIndex && this.data.startIndex === this.data.endIndex) {
            return false;
          }
          return this.methods.quickSortOnce(this.data.startIndex, this.data.endIndex);
        })
        // 递归
        .then(() => {
          if (!this.data.endIndex || this.data.endIndex === this.data.startIndex) {
            const item = this.data.items[this.data.startIndex];
            Dom.of(item.template).removeClass('yellow');
            return false;
          }
          return this.methods.quickSortLoop();
        });
      return promise;
    },
    quickSortRecursion(start = 0, end = this.data.items.length - 1) {
      if (start >= end) { return false; }
      console.log(`起点：${start},终点${end}`);
      // 递归
      let pivotIndex;
      const promise = Promise.resolve()
        // 执行一次循环
        .then(() => {
          this.data.startIndex = start;
          this.data.endIndex = end;
          const loop = Promise.resolve()
            .then(() => this.methods.quickSortLoop())
            .then(() => { pivotIndex = this.data.startIndex; });
          return loop;
        })
        // 递归
        .then(() => {
          const recursion = Promise.resolve()
            .then(() => {
              this.data.items[pivotIndex].dispatchEvent('send', { backColor: '#ccc' });
            })
            .then(() => this.methods.quickSortRecursion(start, pivotIndex - 1))
            .then(() => this.methods.quickSortRecursion(pivotIndex + 1, end));
          return recursion;
        });
      return promise;
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
