
import Dom from '../dom';
import utils from '../utils';
import * as sort from '../sort/index';

const radixSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  // 设置一个长度为10的容器，每个成员是一个空数组
  const container = [];
  const initContainer = () => {
    container.splice(0, 10, ...[[], [], [], [], [], [], [], [], [], []]);
  };
  initContainer();
  // 找到最大值
  let max = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
  });
  // 计算出位数
  let decimal = 0;
  while (max > 0) {
    decimal += 1;
    max = Math.trunc(max / 10);
  }
  decimal = (decimal >= 1) ? decimal : 1;
  // 最大值是2位数就排2次，3位数就排3次
  for (let time = 0; time < decimal; time += 1) {
    // 算出对应位数的数字，并按分组放进容器
    array.forEach((item) => {
      const index = Math.trunc(item / (10 ** time)) % 10;
      container[index].push(item);
    });
    // 替换原数组并清空容器
    array.splice(0, array.length);
    container.forEach(team => array.push(...team));
    initContainer();
  }
  return array;
};

const param = {
  name: 'radixSort',
  query: 'radixSort',
  url: './assets/templates/radixSort.html',
  data() {
    return {
      array: [],
      items: [],
      width: 800,
      height: 400,
      digit: 0,
      fps: 60,
      containers: [[], [], [], [], [], [], [], [], [], []],
    };
  },
  selectors: {
    canvas: 'canvas',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
    test: '*[name=test]',
  },
  methods: {
    init() {
      this.data.ctx = this.elements.canvas.getContext('2d');
      this.methods.getRandom();
      // items初始状态
      let left = 0;
      let top = 0;
      this.data.items = this.data.array.map((value, index) => {
        const item = {
          value,
          width: 40,
          height: 20,
          order: index + 1,
          margin: { right: 10, bottom: 10 },
          highLightDigit: -1,
        };
        item.left = left;
        item.top = top;
        left += (item.width + item.margin.right);
        if (left >= this.data.width - item.width) {
          left = 0;
          top += (item.height + item.margin.bottom);
        }
        return item;
      });
      this.methods.run();
      let promise = Promise.resolve();
      return promise;
    },
    fillDefault() {
      // 画items
      this.data.ctx.font = '14px Georgia';
      this.data.ctx.textAlign = 'center';
      this.data.ctx.textBaseline = 'middle';
      this.data.items.forEach((item) => {
        this.data.ctx.strokeRect(item.left, item.top, item.width, item.height);
        const center = { x: item.left + item.width / 2, y: item.top + item.height / 2 };
        if (item.highLightDigit >= 0) {
          const fontWidth = Math.ceil(this.data.ctx.measureText(`${item.value}`).width);
          const grd = this.data.ctx.createLinearGradient(center.x - fontWidth / 2, 0, center.x + fontWidth / 2, 0);
          if (item.highLightDigit === 0) {
            grd.addColorStop(0, '#000');
            grd.addColorStop(0.5, '#000');
            grd.addColorStop(0.5, '#f00');
            grd.addColorStop(1, '#f00');
          } else if (item.highLightDigit === 1) {
            grd.addColorStop(0, '#f00');
            grd.addColorStop(0.5, '#f00');
            grd.addColorStop(0.5, '#000');
            grd.addColorStop(1, '#000');
          }
          this.data.ctx.fillStyle = grd;
        }
        const text = (item.value < 10) ? `0${item.value}` : `${item.value}`;
        this.data.ctx.fillText(text, item.left + item.width / 2, item.top + item.height / 2);
        this.data.ctx.fillStyle = '#000';
      });
      // 画容器
      const container = {
        margin: { left: 20, right: 20 },
        height: 20,
        left: 0,
        bottom: 20,
        count: 10,
      };
      this.data.container = container;
      this.data.ctx.beginPath();
      const start = {
        x: container.left + container.margin.left,
        y: this.data.height - container.bottom,
      };
      const end = {
        x: this.data.width - container.margin.right,
        y: start.y,
      };
      this.data.ctx.moveTo(start.x, start.y);
      this.data.ctx.lineTo(end.x, end.y);
      container.width = this.data.width - container.margin.left - container.margin.right
        - container.left;
      container.spacingX = container.width / container.count;
      for (let index = 0; index < container.count + 1; index += 1) {
        start.x = container.margin.left + container.left + index * container.spacingX;
        start.y = this.data.height - container.bottom;
        end.x = start.x;
        end.y = start.y - container.height;
        this.data.ctx.moveTo(start.x, start.y);
        this.data.ctx.lineTo(end.x, end.y);
        this.data.ctx.fillText(index, start.x + container.spacingX / 2, start.y + 10);
      }
      this.data.ctx.stroke();
    },
    run() {
      this.data.interval = setInterval(() => {
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.methods.fillDefault();
      }, 1000 / this.data.fps);
      return this.data.interval;
    },
    pause() {
      return clearInterval(this.data.interval);
    },
    radixSort() {
      let promise = Promise.resolve();
      this.data.digit = 0;
      for (let index = 0; index < 2; index += 1) {
        promise = promise
          .then(() => this.methods.radixSortOnce())
          .then(() => {
            this.data.digit += 1;
            return utils.wait(222);
          });
      }
      return promise;
    },
    radixSortOnce() {
      // 找到分组->下放->todo 返回 todo
      this.data.items.forEach((item) => {
        const text = (item.value < 10) ? `0${item.value}` : `${item.value}`;
        item.teamIndex = Number(text[text.length - 1 - this.data.digit]);
        item.highLightDigit = this.data.digit;
      });
      // 下放
      let promise = Promise.resolve();
      this.data.items.forEach((item) => {
        promise = promise.then(() => {
          const team = this.data.containers[item.teamIndex];
          team.push(item);
          const positon = {
            left: this.data.container.margin.left + this.data.container.spacingX * (item.teamIndex + 0.25),
            top: this.data.height - this.data.container.bottom - team.length * (item.height + item.margin.bottom),
          };
          return this.methods.itemMoveTo(item, positon.left, positon.top);
        });
      });
      // 返回
      promise = promise.then(() => {
        let left = 0;
        let top = 0;
        let goback = Promise.resolve();
        this.data.containers.forEach((team) => {
          team.forEach((item) => {
            goback = goback.then(() => {
              const positon = { left, top };
              left += (item.width + item.margin.right);
              if (left >= this.data.width - item.width) {
                left = 0;
                top += (item.height + item.margin.bottom);
              }
              return this.methods.itemMoveTo(item, positon.left, positon.top);
            });
          });
        });
        return goback;
      });
      // 替换原数组并取消高亮
      promise = promise.then(() => {
        const newItems = [];
        this.data.containers.forEach((team) => {
          newItems.push(...team);
          team.splice(0, team.length);
        });
        this.data.items.splice(0, newItems.length, ...newItems);
        this.data.items.forEach((item) => {
          item.highLightDigit = -1;
        });
      });
      return promise;
    },
    itemMoveTo(item, left, top, mesc = 1000) {
      // 有问题 缺帧
      if (!item || !Number.isSafeInteger(item.value)) { return false; }
      if (!Number.isSafeInteger(left) || !Number.isSafeInteger(top)) { return false; }
      const frameCount = mesc / 1000 * this.data.fps;
      const timeSpacing = utils.retain(1000 / this.data.fps, 2);
      const step = {
        x: (left - item.left) / frameCount,
        y: (top - item.top) / frameCount,
      };
      const before = { left: item.left, top: item.top };
      let promise = Promise.resolve();
      for (let index = 0; index <= frameCount; index += 1) {
        promise = promise.then(() => {
          item.left = before.left + step.x * index;
          item.top = Math.trunc(before.top + step.y * index);
          const wait = Math.round(timeSpacing * (index + 1)) - Math.round(timeSpacing * index);
          return utils.wait(wait);
        });
      }
      return promise;
    },
    /** 获取20个随机数 */
    getRandom(number = 20) {
      if (!Number.isSafeInteger(number)) { throw new TypeError(`参数number不能是${number}`); }
      const ary = new Array(number);
      for (let index = 0; index < ary.length; index += 1) {
        ary[index] = Math.trunc(3 * Math.random());
      }
      this.data.array = ary;
      this.data.bubbleSortedTimes = 0;
      this.data.isBubbleSortDone = 0;
      this.data.isFinished = false;
    },
    bindEvents() {
      // 测试方法
      Dom.of(this.elements.test).on('click', () => {
        const container = this.data.array.slice(0, 10).map((value, index) => {
          const ary = new Array(this.data.array.length - 10 - index);
          ary.fill(value);
          const item = ary.join('');
          return item;
        });
        // sort.sort(container, (item) => {
        //   return item.value;
        // });
        sort.sort(container)
        console.log(container)
        // console.log(container)
      });
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        this.methods.getRandom();
        this.data.items.forEach((item, index) => {
          item.value = this.data.array[index];
        });
      });
      Dom.of(this.elements.sort).on('click', () => {
        radixSort(this.data.array);
        this.methods.radixSort();
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
};

export default param;
