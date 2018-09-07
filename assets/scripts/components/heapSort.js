
import Dom from '../dom';
import utils from '../utils';

const param = {
  name: 'heapSort',
  query: 'heapSort',
  url: './assets/templates/heapSort.html',
  data() {
    return {
      array: [],
      items: [],
      bubbled: [],
      width: 1000,
      height: 400,
      lineCount: 5,
      fps: 60,
    };
  },
  selectors: {
    canvas: 'canvas',
    heapBoard: '.heap-board',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
  },
  methods: {
    init() {
      this.methods.getRandom();
      this.data.ctx = this.elements.canvas.getContext('2d');
      // 添加Items
      this.data.array.forEach((value, index) => {
        let lineNum = 0;
        while ((2 ** lineNum) - 1 <= index) {
          lineNum += 1;
        }
        lineNum -= 1;
        const order = index - (2 ** lineNum) + 1;
        const left = this.data.width / (2 ** lineNum) * (order + 0.5);
        const top = this.data.height / this.data.lineCount * (lineNum + 0.5);
        const radius = 20;
        const item = {
          value, index, left, top, radius, lineNum, order,
        };
        this.data.items.push(item);
      });
      this.methods.run();
      this.methods.bubble();
      console.log(this.data.items)
      let promise = Promise.resolve();
      return promise;
    },
    run() {
      this.data.interval = setInterval(() => {
        this.data.ctx.clearRect(0, 0, this.data.width, this.data.height);
        this.methods.fillDefault();
      }, 1000 / this.data.fps);
      return this.data.interval;
    },
    fillDefault() {
      const ctx = this.elements.canvas.getContext('2d');
      const totalItems = this.data.items.concat(this.data.bubbled);
      // 画连接线
      this.data.items.forEach((item) => {
        const index = this.data.items.indexOf(item);
        if (index <= 0) { return false; }
        const fatherIndex = Math.trunc((index - 1) / 2);
        const father = this.data.items[fatherIndex];
        ctx.beginPath();
        ctx.moveTo(item.left, item.top);
        ctx.lineTo(father.left, father.top);
        ctx.stroke();
      });
      // 画圆
      ctx.fillStyle = '#fff';
      totalItems.forEach((item) => {
        ctx.beginPath();
        ctx.arc(item.left, item.top, item.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
      // 填充值
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      totalItems.forEach((item) => {
        ctx.fillText(item.value, item.left, item.top);
      });
      // moving
      this.data.items.forEach((item) => {
        if (!item.moving) { return false; }
        // 画圆
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(item.moving.left, item.moving.top, item.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        // 填充值
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value, item.moving.left, item.moving.top);
      });
    },
    // 交换2个数值
    exchange(index1, index2, mesc = 1000) {
      const item1 = this.data.items[index1];
      const item2 = this.data.items[index2];
      item1.moving = { left: item1.left, top: item1.top };
      item2.moving = { left: item2.left, top: item2.top };
      const frameCount = mesc / 1000 * this.data.fps;
      const timeStep = Math.round(1000 / this.data.fps);
      const item1AtLeft = item1.left <= item2.left;
      const item1AtTop = item1.top <= item2.top;
      const itemRelative = {
        left: item1AtLeft ? item1 : item2,
        right: item1AtLeft ? item2 : item1,
        top: item1AtTop ? item1 : item2,
        bottom: item1AtTop ? item2 : item1,
      };
      const xstep = Math.abs(item1.left - item2.left) / frameCount;
      const ystep = Math.abs(item1.top - item2.top) / frameCount;
      let promise = Promise.resolve();
      for (let index = 0; index < frameCount; index += 1) {
        promise = promise
          .then(() => {
            itemRelative.left.moving.left += xstep;
            itemRelative.right.moving.left -= xstep;
            itemRelative.top.moving.top += ystep;
            itemRelative.bottom.moving.top -= ystep;
            return utils.wait(timeStep);
          });
      }
      promise = promise.then(() => {
        this.data.items.splice(index1, 1, item2);
        this.data.items.splice(index2, 1, item1);
        const tmp = Object.assign({}, item1);
        item1.left = item2.left;
        item1.top = item2.top;
        item2.left = tmp.left;
        item2.top = tmp.top;
        delete item1.moving;
        delete item2.moving;
      });
      return promise;
    },
    // 将树顶冒泡
    bubble(mesc = 1000) {
      if (this.data.items.length <= 0) { return false; }
      const toppest = this.data.items[0];
      toppest.moving = {
        left: toppest.left,
        top: toppest.top,
      };
      const destination = {
        left: this.data.width - (toppest.radius * (1 + 2 * this.data.bubbled.length)),
        top: this.data.height - toppest.radius,
      };
      const distance = {
        x: destination.left - toppest.left,
        y: destination.top - toppest.top,
      };
      distance.total = distance.x + distance.y;
      const frameCount = mesc / 1000 * this.data.fps;
      const frameCountX = Math.trunc(distance.x / distance.total * frameCount);
      const frameCountY = frameCount - frameCountX;
      const step = {
        x: distance.x / frameCountX,
        y: distance.y / frameCountY,
        time: 1000 / this.data.fps,
        times: 0,
      };
      const lastNode = this.data.items[this.data.items.length - 1];
      lastNode.moving = { left: lastNode.left, top: lastNode.top };
      const stepLast = {
        x: (toppest.left - lastNode.left) / frameCount,
        y: (toppest.top - lastNode.top) / frameCount,
      };
      let promise = Promise.resolve();
      for (let index = 0; index < frameCountY; index += 1) {
        promise = promise.then(() => {
          toppest.moving.top += step.y;
          lastNode.moving.left += stepLast.x;
          lastNode.moving.top += stepLast.y;
          const time = Math.round(step.time * (step.times + 1) - step.time * step.times);
          step.times += 1;
          return utils.wait(time);
        });
      }
      for (let index = 0; index < frameCountX; index += 1) {
        promise = promise.then(() => {
          toppest.moving.left += step.x;
          lastNode.moving.left += stepLast.x;
          lastNode.moving.top += stepLast.y;
          const time = Math.round(step.time * (step.times + 1) - step.time * step.times);
          step.times += 1;
          return utils.wait(time);
        });
      }
      promise = promise.then(() => {
        this.data.items.splice(0, 1, lastNode);
        this.data.bubbled.push(toppest);
        console.log(toppest)
        toppest.left = Math.round(toppest.moving.left);
        toppest.top = Math.round(toppest.moving.top);
        lastNode.left = Math.round(lastNode.moving.left);
        lastNode.top = Math.round(lastNode.moving.top);
        delete toppest.moving;
        delete lastNode.moving;
      });
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
      .then(() => {
        this.methods.bindEvents();
      });
  },
};

export default param;
// 先复习一下排序过程
/**
 * 分组 排序 替换原值
 * 对调动画
 * 退出堆动画
 */
