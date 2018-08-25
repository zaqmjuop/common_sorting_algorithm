import Dom from '../dom';

/** 计数器 */
let counter = 0;
const getCounter = () => {
  counter += 1;
  return counter;
};

/** 条形柱组件 */

const param = {
  query: 'li',
  url: './assets/templates/li.html',
  name: 'li',
  selectors: {
    getRandom: '*[name=get-random]',
  },
  data() {
    return {
      value: 0,
      primaryKey: getCounter(),
    };
  },
  methods: {
    init() {
      if (Object.keys(this.present).includes('value')) {
        this.data.value = this.present.value || 0;
      }
      this.data.order = this.present.order || 1;
      this.methods.moveToOrder();
      this.methods.fill();
    },
    bindEvents() {
      /** 接受父组件消息 */
      this.addEventListener('send', (event) => {
        if (Number.isSafeInteger(event.detail.value)) {
          this.data.value = event.detail.value;
          Dom.of(this.template).removeClass('sorted');
          this.methods.fill();
        }
        if (Number.isSafeInteger(event.detail.order) && event.detail.order !== this.data.order) {
          this.data.order = event.detail.order;
          this.methods.moveToOrder();
        }
        // 高亮
        if (event.detail.method) {
          if (event.detail.method === 'highLight') {
            const time = Number(event.detail.time) || -1;
            if (event.detail.backColor) {
              this.methods.highLight(time, event.detail.backColor);
            } else {
              this.methods.highLight(time);
            }
          } else if (event.detail.method === 'sorted') {
            Dom.of(this.template).addClass('sorted');
          } else if (event.detail.method === 'select') {
            this.methods.select();
          } else if (event.detail.method === 'unselect') {
            this.methods.unselect();
          } else if (event.detail.method === 'unfall') {
            this.methods.unfall();
          } else if (event.detail.method === 'fall') {
            this.methods.fall();
          }
        }
      });
      /** 接受消息改变位置 */
    },
    fall() {
      Dom.of(this.template).css('bottom', '-300px');
    },
    unfall() {
      Dom.of(this.template).css('bottom', '0');
    },
    unselect() {
      Dom.of(this.template).removeClass('select');
    },
    select() {
      Dom.of(this.template).addClass('select');
    },
    /** 高亮
     * @param {number} mesc - 高亮时间
     * @param {string} backColor - background-color参数
     */
    highLight(mesc, backColor) {
      Dom.of(this.template).addClass('high-light');
      if (arguments.length > 0 && Number.isSafeInteger(mesc) && mesc >= 0) {
        setTimeout(() => Dom.of(this.template).removeClass('high-light'), mesc);
      }
      if (arguments.length > 1 && (typeof backColor === 'string')) {
        Dom.of(this.template).css('background-color', backColor);
        setTimeout(() => Dom.of(this.template).css('background-color', ''), mesc);
      }
    },
    fill() {
      Dom.of(this.template).css('height', `${this.data.value * 3}px`);
      Dom.of(this.template).text(this.data.value);
    },
    moveToOrder() {
      Dom.of(this.template).css('left', `${(this.data.order - 1) * 40}px`);
      Dom.of(this.template).addClass('high-light');
      setTimeout(() => Dom.of(this.template).removeClass('high-light'), 200);
    },
  },
  created() {
    this.methods.init();
    this.methods.bindEvents();
  },
};
export default param;