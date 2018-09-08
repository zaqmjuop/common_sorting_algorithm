import li from './li';
import Dom from '../dom';
import utils from '../utils';
import Component from './component';

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
      animation: Promise.resolve(),
      increment: 0,
      done: false,
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
    bindEvents() {
      // 随机召唤数组
      Dom.of(this.elements.getRandom).on('click', () => {
        if (this.data.isRunning) {
          return console.warn('正在运行中,你可以刷新页面重新开始');
        }
        this.methods.getRandom();
        return this.methods.sendArray();
      });
      // 排序
      Dom.of(this.elements.sort).on('click', () => {
        // 分组 排序 替换原值
        const promise = this.methods.shellSortAnimation();
        return promise;
      });
    },
    shellSortAnimation() {
      // 归并排序运行到增量小于1
      let promise = this.data.animation;
      promise = promise.then(() => {
        let result;
        if (this.data.done) {
          result = false;
        } else {
          result = Promise.resolve(this.methods.shellSortOnce()).then(() => this.methods.shellSortAnimation())
        }
        return result;
      });
      return promise;
    },
    shellSortOnce() {
      const promise = Promise.resolve()
        .then(() => {
          // 设置增量 promise 怎么递归
          const increment = this.data.increment || this.data.array.length;
          this.data.increment = Math.trunc(increment / 2);
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
        })
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
              .then(() => utils.wait(222));
          });
          return insertion;
        })
        .then(() => {
          // 等待一段时间
          if (this.data.increment <= 1) {
            this.data.done = true;
          }
          return utils.wait(222);
        });
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
          array.splice(0, array.length, ...stage);
        }).then(() => {
          let goback = Promise.resolve();
          array.forEach((item, index) => {
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
    getArray() {
      const array = this.data.items.map(item => item.data.value);
      this.data.array = array;
      return array;
    },
    /** 插入排序 改变原数组 */
    insertionSort(array) {
      const container = []; // 准备一个空数组，向空数组内插入
      // 一次插入动作
      const onceInsert = (member) => {
        let isInserted = false;
        for (let i = 0; i < container.length; i += 1) {
          const item = container[i];
          // 插入条件
          if (item > member) {
            container.splice(i, 0, member); // 插入
            isInserted = true;
            break;
          }
        }
        // 若container中没有比member更大的值时
        if (!isInserted) { container.push(member); }
        return container;
      };
      // 将原数组中的值有序的插入到container
      array.forEach(item => onceInsert(item));
      // 改变原数组
      array.splice(0, array.length, ...container);
    },
    /** 希尔排序 改变原数组 */
    shellSort(array) {
      for (let increment = Math.trunc(array.length / 2); increment >= 1; increment = Math.trunc(increment / 2)) {
        // 分组 -> 排序 -> 替换原值
        // 分组,按照影响的index分组
        const effectIndexTeams = []; // 一个二元数组，每个成员是一个数组记录影响的index
        for (let index = 0; index < increment; index += 1) {
          const effectIndexTeam = []; // 影响的Index数组
          let effectIndex = index; // 影响的index
          while (effectIndex < array.length) {
            effectIndexTeam.push(effectIndex);
            effectIndex += increment;
          }
          effectIndexTeams.push(effectIndexTeam);
        }
        effectIndexTeams.forEach((effectIndexTeam) => {
          // 排序
          const effectTeam = effectIndexTeam.map(effectIndex => array[effectIndex]);
          // 这里插入排序effectTeam
          this.methods.insertionSort(effectTeam);
          // 改变原值
          effectIndexTeam.forEach((effectIndex, index) => {
            array.splice(effectIndex, 1, effectTeam[index]);
          });
        });
      }
      return array;
    },
  },
  created() {
    return this.methods.init()
      .then(() => this.methods.bindEvents());
  },
};

export default param;
