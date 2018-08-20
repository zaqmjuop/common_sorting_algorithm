import utils from '../utils';
import Dom from '../dom';

/** 页面左侧选项板 */

const param = {
  query: 'left-menu',
  url: './assets/templates/leftMenu.html',
  name: 'leftMenu',
  data() {
    return {
      date: utils.now,
    };
  },
  passon: [],
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
