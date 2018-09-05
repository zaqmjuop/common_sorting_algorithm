import Dom from "../dom";
import Component from './component';

const param = {
  name: 'treeItem',
  query: 'treeItem',
  url: './assets/templates/treeItem.html',
  data() {
    return {
      value: 0,
    };
  },
  selectors: {
    top: '.top',
    left: '.left',
    right: '.right',
    value: '.value',
  },
  methods: {
    init() {
      this.data.value = this.present.value || this.data.value || 0;
      // Dom.of(this.elements.value).text(this.data.value);
    },
    // 添加左分支
    appendLeft(cpt) {
      if (this.data.left) { return false; }
      return this.appendChild(cpt, this.elements.left, -1)
        .then((item) => {
          this.data.left = item;
          return item;
        });
    },
    // 添加右分支
    appendRight(cpt) {
      if (this.data.right) { return false; }
      return this.appendChild(cpt, this.elements.right, -1)
        .then((item) => {
          this.data.right = item;
          return item;
        });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
