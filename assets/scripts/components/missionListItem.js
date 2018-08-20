import Dom from '../dom';
import mission from '../model/mission';
import utils from '../utils';

/** 任务成员组件 */

const param = {
  query: 'mission-list-item',
  url: './assets/templates/missionListItem.html',
  name: 'missionListItem',
  selectors: {
    template: '.template',
    content: '.content',
    date: '.date',
    toggle: '.toggle',
  },
  data() {
    return {
      inited: 0,
    };
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      this.methods.bindEvents();
      return this;
    },
    bindEvents() {
      // 切换任务状态
      const toggle = Dom.of(this.elements.toggle);
      toggle.on('click', () => {
        const toggleState = (toggle.dom.checked) ? 'done' : 'undone';
        const promise = mission.get(Number(this.data.item.primaryKey))
          .then((res) => {
            const data = res[0];
            data.state = toggleState;
            data.updatedAt = new Date();
            return mission.update(data);
          }).then(() => {
            this.data.item.state = toggleState;
            if (toggleState === 'done') {
              Dom.of(this.template).addClass('done');
            } else {
              Dom.of(this.template).removeClass('done');
            }
          });
        return promise;
      });
      // 更新按钮 点击content跳转到edit
      Dom.of(this.elements.content).on('click', () => {
        window.router.methods.render('welcome', { action: 'edit', primaryKey: this.data.item.primaryKey });
      });
    },
    fill() {
      if (!this.present.primaryKey) { throw new Error('missionListItem没有primaryKey'); }
      this.data.item = this.present;
      const dateStr = utils.formatDate(this.data.item.date);
      Dom.of(this.elements.content).attr('text', this.data.item.content);
      Dom.of(this.elements.date).attr('text', dateStr);
      if (this.data.item.date instanceof Date) {
        // rest 为1表示剩余1天，-1表示过期一天，0表示当天
        const rest = utils.differDay(utils.now, this.data.item.date);
        let dateColor = 'green';
        if (rest < 0) {
          dateColor = 'red';
        } else if (rest < 2) {
          dateColor = 'yellow';
        } else if (rest < 8) {
          dateColor = 'blue';
        }
        Dom.of(this.elements.date).addClass(dateColor);
      }
      Dom.of(this.template).attr('data-primaryKey', this.data.item.primaryKey);
      if (this.data.item.state === 'done') {
        Dom.of(this.template).addClass('done');
        this.elements.toggle.checked = 1;
      } else {
        Dom.of(this.template).removeClass('done');
        this.elements.toggle.checked = 0;
      }
    },
    match(value) {
      // 匹配字符串，如匹配就显示，否则隐藏
      let isMatch = false;
      try {
        isMatch = !!this.data.item.content.match(value);
      } catch (err) {
        isMatch = false;
      }
      if (isMatch) {
        Dom.of(this.template).removeClass('hide');
      } else {
        Dom.of(this.template).addClass('hide');
      }
    },
  },
  created() {
    this.methods.init();
    this.methods.fill();
  },
};

export default param;
