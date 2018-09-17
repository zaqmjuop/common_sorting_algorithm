import li from './li';
import Dom from '../dom';
import utils from '../utils';
import { getRandomArray } from '../helper';

const param = {
  name: 'bucketSort',
  query: 'bucketSort',
  url: './assets/templates/bucketSort.html',
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
    max: '*[name=max]',
    min: '*[name=min]',
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
      this.data.array = getRandomArray(20, 1, 50);
      // 改变Li高度
      this.data.items.forEach((item, index) => {
        item.dispatchEvent('send', { value: this.data.array[index] });
      });
      return this.data.array;
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
        const DEFAULT_BUCKET_SIZE = 3;
        this.data.isRunning = true;
        this.data.speed = 1000 - Number(this.elements.speed.value) * 100;
        this.data.isSorted = false;
        this.data.max = this.data.items[0].data.value;
        this.data.min = this.data.items[0].data.value;
        Dom.of(this.elements.max).text(this.data.max);
        Dom.of(this.elements.min).text(this.data.min);
        // 排序
        let promise = Promise.resolve();
        // 找到最大最小值
        this.data.items.forEach((item) => {
          promise = promise
            .then(() => {
              const isEndpoint = this.methods.changeEndpoint(item.data.value);
              if (isEndpoint) {
                item.dispatchEvent('send', { method: 'highLight', time: this.data.speed, backColor: 'yellow' });
              } else {
                item.dispatchEvent('send', { method: 'highLight', time: this.data.speed });
              }
              return utils.wait(this.data.speed);
            });
        });
        // 找到断点
        const breakpoints = []; // 中间的断点，不包括min和max
        promise = promise
          .then(() => {
            const spacing = Math.trunc((this.data.max - this.data.min) / DEFAULT_BUCKET_SIZE);
            let breakpoint = this.data.min;
            for (let index = 0; index < DEFAULT_BUCKET_SIZE - 1; index += 1) {
              breakpoint += spacing;
              breakpoints.push(breakpoint);
            }
            // 创建一个二元数组容器,长度为DEFAULT_BUCKET_SIZE，每个成员是一个空数组
            this.data.containers = [];
            for (let index = 0; index < DEFAULT_BUCKET_SIZE; index += 1) {
              this.data.containers.push([]);
            }
          });
        // 将原数组按分组放入容器内
        this.data.items.forEach((item) => {
          promise = promise
            .then(() => {
              let teamIndex = breakpoints.findIndex(point => (point >= item.data.value));
              if (teamIndex < 0) { teamIndex = DEFAULT_BUCKET_SIZE - 1; }
              // 插入
              return this.methods.insertContainer(item, teamIndex);
            });
        });
        // 替换回原位
        promise = promise.then(() => {
          this.data.items = [];
          let order = 1;
          let goback = Promise.resolve();
          this.data.containers.forEach((container) => {
            container.forEach((item) => {
              goback = goback.then(() => {
                this.data.items.push(item);
                item.dispatchEvent('send', { order });
                order += 1;
                item.methods.unfall();
                return utils.wait(this.data.speed);
              });
            });
          });
          return goback;
        });
        // 排序后
        promise = promise
          .then(() => {
            this.data.isRunning = false;
            this.data.isSorted = true;
            this.data.array = this.data.items.map(item => item.data.value);
          });
        return promise;
      });
    },
    // 插入到this.data.containers
    insertContainer(cpt, teamIndex) {
      if (!this.data.containers || !this.data.containers[teamIndex]) { return false; }
      const container = this.data.containers[teamIndex];
      let insertIndex = container.length;
      let promise = Promise.resolve();
      // 找到位置
      container.forEach((item, index) => {
        promise = promise
          .then(() => {
            if (insertIndex < container.length) {
              return false;
            }
            const light = Promise.resolve()
              .then(() => {
                item.methods.highLight(this.data.speed, '#c00');
                return utils.wait(this.data.speed);
              })
              .then(() => {
                if (item.data.value <= cpt.data.value) {
                  return false;
                }
                insertIndex = index;
                item.methods.highLight(this.data.speed, 'yellow');
                return utils.wait(this.data.speed);
              });
            return light;
          });
      });
      // 让位
      promise = promise
        .then(() => {
          container.forEach((item, index) => {
            if (index >= insertIndex) {
              item.dispatchEvent('send', { order: item.data.order + 1 });
            }
          });
          return utils.wait(this.data.speed);
        });
      // 插入
      promise = promise
        .then(() => {
          container.splice(insertIndex, 0, cpt);
          const bottom = 100 + teamIndex * 100;
          cpt.methods.fall(bottom);
          cpt.dispatchEvent('send', { order: insertIndex + 1 });
          return utils.wait(this.data.speed);
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
