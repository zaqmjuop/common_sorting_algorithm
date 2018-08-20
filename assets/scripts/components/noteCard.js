import Dom from '../dom';
import note from '../model/note';
import noteItem from './noteItem';

const param = {
  name: 'noteCard',
  query: 'note-card',
  url: './assets/templates/noteCard.html',
  data() {
    return {};
  },
  selectors: {
    card: '.card',
    create: '*[name=create]',
    cardBody: '.card-body',
    filter: '.filter',
    background: '.background',
  },
  methods: {
    loadDB() {
      return note.getAll()
        .then((items) => {
          this.data.items = items;
          return items;
        });
    },
    bindEvents() {
      // 筛选
      const filter = Dom.of(this.elements.filter);
      filter.on('input', () => {
        const value = filter.attr('value');
        const items = this.where({ name: 'noteItem' });
        items.forEach((item) => {
          let isMatch = false;
          try {
            isMatch = !!item.data.item.content.match(value);
          } catch (err) {
            isMatch = false;
          }
          if (isMatch) {
            Dom.of(item.template).removeClass('hide');
          } else {
            Dom.of(item.template).addClass('hide');
          }
        });
      });
    },
    fill() {
      // 填充noteCard
      let promise = Promise.resolve(1);
      if (this.data.items) {
        this.data.items.forEach((item) => {
          const itemParam = Object.assign({ present: item }, noteItem);
          promise = promise.then(() => this.appendChild(itemParam, this.elements.cardBody, -1));
          return promise;
        });
      }
      return promise;
    },
  },
  created() {
    this.methods.bindEvents();
    return this.methods.loadDB()
      .then(() => this.methods.fill());
  },
};

export default param;
