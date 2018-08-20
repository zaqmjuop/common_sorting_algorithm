import Dom from '../dom';
import mission from '../model/mission';
import missionListItem from './missionListItem';
import utils from '../utils';

/** 任务列表组件 */

let sortCondition = 'default';

const param = {
  query: 'mission-card',
  url: './assets/templates/missionCard.html',
  name: 'missionCard',
  data() {
    return {
      items: [],
      dayMark: '',
      dateMark: '',
    };
  },
  passon: [], // 接受父组件全部present
  selectors: {
    cardHeader: '.card-header',
    cardBody: '.card-body',
    new: '*[name=new]',
    filter: '.filter',
    create: '.create',
    submit: '.submit',
    option: '.option',
    board: '.board',
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      if (!this.present.query) {
        this.present.query = 'all';
      }
      this.data.date = this.present.date;
      this.data.days = this.present.days;
      this.data.urgent = this.present.query.urgent;
      this.data.important = this.present.query.important;
      this.data.boardSeen = !Dom.of(this.elements.board).hasClass('hide');
      const promise = utils.newPromise()
        .then(() => this.methods.bindEvents())
        .then(() => this.methods.loadDB())
        .then(() => this.methods.initItems())
        .then(() => this.methods.initSort());
      this.data.inited = 1;
      return promise;
    },
    /** 初始化排序 */
    initSort() {
      switch (sortCondition) {
        case 'date':
          this.methods.sortByDate();
          break;
        case 'urgent':
          this.methods.sortByUrgent();
          break;
        case 'important':
          this.methods.sortByImportant();
          break;
        default:
          this.methods.sortByDefatult();
          break;
      }
    },
    /** 初始化任务 */
    initItems() {
      let promise = Promise.resolve(1);
      // 添加 li item
      this.data.items.forEach((item) => {
        promise = promise.then(() => this.methods.appendItem(item));
      });
      return promise;
    },
    loadDB() {
      const filter = mission.methods.getQuery(this.present.query)
        .then((res) => { this.data.items = res; });
      return filter;
    },
    appendItem(detail) {
      // 添加li item
      const itemParam = Object.assign({ present: detail }, missionListItem);
      const append = this.appendChild(itemParam, this.elements.cardBody, -1);
      return append;
    },
    submit() {
      // 快捷表单提交
      const content = Dom.of(this.elements.create).attr('value');
      if (!utils.isEffectiveString(content)) { return false; }
      const now = new Date();
      const data = {
        content,
        date: now,
        createdAt: now,
        urgent: this.data.urgent,
        important: this.data.important,
        state: 'undone',
      };
      const promise = mission.push(data)
        .then(primaryKey => mission.get(primaryKey))
        .then((res) => {
          Dom.of(this.elements.create).attr('value', '');
          this.methods.switching();
          // 添加li item
          const itemParam = Object.assign({ present: res[0] }, missionListItem);
          const append = this.appendChild(itemParam, this.elements.cardBody, 0);
          return append;
        });
      return promise;
    },
    switching() {
      // 提交按钮开关灯
      const content = Dom.of(this.elements.create).attr('value');
      const button = Dom.of(this.elements.submit);
      const heightLight = 'height-light';
      if (utils.isEffectiveString(content)) {
        button.addClass(heightLight);
      } else {
        button.removeClass(heightLight);
      }
    },
    bindEvents() {
      // 快捷表单
      // 提交按钮
      Dom.of(this.elements.submit).on('click', () => this.methods.submit());
      // 输入框若有内容submit高亮
      Dom.of(this.elements.create).on('input', () => this.methods.switching());
      // 输入框
      Dom.of(this.elements.create).on('keydown', (event) => {
        if (event.keyCode !== 13) { return false; }
        return this.methods.submit();
      });
      // 筛选
      const filter = Dom.of(this.elements.filter);
      filter.on('input', () => {
        const value = filter.attr('value');
        const items = this.where({ name: 'missionListItem' });
        items.forEach((item) => { item.methods.match(value); });
      });
      // 右上角选项板显示切换
      const option = Dom.of(this.elements.option);
      const toggleIcon = Dom.of(option).child('.icon');
      Dom.of(toggleIcon).on('click', (e) => {
        e.stopPropagation();
        if (this.data.boardSeen) {
          Dom.of(this.elements.board).addClass('hide');
        } else {
          Dom.of(this.elements.board).removeClass('hide');
        }
        this.data.boardSeen = !this.data.boardSeen;
      });
      /** 点击一次即隐藏右上角选项板 */
      Dom.of(this.template).on('click', () => {
        if (!this.data.boardSeen) { return false; }
        Dom.of(this.elements.board).addClass('hide');
        this.data.boardSeen = false;
        return this.data.boardSeen;
      });
      // 右上角选项
      const boardDom = Dom.of(this.elements.board);
      // 默认排序
      const byDefatult = boardDom.child('*[data-sort=default]');
      Dom.of(byDefatult).on('click', () => this.methods.sortByDefatult());
      // 时间升序(没有时间的放最后)
      const byDate = boardDom.child('*[data-sort=date]');
      Dom.of(byDate).on('click', () => this.methods.sortByDate());
      // 按重要程度排序
      const byImportant = boardDom.child('*[data-sort=important]');
      Dom.of(byImportant).on('click', () => this.methods.sortByImportant());
      // 按紧急程度排序
      const byUrgent = boardDom.child('*[data-sort=urgent]');
      Dom.of(byUrgent).on('click', () => this.methods.sortByUrgent());
    },
    /** 按默认排序 */
    sortByDefatult() {
      sortCondition = 'default';
      const sort = this.methods.sortBy((items) => {
        const classifyByState = utils.classify(items, item => (item.data.item.state !== 'done'));
        classifyByState[0] = utils.bubbleSort(classifyByState[0], (item) => {
          const result = utils.isValidDate(item.data.item.date)
            ? item.data.item.date.getTime() : 9999999999999;
          return result;
        });
        classifyByState[1] = utils.bubbleSort(classifyByState[1], (item) => {
          const result = utils.isValidDate(item.data.item.date)
            ? item.data.item.date.getTime() : 9999999999999;
          return result;
        });
        const flat = utils.flat(classifyByState);
        return flat;
      });
      return sort;
    },
    /** 按时间排序 */
    sortByDate() {
      sortCondition = 'date';
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const datea = utils.isValidDate(a.data.item.date)
            ? a.data.item.date.getTime() : 9999999999999;
          const dateb = utils.isValidDate(b.data.item.date)
            ? b.data.item.date.getTime() : 9999999999999;
          return datea - dateb;
        });
        return items;
      });
      return sort;
    },
    /** 按紧急程度排序 */
    sortByUrgent() {
      sortCondition = 'urgent';
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const urgenta = (a.data.item.urgent) ? 1 : 0;
          const urgentb = (b.data.item.urgent) ? 1 : 0;
          return urgentb - urgenta;
        });
        return items;
      });
      return sort;
    },
    /** 按重要程度排序 */
    sortByImportant() {
      sortCondition = 'important';
      const sort = this.methods.sortBy((items) => {
        items.sort((a, b) => {
          const importanta = (a.data.item.important) ? 1 : 0;
          const importantb = (b.data.item.important) ? 1 : 0;
          return importantb - importanta;
        });
        return items;
      });
      return sort;
    },
    /** @param callback - 排序回调,第一个参数是一个数组，包含所有任务，应返回一个数组表示排序结果 */
    sortBy(callback) {
      const items = this.where({ name: 'missionListItem' });
      const sorted = callback(items);
      if (!(sorted instanceof Array)) { throw new Error('排序结果应是数组'); }
      sorted.forEach((item) => {
        Dom.of(this.elements.cardBody).append(item.template);
      });
      return sorted;
    },
  },
  created() {
    this.methods.init();
  },
};

export default param;
