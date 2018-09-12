import li from './li';
import Dom from '../dom';
import { insertionSort } from '../sort/index';
import utils from '../utils';

const bucketSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  const DEFAULT_BUCKET_SIZE = 5;
  let max = array[0];
  let min = array[0];
  // 找到最大最小值
  array.forEach((item) => {
    if (item > max) { max = item; }
    if (item < min) { min = item; }
  });
  // 找到断点
  const breakpoints = []; // 中间的断点，不包括min和max
  const spacing = Math.trunc((max - min) / 5);
  let breakpoint = min;
  for (let index = 0; index < DEFAULT_BUCKET_SIZE - 1; index += 1) {
    breakpoint += spacing;
    breakpoints.push(breakpoint);
  }
  // 创建一个二元数组容器,长度为DEFAULT_BUCKET_SIZE，每个成员是一个空数组
  const container = [];
  for (let index = 0; index < DEFAULT_BUCKET_SIZE; index += 1) {
    container.push([]);
  }
  // 将原数组按分组放入容器内
  array.forEach((item) => {
    let index = breakpoints.findIndex(point => (point >= item));
    if (index < 0) { index = DEFAULT_BUCKET_SIZE - 1; }
    container[index].push(item);
  });
  // 对容器每组进行插入排序
  container.forEach(item => insertionSort(item));
  // 替换原数组
  array.splice(0, array.length);
  container.forEach(item => array.push(...item));
  return array;
};

const param = {
  name: 'bucketSort',
  query: 'bucketSort',
  url: './assets/templates/bucketSort.html',
  data() {
    return {
      array: [],
      items: [],
    };
  },
  selectors: {
    list: '.list',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    max: '*[name=max]',
    min: '*[name=min]',
  },
  methods: {
    init() {
      let promise = Promise.resolve();
      for (let index = 0; index < 20; index += 1) {
        const liParam = Object.assign({ present: { order: index + 1, heightRate: 1 } }, li);
        promise = promise.then(() => this.appendChild(liParam, this.elements.list, -1))
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
    changeEndpoint(value) {
      if (!Number.isSafeInteger(value)) { return false; }
      let result;
      if (value > this.data.max) {
        this.data.max = value;
        result = 'max';
        Dom.of(this.elements.max).text(this.data.max);
      } else if (value < this.data.min) {
        this.data.min = value;
        result = 'min';
        Dom.of(this.elements.min).text(this.data.min);
      }
      return result;
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
        const DEFAULT_BUCKET_SIZE = 3;
        let promise = new Promise((resolve) => {
          this.data.max = this.data.items[0].data.value;
          this.data.min = this.data.items[0].data.value;
          Dom.of(this.elements.max).text(this.data.max);
          Dom.of(this.elements.min).text(this.data.min);
          resolve();
        });
        this.data.items.forEach((item) => {
          promise = promise
            .then(() => {
              const isEndpoint = this.methods.changeEndpoint(item.data.value);
              if (isEndpoint) {
                item.dispatchEvent('send', { method: 'highLight', time: 111, backColor: 'yellow' });
              } else {
                item.dispatchEvent('send', { method: 'highLight', time: 111 });
              }
              return utils.wait(111);
            });
        });
        // 找到断点
        const breakpoints = []; // 中间的断点，不包括min和max
        promise = promise.then(() => {
          const spacing = Math.trunc((this.data.max - this.data.min) / DEFAULT_BUCKET_SIZE);
          let breakpoint = this.data.min;
          for (let index = 0; index < DEFAULT_BUCKET_SIZE - 1; index += 1) {
            breakpoint += spacing;
            breakpoints.push(breakpoint);
          }
          // 创建一个二元数组容器,长度为DEFAULT_BUCKET_SIZE，每个成员是一个空数组
          this.data.containers = [];
          for (let index = 0; index < DEFAULT_BUCKET_SIZE; index += 1) {
            this.data.containers.push([]);
          }
        });
        // 将原数组按分组放入容器内
        this.data.items.forEach((item) => {
          promise = promise.then(() => {
            let teamIndex = breakpoints.findIndex(point => (point >= item.data.value));
            if (teamIndex < 0) { teamIndex = DEFAULT_BUCKET_SIZE - 1; }
            // 插入
            return this.methods.insertContainer(item, teamIndex);
          });
        });
        // 替换回原位
        promise = promise.then(() => {
          this.data.items = [];
          let order = 1;
          let goback = Promise.resolve();
          this.data.containers.forEach((container) => {
            container.forEach((item) => {
              goback = goback.then(() => {
                this.data.items.push(item);
                item.dispatchEvent('send', { order });
                order += 1;
                item.methods.unfall();
                return utils.wait(222);
              });
            });
          });
          return goback;
        });
        promise = promise.then(() => {
          this.data.array = this.data.items.map(item => item.data.value);
        });
        return promise;
      });
    },
    // 插入到this.data.containers
    insertContainer(cpt, teamIndex) {
      if (!this.data.containers || !this.data.containers[teamIndex]) { return false; }
      let insertIndex = -1;
      const container = this.data.containers[teamIndex];
      let promise = Promise.resolve();
      // 找到位置
      container.forEach((item, index) => {
        promise = promise.then(() => {
          if (insertIndex > -1) { return false; }
          item.methods.highLight(222, 'yellow');
          if (item.data.value > cpt.data.value) {
            insertIndex = index;
          }
          return utils.wait(222);
        });
      });
      promise = promise.then(() => {
        if (insertIndex < 0) { insertIndex = container.length; }
      });
      // 让位
      promise = promise.then(() => {
        container.forEach((item, index) => {
          if (index >= insertIndex) {
            item.dispatchEvent('send', { order: item.data.order + 1 });
          }
        });
        return utils.wait(222);
      });
      // 插入
      promise = promise.then(() => {
        container.splice(insertIndex, 0, cpt);
        const bottom = 100 + teamIndex * 100;
        cpt.methods.fall(bottom);
        cpt.dispatchEvent('send', { order: insertIndex + 1 });
        return utils.wait(444);
      });
      return promise;
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
