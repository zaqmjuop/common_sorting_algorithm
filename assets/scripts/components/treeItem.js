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
    bracketTop: '.bracket-top',
    bracketLeft: '.bracket-left',
    bracketRight: '.bracket-right',
  },
  methods: {
    init() {
      this.data.value = this.present.value || this.data.value || 0;
      Dom.of(this.elements.value).text(this.data.value);
    },
    // 添加左分支
    appendLeft(cpt) {
      if (this.data.left) { return false; }
      return this.appendChild(cpt, this.elements.left, -1)
        .then((item) => {
          this.data.left = item;
          Dom.of(this.elements.bracketTop).removeClass('hide');
          Dom.of(this.elements.bracketLeft).removeClass('hide');
          return item;
        });
    },
    // 添加右分支
    appendRight(cpt) {
      if (this.data.right) { return false; }
      return this.appendChild(cpt, this.elements.right, -1)
        .then((item) => {
          this.data.right = item;
          Dom.of(this.elements.bracketTop).removeClass('hide');
          Dom.of(this.elements.bracketRight).removeClass('hide');
          return item;
        });
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
