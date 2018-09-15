import li from './li';
import Dom from '../dom';
import utils from '../utils';
import Component from './component';
import { getRandomArray } from '../helper';

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
  name: 'shellSort',
  query: 'shellSort',
  url: './assets/templates/shellSort.html',
  data() {
    return {
      array: [],
      items: [],
      increment: 0,
      speed: 500,
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
      if (this.data.isRunning) { return false; }
      this.data.array = getRandomArray();
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
      // 排序
      Dom.of(this.elements.sort).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        if (this.data.increment <= 1 || this.data.array.every(item => !item || item <= 0)) {
          this.methods.getRandom();
        }
        // 排序前
        this.data.increment = this.data.items.length;
        this.data.isRunning = true;
        this.data.speed = 1000 - Number(this.elements.speed.value) * 100;
        // 排序
        let promise = Promise.resolve()
          .then(() => this.methods.shellSortAnimation());
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.array = this.data.items.map(item => item.data.value);
            this.data.items.forEach((item) => {
              item.dispatchEvent('send', { backColor: '' });
            });
            console.log('done');
          });
        return promise;
      });
    },
    shellSortAnimation() {
      if (this.data.increment <= 1) { return false; }
      // 递归
      let promise = Promise.resolve();
      promise = promise
        .then(() => this.methods.shellSortOnce())
        .then(() => this.methods.shellSortAnimation());
      return promise;
    },
    shellSortOnce() {
      // 排序前
      // 增量
      this.data.increment = Math.trunc(this.data.increment / 2);
      if (this.data.increment < 1) { return false; }
      // 设置容器
      this.data.containers = [];
      for (let index = 0; index < this.data.increment; index += 1) {
        this.data.containers.push([]);
      }
      // 分组
      for (let index = 0; index < this.data.containers.length; index += 1) {
        let effectIndex = index;
        while (effectIndex < this.data.items.length) {
          const item = this.data.items[effectIndex];
          this.data.containers[index].push(item);
          effectIndex += this.data.increment;
        }
      }
      // 排序
      const promise = Promise.resolve()
        .then(() => {
          // 高亮分组
          this.data.containers.forEach((team) => {
            const color = takeColorName();
            team.forEach((item) => {
              Dom.of(item.template).css('backgroundColor', color);
            });
          });
        })
        .then(() => {
          // 插入排序
          let insertion = Promise.resolve();
          this.data.containers.forEach((team) => {
            insertion = insertion
              .then(() => this.methods.insertionStage(team))
              .then(() => utils.wait(this.data.speed));
          });
          return insertion;
        });
      // 排序后
      return promise;
    },
    insertionStage(array) {
      // 将包含li的数组在下方舞台插入排序并替换回数组
      if (!(array instanceof Array)) { return false; }
      if (array.some(item => !(item instanceof Component))) { return false; }
      const stage = [];
      const orders = array.map(item => item.data.order); // 因为第二次order未排序
      let promise = Promise.resolve();
      array.forEach((item) => {
        promise = promise
          .then(() => {
            // 找到应该插入舞台位置
            let index = stage.length;
            for (let i = 0; i < stage.length; i += 1) {
              if (stage[i].data.value > item.data.value) {
                index = i;
                break;
              }
            }
            stage.splice(index, 0, item);
          }).then(() => {
            // 舞台其他先让位
            const index = stage.indexOf(item);
            stage.forEach((inStage, i) => {
              if (i > index) {
                inStage.dispatchEvent('send', { order: i + 1 });
              }
            });
            return utils.wait(this.data.speed);
          }).then(() => {
            // 将Item插入舞台
            const index = stage.indexOf(item);
            item.methods.fall();
            item.dispatchEvent('send', { order: index + 1 });
            return utils.wait(this.data.speed);
          });
      });
      // 替换回原数组
      promise = promise
        .then(() => {
          array.splice(0, array.length, ...stage);
          let goback = Promise.resolve();
          array.forEach((item, i) => {
            goback = goback
              .then(() => {
                item.methods.unfall();
                item.dispatchEvent('send', { order: orders[i] });
                this.data.items.splice(orders[i] - 1, 1, item);
                return utils.wait(this.data.speed);
              });
          });
          return goback;
        });
      return promise;
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
};

export default param;
