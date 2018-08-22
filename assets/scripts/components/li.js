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
      this.data.order = this.data.primaryKey;
      this.methods.moveToOrder();
      this.methods.fill();
    },
    bindEvents() {
      /** 接受父组件消息 */
      this.addEventListener('send', (event) => {
        if (Number.isSafeInteger(event.detail.value)) {
          this.data.value = event.detail.value;
          this.methods.fill();
        }
        if (Number.isSafeInteger(event.detail.order) && event.detail.order !== this.data.order) {
          this.data.order = event.detail.order;
          this.methods.moveToOrder();
        }
      });
      /** 接受消息改变位置 */
    },
    fill() {
      Dom.of(this.template).css('height', `${this.data.value * 3}px`);
      Dom.of(this.template).text(this.data.value);
    },
    moveToOrder() {
      Dom.of(this.template).css('left', `${(this.data.order - 1) * 40}px`);
      Dom.of(this.template).addClass('high-light');
      setTimeout(() => Dom.of(this.template).removeClass('high-light'), 1000);
    },
  },
  created() {
    this.methods.init();
    this.methods.bindEvents();
  },
};
export default param;
