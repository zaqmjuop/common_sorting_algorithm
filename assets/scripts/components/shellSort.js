import li from './li';
import Dom from '../dom';

const param = {
  name: 'shellSort',
  query: 'shellSort',
  url: './assets/templates/shellSort.html',
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
      // 排序
      Dom.of(this.elements.sort).on('click', () => {
        this.methods.shellSort(this.data.array);
        return console.log(this.data.array);
      });
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
  implanted() { console.log('implanted shellSort'); },
};

export default param;
