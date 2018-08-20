import Dom from '../dom';

const param = {
  name: 'noteItem',
  query: 'note-item',
  url: './assets/templates/noteItem.html',
  data() {
    return { counter: 1 };
  },
  selectors: {
    header: '.header',
    content: 'p',
    edit: '.edit',
    date: '*[name=date]',
  },
  methods: {
    fill() {
      if (!this.present) { throw new Error('noteItem没有primaryKey'); }
      this.data.item = this.present;
      const time = `${this.data.item.updatedAt.toLocaleDateString()} ${this.data.item.updatedAt.toLocaleTimeString()}`;
      Dom.of(this.elements.date).text(time);
      Dom.of(this.elements.content).text(this.data.item.content);
      return this.data.item;
    },
    bindEvents() {
      // 修改按钮
      Dom.of(this.elements.edit).on('click', () => {
        window.router.methods.render('welcome', { action: 'noteEdit', primaryKey: this.data.item.primaryKey });
      });
    },
  },
  created() {
    this.methods.bindEvents();
    return this.methods.fill();
  },
};

export default param;
