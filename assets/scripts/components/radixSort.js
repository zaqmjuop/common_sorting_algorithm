
import Dom from '../dom';

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
    max = Math.floor(max / 10);
  }
  decimal = (decimal >= 1) ? decimal : 1;
  // 最大值是2位数就排2次，3位数就排3次
  for (let time = 0; time < decimal; time += 1) {
    // 算出对应位数的数字，并按分组放进容器
    array.forEach((item) => {
      const index = Math.floor(item / (10 ** time)) % 10;
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
    };
  },
  selectors: {
    canvas: 'canvas',
    getRandom: '*[name=get-random]',
    sort: '*[name=sort]',
  },
  methods: {
    init() {
      this.data.ctx = this.elements.canvas.getContext('2d');
      let promise = Promise.resolve();
      return promise;
    },
    fillDefault() {

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
        console.log('点击了排序');
        radixSort(this.data.array);
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
};

export default param;
