
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

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
    speed: '*[name=speed]',
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
    },
    fillDefault() {
      // 画items
      this.data.ctx.font = '14px Georgia';
      this.data.ctx.textAlign = 'center';
      this.data.ctx.textBaseline = 'middle';
      this.data.items.forEach((item) => {
        this.data.ctx.strokeRect(item.left, item.top, item.width, item.height);
        const center = { x: item.left + item.width / 2, y: item.top + item.height / 2 };
        const str = String(item.value).padStart(this.data.maxDigit, '0');
        if (item.highLightDigit >= 0) {
          const fontWidth = Math.ceil(this.data.ctx.measureText(str).width);
          const gradientStart = center.x - fontWidth / 2;
          const gradientEnd = center.x + fontWidth / 2;
          const gradient = this.data.ctx.createLinearGradient(gradientStart, 0, gradientEnd, 0);
          gradient.addColorStop(0, '#000');
          gradient.addColorStop((this.data.maxDigit - this.data.digit - 1) / this.data.maxDigit, '#000');
          gradient.addColorStop((this.data.maxDigit - this.data.digit - 1) / this.data.maxDigit, '#f00');
          gradient.addColorStop((this.data.maxDigit - this.data.digit) / this.data.maxDigit, '#f00');
          gradient.addColorStop((this.data.maxDigit - this.data.digit) / this.data.maxDigit, '#000');

          gradient.addColorStop(1, '#000');
          this.data.ctx.fillStyle = gradient;
        }
        this.data.ctx.fillText(str, item.left + item.width / 2, item.top + item.height / 2);
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
      // 排序前
      let max = this.data.items[0].value;
      let min = this.data.items[0].value;
      this.data.items.forEach((item) => {
        if (item.value > max) { max = item.value; }
        if (item.value < min) { min = item.value; }
      });
      this.data.maxDigit = Math.trunc(Math.log10(max)) + 1;
      this.data.digit = 0;
      // 排序
      let promise = Promise.resolve();
      for (let index = 0; index < this.data.maxDigit; index += 1) {
        promise = promise
          .then(() => this.methods.radixSortOnce())
          .then(() => {
            this.data.digit += 1;
            return utils.wait(this.data.speed);
          });
      }
      // 排序后
      promise = promise
        .then(() => {
          this.data.maxDigit = 1;
          this.data.array = this.data.items.map(item => item.value);
        });
      return promise;
    },
    radixSortOnce() {
      const digitIndex = this.data.maxDigit - 1 - this.data.digit;
      // 找到分组->下放->返回
      this.data.items.forEach((item) => {
        const str = String(item.value).padStart(this.data.maxDigit, '0');
        item.teamIndex = Number(str[digitIndex]);
        item.highLightDigit = this.data.digit;
      });
      // 下放
      let promise = Promise.resolve();
      this.data.items.forEach((item) => {
        promise = promise.then(() => {
          const team = this.data.containers[item.teamIndex];
          team.push(item);
          const left = this.data.container.margin.left
            + this.data.container.spacingX * (item.teamIndex + 0.25);
          const top = this.data.height
            - this.data.container.bottom
            - team.length * (item.height + item.margin.bottom);
          const positon = { left, top };
          return this.methods.itemMoveTo(item, positon.left, positon.top, this.data.speed);
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
              return this.methods.itemMoveTo(item, positon.left, positon.top, this.data.speed);
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
    getRandom() {
      if (this.data.isRunning) {
        return console.warn('正在运行中,你可以刷新页面重新开始');
      }
      this.data.isSorted = false;
      this.data.array = getRandomArray(20, 0, 99);
      this.data.items.forEach((item, index) => {
        item.value = this.data.array[index];
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
        this.data.bubbleSortedTimes = 0;
        this.data.isBubbleSortDone = false;
        this.data.exchangeTimes = 0;
        // 排序
        let promise = this.methods.radixSort();
        // 排序后
        promise = promise.then(() => {
          this.data.isRunning = false;
          this.data.isSorted = true;
        });
        return promise;
      });
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
