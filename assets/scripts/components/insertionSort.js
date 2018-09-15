import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

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
      isRunning: false,
    };
  },
  selectors: {
    ul: 'ul',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    container: '*[name=container]',
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
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        return this.methods.getRandom();
      });
      Dom.of(this.elements.sort).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        if (this.data.isSorted || this.data.array.every(item => !item || item <= 0)) {
          this.methods.getRandom();
        }
        // 排序之前
        this.data.isRunning = true;
        this.data.speed = 1000 - Number(this.elements.speed.value) * 100;
        // 排序
        let promise = Promise.resolve();
        for (let i = 0; i < this.data.items.length; i += 1) {
          promise = promise
            .then(() => this.methods.sortOnce())
            .then(() => utils.wait(this.data.speed));
        }
        // 放回到原数组位置
        promise = promise.then(() => {
          let goBack = Promise.resolve();
          this.data.container.forEach((item) => {
            goBack = goBack
              .then(() => {
                item.dispatchEvent('send', { method: 'unfall' });
                item.dispatchEvent('send', { method: 'unselect' });
                return utils.wait(this.data.speed);
              });
          });
          return goBack;
        });
        // 排序后
        promise = promise
          .then(() => {
            this.data.items = this.data.container;
            this.data.array = this.data.items.map(item => item.data.value);
            this.data.container = [];
            this.data.isRunning = false;
            this.data.isSorted = true;
            this.data.sortTimes = 0;
            console.log('done');
          });
      });
    },
    sortOnce() {
      // 排序前
      const inTurn = this.data.items[this.data.sortTimes];
      const insideData = {
        index: -1,
      };
      // 搜索位置
      let promise = Promise.resolve();
      for (let i = 0; i < this.data.container.length; i += 1) {
        promise = promise
          .then(() => {
            if (insideData.index >= 0) { return false; }
            const bottomItem = this.data.container[i];
            // 红色高亮
            let highLight = Promise.resolve();
            highLight = highLight
              .then(() => {
                bottomItem.dispatchEvent('send', { method: 'highLight', time: this.data.speed });
                return utils.wait(this.data.speed);
              });
            if (bottomItem.data.value > inTurn.data.value) {
              insideData.index = i;
              // 黄色高亮
              highLight = highLight
                .then(() => {
                  bottomItem.dispatchEvent('send', { method: 'highLight', backColor: 'yellow', time: this.data.speed });
                  return utils.wait(this.data.speed);
                });
            }
            return highLight;
          });
      }
      // 让位
      promise = promise
        .then(() => {
          this.methods.insertContainer(inTurn);
          if (insideData.index < 0) { return false; }
          const makeWay = new Promise((resolve) => {
            this.data.container.forEach((item, index) => {
              if (index > insideData.index) {
                item.dispatchEvent('send', { order: index + 1 });
              }
            });
            resolve(utils.wait(this.data.speed));
          });
          return makeWay;
        });
      // 插入
      promise = promise
        .then(() => {
          const order = this.data.container.findIndex(item => item === inTurn) + 1;
          // 找不到inturn??
          inTurn.dispatchEvent('send', { order });
          inTurn.dispatchEvent('send', { method: 'select' });
          inTurn.dispatchEvent('send', { method: 'fall' });
          this.data.sortTimes += 1;
          return utils.wait(this.data.speed);
        });
      return promise;
    },
    // 插入到 this.data.container
    insertContainer(cpt) {
      let index = -1;
      for (let i = 0; i < this.data.container.length; i += 1) {
        if (this.data.container[i].data.value > cpt.data.value) {
          index = i;
          break;
        }
      }
      if (index === -1) {
        index = this.data.container.length;
      }
      this.data.container.splice(index, 0, cpt);
      return this.data.container;
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
};

export default param;
