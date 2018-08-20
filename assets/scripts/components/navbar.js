import Dom from '../dom';

/** 上方选项栏 */

const param = {
  name: 'navbar',
  query: 'navbar',
  url: './assets/templates/navbar.html',
  data() {
    return { counter: 1 };
  },
  selectors: {
    menu: '*[name=menu]',
    new: '*[name=new]',
  },
  methods: {
    bindEvents() {
      Dom.of(this.elements.menu).on('click', () => {
        this.dispatchEvent('toggle');
      });
    },
  },
  created() {
    this.methods.bindEvents();
  },
};

export default param;
