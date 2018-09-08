import li from './li';
import Dom from '../dom';
import { mergeSort } from '../sort/index';
import Component from './component';
import utils from '../utils';

function* colorNameGenerator() {
  let time = -1;
  while (1) {
    time += 1;
    if (time > 30) { time = 0; }
    let color;
    const index = time % 3;
    const value = 240 - Math.trunc(time / 6) * 32;
    if (Math.trunc(time / 3) % 2 === 0) {
      color = [0, 0, 0];
      color.splice(index, 1, value);
    } else {
      color = [value, value, value];
      color.splice(index, 1, 0);
    }
    const color16 = color.map(item => (item).toString(16).padEnd(2, item));
    const name = `#${color16.join('')}`;
    yield name;
  }
}
const colorNameStore = colorNameGenerator();
// 获取一个颜色值
const takeColorName = () => colorNameStore.next().value;


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
        // 分组 排序 归并
        console.log('点击了排序');
        // 复制的数组能返回正确结果 原数组不能，不知道为什么
        this.data.containers = this.data.items.slice(0);
        const promise = Promise.resolve()
          .then(() => this.methods.mergeSort(this.data.containers));
        return promise;
      });
    },
    insertionStage(items) {
      if (!(items instanceof Array) || !items.every(item => Component.isComponent(item))) { return false; }
      // 插入排序并替换回原值
      const orders = items.map(item => item.data.order);
      const stage = [];
      let promise = Promise.resolve();
      items.forEach((item) => {
        promise = promise
          .then(() => {
            // 找到应该插入舞台位置
            for (let i = 0; i < stage.length; i += 1) {
              if (stage[i].data.value > item.data.value) {
                stage.splice(i, 0, item);
                break;
              }
            }
            if (!stage.includes(item)) {
              stage.push(item);
            }
          }).then(() => {
            // 舞台其他先让位
            stage.forEach((inStage, index) => {
              if (inStage !== item) {
                inStage.dispatchEvent('send', { order: index + 1 });
                item.methods.fall();
              }
            });
            return utils.wait(222);
          }).then(() => {
            // 将Item插入舞台
            const index = stage.indexOf(item);
            item.methods.fall();
            item.dispatchEvent('send', { order: index + 1 });
            return utils.wait(222);
          });
      });
      // 替换回原数组
      promise = promise
        .then(() => {
          items.splice(0, items.length, ...stage);
        }).then(() => {
          let goback = Promise.resolve();
          items.forEach((item, index) => {
            goback = goback.then(() => {
              const afterIndex = orders[index] - 1;
              this.data.items.splice(afterIndex, 1, item);
              item.dispatchEvent('send', { order: orders[index] });
              item.methods.unfall();
              return utils.wait(222);
            });
          });
          return goback;
        });
      return promise;
    },
    mergeSort(array = this.data.items) {
      if (!(array instanceof Array)) { return false; }
      if (array.some(item => !Component.isComponent(item))) { return false; }
      const promise = Promise.resolve()
        .then(() => {
          // 分组 高亮
          this.methods.shredding(array);
          this.methods.dyeing(array);
        })
        // 递归排序
        .then(() => this.methods.recursiveMergeSort(array))
        // 补充归并到最上层少一次排序
        .then(() => this.methods.insertionStage(array));
      return promise;
    },
    mergeSecondLowest(array) {
      // 合并倒数第二层
      if (!(array instanceof Array)) { return array; }
      if (!(array[0] instanceof Array)) { return array; }
      if (array[0].some(item => !Component.isComponent(item))) { return false; }
      let promise = Promise.resolve();
      const merge = [];
      array.forEach((team) => {
        if (team.length > 1) {
          promise = promise.then(() => this.methods.insertionStage(team));
        }
        promise = promise.then(() => {
          merge.push(...team);
        });
      });
      promise = promise.then(() => {
        array.splice(0, array.length, ...merge);
        this.methods.dyeing(array);
        return array;
      });
      return promise;
    },
    /** 将分好组的数组合并并排序 */
    recursiveMergeSort(array) {
      if (!(array instanceof Array)) { return array; }
      if (array.length < 2) { return array; }
      const isSecondLowestArray = (ary) => {
        const result = ary instanceof Array
          && ary[0] instanceof Array
          && ary[0].every(item => item instanceof Component);
        return result;
      };

      let promise = Promise.resolve();

      if (isSecondLowestArray(array)) {
        promise = promise.then(() => this.methods.mergeSecondLowest(array));
      } else {
        array.forEach((team) => {
          promise = promise.then(() => this.methods.recursiveMergeSort(team));
        })
        promise = promise.then(() => {
          if (isSecondLowestArray(array)) {
            return this.methods.recursiveMergeSort(array);
          }
        })
        // 归并
      }

      return promise;
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
    dyeing(items = this.data.items) {
      const isLowest = items.every(item => item instanceof Component);
      if (isLowest) {
        const color = takeColorName();
        items.forEach((item) => {
          Dom.of(item.template).css('backgroundColor', color);
        });
      } else {
        items.forEach((team) => {
          this.methods.dyeing(team);
        });
      }
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
