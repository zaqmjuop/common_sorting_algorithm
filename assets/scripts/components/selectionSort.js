import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

const param = {
  name: 'selectionSort',
  query: 'selectionSort',
  url: './assets/templates/selectionSort.html',
  data() {
    return {
      array: [],
      items: [],
      sortTimes: 0,
      speed: 500,
      isRunning: false,
      isSorted: false,
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
      if (this.data.isRunning) { return false; }
      this.data.array = getRandomArray();
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
    /** 排序一次 */
    sortOnce() {
      if (this.data.sortTimes > this.data.items.length - 2) {
        return console.warn('排序已完成,你可以点击左侧按钮重新开始');
      }
      let promise = Promise.resolve();
      const insideData = {
        start: this.data.sortTimes,
        minIndex: this.data.sortTimes,
      };
      // 排序之前
      promise = promise
        .then(() => {
          this.data.items[insideData.start].dispatchEvent('send', { backColor: 'yellow' });
        });
      for (let i = insideData.start + 1; i < this.data.items.length; i += 1) {
        promise = promise
          .then(() => {
            // 高亮待选
            this.data.items[i].dispatchEvent('send', { method: 'highLight', time: this.data.speed });
            return utils.wait(this.data.speed);
          })
          .then(() => {
            // 切换选择项
            const item1 = this.data.items[insideData.minIndex];
            const item2 = this.data.items[i];
            if (item2.data.value < item1.data.value) {
              this.data.items[insideData.minIndex].dispatchEvent('send', { backColor: '' });
              insideData.minIndex = i;
              this.data.items[insideData.minIndex].dispatchEvent('send', { backColor: 'yellow' });
            }
            return utils.wait(this.data.speed);
          });
      }
      // 交换
      promise = promise
        .then(() => {
          if (insideData.minIndex === insideData.start) { return false; }
          return this.methods.exchange(insideData.start, insideData.minIndex);
        })
        .then(() => {
          // 排序之后
          this.data.sortTimes += 1;
          this.data.items[insideData.start].dispatchEvent('send', { backColor: 'blue' });
        });
      return promise;
    },
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        this.methods.getRandom();
        return 1;
      });
      // 选择排序
      Dom.of(this.elements.sort).on('click', () => {
        if (this.data.sortTimes > this.data.items.length - 2) {
          return console.warn('排序已完成,你可以点击左侧按钮重新开始');
        }
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        // 排序之前
        let promise = new Promise((resolve) => {
          if (this.data.isSorted) {
            this.methods.getRandom();
          }
          this.data.speed = 1000 - Number(this.elements.speed.value) * 100;
          this.data.items.forEach((item) => {
            item.dispatchEvent('send', { backColor: '' });
          });
          resolve();
        });
        // 排序
        for (let i = 0; i < this.data.items.length - 1; i += 1) {
          promise = promise
            .then(() => this.methods.sortOnce());
        }
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.isSorted = true;
            console.log('done');
          });
        return promise;
      });
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
};

export default param;
