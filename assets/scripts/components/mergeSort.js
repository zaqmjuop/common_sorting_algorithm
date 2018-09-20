import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray, takeColorName } from '../helper';

// 二分一个数组
const halve = (array) => {
  if (!(array instanceof Array) || array.length < 2) { return array; }
  if (array.length <= 1) { return array; }
  const rightSrart = Math.ceil(array.length / 2);
  const left = array.slice(0, rightSrart);
  const right = array.slice(rightSrart, array.length);
  array.splice(0, array.length, left, right);
  return array;
};

/** 把一个数组切碎成多元数组 */
const cutUp = (array) => {
  if (!(array instanceof Array)) { return false; }
  halve(array);
  array.forEach((item) => {
    if (item instanceof Array && item.length > 1) {
      cutUp(item);
    }
  });
  return array;
};

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
      });
      return this.data.array;
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
        // 排序
        let promise = Promise.resolve()
          .then(() => this.methods.mergeSort(this.data.items));
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.isSorted = true;
            this.data.array = this.data.items.map(item => item.data.value);
            this.data.items.forEach((item) => {
              item.dispatchEvent('send', { backColor: '' });
            });
            console.log('done');
          });
        return promise;
      });
    },
    mergeSort(array = this.data.items) {
      if (!(array instanceof Array)) { return false; }
      cutUp(array);
      this.methods.dye(array);
      const promise = Promise.resolve()
        .then(() => this.methods.recursiveMergeSort(array));
      return promise;
    },
    mergeDeepest(leftAry, rightAry) {
      // 合并倒数第二层
      const valid = leftAry instanceof Array
        && rightAry instanceof Array
        && leftAry.every(item => !(item instanceof Array))
        && rightAry.every(item => !(item instanceof Array));
      if (!valid) { return false; }
      const concat = leftAry.concat(rightAry);
      this.methods.dye(concat);
      let promise = Promise.resolve(utils.wait(this.data.speed));
      const merge = [];
      const orders = concat.map(item => item.data.order);
      const maxLength = Math.max(leftAry.length, rightAry.length);
      for (let times = 0; times < leftAry.length + rightAry.length; times += 1) {
        promise = promise
          .then(() => {
            if (leftAry.length < 1 || rightAry.length < 1) { return false; }
            let compare = Promise.resolve();
            // 高亮备选
            compare = compare
              .then(() => {
                leftAry[0].dispatchEvent('send', { border: '5px solid #f90' });
                rightAry[0].dispatchEvent('send', { border: '5px solid #f90' });
                return utils.wait(this.data.speed);
              });
            const shiftAry = (leftAry[0].data.value < rightAry[0].data.value)
              ? leftAry : rightAry;
            compare = compare
              .then(() => {
                leftAry[0].dispatchEvent('send', { border: '' });
                rightAry[0].dispatchEvent('send', { border: '' });
                shiftAry[0].dispatchEvent('send', { border: '5px solid #c00' });
                return utils.wait(this.data.speed);
              }).then(() => {
                merge.push(shiftAry[0]);
                shiftAry[0].dispatchEvent('send', { border: '' });
                shiftAry[0].methods.fall();
                shiftAry[0].dispatchEvent('send', { order: merge.length });
                shiftAry.shift();
                return utils.wait(this.data.speed);
              });
            return compare;
          });
      }
      for (let times = 0; times < maxLength; times += 1) {
        promise = promise
          .then(() => {
            if (leftAry.length < 1 && rightAry.length < 1) { return false; }
            const restAry = (leftAry.length > 0) ? leftAry : rightAry;
            merge.push(restAry[0]);
            restAry[0].methods.fall();
            restAry[0].dispatchEvent('send', { order: merge.length });
            restAry.shift();
            return utils.wait(this.data.speed);
          });
      }
      // 排序后返回位置
      promise = promise
        .then(() => {
          let goback = Promise.resolve();
          merge.forEach((item, index) => {
            goback = goback
              .then(() => {
                item.methods.unfall();
                item.dispatchEvent('send', { order: orders[index] });
                return utils.wait(this.data.speed);
              });
          });
          return goback;
        });
      // 排序后
      promise = promise
        .then(() => merge);
      return promise;
    },
    /** 将分好组的数组合并并排序 */
    recursiveMergeSort(array) {
      if (!(array instanceof Array)) { return array; }
      const isDeepest = array[0] instanceof Array && !(array[0][0] instanceof Array);
      let promise = Promise.resolve();
      if (isDeepest) {
        promise = promise
          .then(() => this.methods.mergeDeepest(array[0], array[1]))
          .then(res => array.splice(0, array.length, ...res));
      } else {
        array.forEach((team) => {
          promise = promise
            .then(() => this.methods.recursiveMergeSort(team));
        });
        // 向上递归
        promise = promise
          .then(() => {
            if (!(array[0] instanceof Array)) { return false; }
            return this.methods.recursiveMergeSort(array);
          })
          .then(() => array);
      }
      return promise;
    },
    /** 染色分好的组 */
    dye(items = this.data.items) {
      const isDeepest = items.every(item => !(item instanceof Array));
      if (isDeepest) {
        const color = takeColorName();
        items.forEach((item) => {
          Dom.of(item.template).css('backgroundColor', color);
        });
      } else {
        items.forEach((team) => {
          this.methods.dye(team);
        });
      }
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
