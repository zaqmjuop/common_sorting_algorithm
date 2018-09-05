
import Dom from '../dom';
import treeItem from './treeItem';
import Component from './component';

const param = {
  name: 'heapSort',
  query: 'heapSort',
  url: './assets/templates/heapSort.html',
  data() {
    return {
      array: [],
      items: [],
    };
  },
  selectors: {
    ul: 'ul',
    heapBoard: '.heap-board',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
  },
  methods: {
    init() {
      console.log(this.elements.heapBoard)
      let promise = Promise.resolve();
      for (let index = 0; index < 20; index += 1) {
        const treeItemParam = Object.assign({ present: { value: index } }, treeItem);
        promise = promise
          .then(() => {
            let result;
            if (index === 0) {
              result = this.appendChild(treeItemParam, this.elements.heapBoard, -1)
            } else {
              const isLeft = (index % 2 === 1);
              const fatherIndex = Math.ceil(index / 2) - 1;
              const father = this.data.items[fatherIndex];
              if (isLeft) {
                result = father.methods.appendLeft(treeItemParam);
              } else {
                result = father.methods.appendRight(treeItemParam);
              }
            }
            return result;
          })
          .then((item) => {
            this.data.items.push(item)
          });
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
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        this.methods.getRandom();
        return this.data.array;
      });
      Dom.of(this.elements.sort).on('click', () => {
        console.log('点击了排序');
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
      .then(() => this.methods.bindEvents())
      .then(() => {
        console.log(this.data.items)
      });
  },
};

export default param;
// 先复习一下排序过程
/**
 * 分组 排序 替换原值
 */
