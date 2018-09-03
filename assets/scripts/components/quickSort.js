import li from './li';
import Dom from '../dom';
import utils from '../utils';

function quickSort(array, startIndex = 0, endIndex = array.length - 1) {
  const isValidArgs = array instanceof Array
    && Number.isSafeInteger(startIndex)
    && Number.isSafeInteger(endIndex)
    && startIndex >= 0
    && startIndex < endIndex;
  if (!isValidArgs) { return false; }
  let rightIndex = endIndex; // 设置右端点
  let leftIndex = startIndex; // 设置左端点
  const reference = array[leftIndex]; // 取左端点值为参照物
  while (leftIndex < rightIndex) { // 左右端点不重合时循环排序
    for (; leftIndex < rightIndex; rightIndex -= 1) { // 从右端点开始收紧
      if (array[rightIndex] < reference) {
        // 如果右端点比参照物小，就赋值到左端点的位置上，由于左端点已经被赋值为目标值，所以左端点就收紧一位。此时右端点是个多余值
        array.splice(leftIndex, 1, array[rightIndex]); // 把左端点赋值为右端点值
        // 此时右端点为多余值，参照物不在数组中
        leftIndex += 1; // 由于左端点已经被赋值，于是将左端点收紧一位
        break;
      }
      // 如果从右侧遍历没有找到比参照物小的值，右端点会收紧到与左端点重合
    }
    // 如果已经从右侧找到比参照物小的值而使左右端点未重合，那么开始从左端点开始找比参照物大的值
    for (; leftIndex < rightIndex; leftIndex += 1) { // 从左端点开始收紧
      if (array[leftIndex] > reference) {
        // 如果从左侧找到比参照物大的值，把左端点值赋值到右端点，那么左端点就变成了多余值位置
        array.splice(rightIndex, 1, array[leftIndex]);
        rightIndex -= 1; // 由于右端点已经被赋值，于是将左端点收紧一位,然后进入下一次循环
        break;
      }
      // 如果从左侧没有找到比参照物大的值，左端点会收紧到与右端点重合
    }
  }
  // 到这里左右端点重合，且位置是多余值的位置
  array.splice(leftIndex, 1, reference); // 把参照物赋值回多余值位置
  if (leftIndex - 1 > 0) {
    quickSort(array, 0, leftIndex - 1); // 递归左端点的左侧部分
  }
  if (endIndex > leftIndex + 1) {
    quickSort(array, leftIndex + 1, endIndex); // 递归左端点的右侧部分
  }
  return array;
}

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
            this.data.items.splice(index1, 1, item2);
            this.data.items.splice(index2, 1, item1);
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
        // 分组 排序 替换原值
        console.log('点击了排序');
        this.methods.quickSortRecursion();
        console.log(this.data.array);
      });
    },
    quickSortOnce(startIndex = 0, endIndex = this.data.items.length - 1) {
      // 分组
      /** @todo */
      let leftIndex = startIndex; // 变化后左端点
      let rightIndex = endIndex; // 变化后右端点
      const reference = this.data.items[leftIndex]; // 取左端点值为参照物
      // 显示范围
      for (let index = startIndex; index <= endIndex; index += 1) {
        const item = this.data.items[index];
        if (index === leftIndex) {
          Dom.of(item.template).addClass('yellow');
        } else {
          item.methods.select();
        }
      }
      // 从右侧收紧 找到第一个较小值停止
      for (; leftIndex < rightIndex; rightIndex -= 1) {
        if (this.data.items[rightIndex].data.value < reference.data.value) {
          break; // 没有换值 从哪里开始 rightIndex会在哪 从end到left
        }
      }
      // 从左侧收紧 找到第一个较大值停止
      for (; leftIndex < rightIndex; leftIndex += 1) {
        if (this.data.items[leftIndex].data.value > reference.data.value) {
          break;
        }
      }
      // 右向左动画
      let promise = Promise.resolve();
      for (let index = endIndex; index >= rightIndex; index -= 1) {
        const item = this.data.items[index];
        promise = promise
          .then(() => {
            // 高亮一秒
            item.methods.highLight(222);
            return utils.wait(222);
          }).then(() => {
            let async;
            if (index === rightIndex && rightIndex !== startIndex) {
              // 怎么收紧rightIndex
              async = this.methods.exchange(startIndex, index)
                .then(() => {
                  item.methods.unselect();
                  utils.wait(222);
                });
            } else {
              item.methods.unselect();
              async = utils.wait(222);
            }
            return async.then(() => console.log(this.data.items.map(item1 => item1.data.order)));
          });
      }

      // 左向右动画
      for (let index = startIndex + 1; index <= leftIndex; index += 1) {
        const item = this.data.items[index];
        promise = promise
          .then(() => {
            // 高亮一秒
            if (index === leftIndex && item.data.value <= reference.data.value) { return false; }
            console.log(index, item.data.value)
            item.methods.highLight(222);
            return utils.wait(222);
          }).then(() => {
            let async;
            if (index === leftIndex && leftIndex !== rightIndex) {
              async = this.methods.exchange(rightIndex, index)
                .then(() => {
                  item.methods.unselect();
                  utils.wait(222);
                });
            } else {
              item.methods.unselect();
              async = utils.wait(222);
            }
            return async;
          });
      }
      // 从左向右收紧，右侧端点是focus 只能是先算出结果在写动画
      promise = promise
        .then(() => {
          this.data.startIndex = leftIndex;
          this.data.endIndex = Math.max(rightIndex - 1, leftIndex);
        });
      return promise.then(() => console.log('结算', this.data.endIndex, this.data.startIndex));
    },
    quickSortLoop() {
      let promise = Promise.resolve();
      promise = promise
        .then(() => {
          let result;
          console.log('开始', this.data.endIndex, this.data.startIndex)
          if (this.data.endIndex && this.data.startIndex === this.data.endIndex) {
            result = false;
          } else if (this.data.endIndex) {
            console.log('here')
            result = this.methods.quickSortOnce(this.data.startIndex, this.data.endIndex);
          } else {
            result = this.methods.quickSortOnce();
          }
          return result;
        });
      promise = promise
        .then(() => {
          // 循环 条件
          let loop;
          if (this.data.endIndex && this.data.endIndex !== this.data.startIndex) {
            console.log('循环')
            loop = Promise.resolve(this.methods.quickSortLoop());
          } else {
            const item = this.data.items[this.data.startIndex];
            Dom.of(item.template).removeClass('yellow');
          }
          return loop;
        });
      return promise;
    },
    quickSortRecursion() {
      // 递归
      let promise = this.methods.quickSortLoop();
      promise = promise
        .then(() => {
          // 保存首尾
          const end = this.data.endIndex;
          const start = this.data.startIndex;
          console.log('一次循环完成', this.data)
          const flag = start;
          let recursion;
          if (flag - 1 > 0) {
            console.log('left')
            this.data.startIndex = 0;
            this.data.endIndex = flag - 1;
            recursion = this.methods.quickSortRecursion();
          }
          return recursion;
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
  implanted() { console.log('implanted quickSort'); },
};

export default param;
