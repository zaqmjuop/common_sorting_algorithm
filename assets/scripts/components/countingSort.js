import li from './li';
import Dom from '../dom';
import utils from '../utils';
import Component from './component';

const countingSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  if (array.some(item => !Number.isSafeInteger(item))) { return false; }
  // 确定范围
  let max = array[0];
  let min = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
    if (item < min) { min = item; }
  });
  // 设一个容器，容器的每个成员是一个数组，值相同的成员放到同一数组
  const container = [];
  for (let index = min; index <= max; index += 1) {
    container.push([]);
  }
  array.forEach((item) => {
    const index = item - min;
    container[index].push(item);
  });
  // 清空原数组
  array.splice(0, array.length);
  // 把容器中每个数组中的成员重新放回原数组
  container.forEach((team) => {
    team.forEach((item) => {
      array.push(item);
    });
  });
  return array;
};


const param = {
  name: 'countingSort',
  query: 'countingSort',
  url: './assets/templates/countingSort.html',
  data() {
    return {
      array: [],
      items: [],
      containers: [],
      bgItems: [],
    };
  },
  selectors: {
    ul: 'ul',
    bottomList: 'ul[name=bottom-list]',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    max: '*[name=max]',
    min: '*[name=min]',
    counting: '.counting',
  },
  methods: {
    init() {
      let promise = Promise.resolve();
      for (let index = 0; index < 20; index += 1) {
        const liParam = Object.assign({ present: { order: index + 1 } }, li);
        promise = promise.then(() => this.appendChild(liParam, this.elements.ul, -1))
          .then(item => this.data.items.push(item));
      }
      // 添加背景li
      for (let index = 0; index < 20; index += 1) {
        const present = { order: index + 1, value: index };
        const liParam = Object.assign({ present }, li);
        const item = Component.of(liParam);
        this.data.bgItems.push(item);
        promise = promise
          .then(() => {
            const custom = item.load().then(() => {
              Dom.of(item.template).css('backgroundColor', '#ddd');
              Dom.of(item.template).css('zIndex', '0');
            });
            return custom;
          });
      }
      return promise;
    },
    /** 获取20个随机数 */
    getRandom(number = 20) {
      if (!Number.isSafeInteger(number)) { throw new TypeError(`参数number不能是${number}`); }
      const ary = new Array(number);
      for (let index = 0; index < ary.length; index += 1) {
        ary[index] = Math.trunc(10 * Math.random()) + 1;
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
    fillContainers() {
      const lis = Dom.of(this.elements.counting).children('li');
      this.data.containers.forEach((team, index) => {
        const count = team.length;
        const item = Dom.of(lis[index]);
        const beforeText = item.text();
        if (beforeText === '' || Number(beforeText) !== count) {
          item.text(count);
        }
      });
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
        let promise = new Promise((resolve) => {
          const firstValue = this.data.items[0].data.value;
          this.data.max = firstValue;
          this.data.min = firstValue;
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
        promise = promise
          .then(() => {
            // 设置容器
            this.data.containers = [];
            for (let value = this.data.min; value <= this.data.max; value += 1) {
              console.log(value, value + this.data.min, this.data.max)
              this.data.containers.push([]);
              const liItem = this.data.bgItems[value - this.data.min];
              liItem.dispatchEvent('send', { value });
              this.appendChild(liItem, this.elements.bottomList, -1);
            }
            this.methods.fillContainers();
            console.log(this.data.containers)
            return utils.wait(111);
          }).then(() => {
            // 收容到容器
            let takein = Promise.resolve();
            this.data.items.forEach((item) => {
              takein = takein.then(() => {
                const order = item.data.value - this.data.min + 1;
                this.data.containers[order - 1].push(item);
                item.dispatchEvent('send', { order });
                item.methods.fall(-150);
                this.methods.fillContainers();
                return utils.wait(111);
              });
            });
            return takein;
          }).then(() => {
            // 取出
            let takeout = Promise.resolve();
            let order = 1;
            this.data.containers.forEach((team) => {
              team.forEach((item, index) => {
                takeout = takeout.then(() => {
                  item.dispatchEvent('send', { order });
                  order += 1;
                  item.methods.unfall();
                  team.pop();
                  this.methods.fillContainers();
                  console.log(team, index)
                  return utils.wait(111);
                });
              });
            });
            return takeout;
          }).then(() => {
            // 整理
            this.data.items.sort((a, b) => (a.data.order - b.data.order));
            this.methods.getArray();
            Dom.of(this.elements.bottomList).html('');
            const countings = Dom.of(this.elements.counting).children('li');
            countings.forEach((item) => {
              Dom.of(item).text('');
            });
            Dom.of(this.elements.max).text('');
            Dom.of(this.elements.min).text('');
            console.log(this.data)
          });


        console.log('点击了排序');
        countingSort(this.data.array);
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
      .then(() => this.methods.bindEvents());
  },
  implanted() { console.log('implanted countingSort'); },
};

export default param;
