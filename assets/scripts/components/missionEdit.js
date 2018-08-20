import mission from '../model/mission';
import Dom from '../dom';
import datepicker from '../lib/datepicker';
import utils from '../utils';
import quadrants from './quadrants';

/** 编辑任务组件 */

const param = {
  query: 'mission-edit',
  url: './assets/templates/missionEdit.html',
  name: 'missionEdit',
  data() {
    return {
      item: {},
    };
  },
  selectors: {
    content: 'textarea',
    date: 'input[name=date]',
    cancal: '*[name=cancal]',
    submit: '*[name=submit]',
    remove: '*[name=remove]',
    quadrant: '*[name=quadrant]',
  },
  methods: {
    init() {
      if (this.inited) { return false; }
      this.inited = 1;
      this.data.action = (this.present.primaryKey) ? 'update' : 'create';
      this.data.picker = datepicker(this.elements.date);
      Dom.of(this.data.picker.body).attr('data-c-id', `c${this.componentId}`);
      const promise = Promise.resolve(1)
        .then(() => this.methods.loadDB())
        .then(() => this.methods.bindEvents())
        .then(() => this.methods.fill());
      return promise;
    },
    cancal() {
      let detail = {};
      if (this.data.item.primaryKey) {
        detail = { urgent: this.data.item.urgent, important: this.data.item.important };
      } else if (Object.keys(this.present).includes('urgent')) {
        detail = { urgent: this.present.urgent, important: this.present.important };
      }
      window.router.methods.back(detail);
    },
    submit() {
      const content = this.elements.content.value;
      if (!utils.isEffectiveString(content)) {
        const msg = '内容不能为空';
        window.notice.methods.noticeIn(this.template, msg, 'error');
        return msg;
      }
      let date = new Date(this.elements.date.value);
      if (!utils.isValidDate(date)) { date = ''; }
      const quadrantSelected = Number(this.elements.quadrant.value) || 0;
      const quadrant = mission.quadrants[quadrantSelected];
      const now = new Date();
      let promise;
      // 更改数据
      this.data.item.content = content;
      this.data.item.date = date;
      this.data.item.state = 'undone';
      this.data.item.important = quadrant.important;
      this.data.item.urgent = quadrant.urgent;
      this.data.item.updatedAt = now;

      if (this.data.item.primaryKey) {
        promise = mission.update(this.data.item);
      } else {
        this.data.item.createdAt = now;
        promise = mission.push(this.data.item);
      }
      promise = promise.then(() => {
        const detail = { urgent: this.data.item.urgent, important: this.data.item.important };
        window.router.methods.back(detail);
        const msg = '保存成功';
        window.notice.methods.alert(msg, 'success');
        return msg;
      });
      return promise;
    },
    bindEvents() {
      // 撤销按钮
      Dom.of(this.elements.cancal).on('click', () => this.methods.cancal());
      // 删除按钮
      Dom.of(this.elements.remove).on('click', () => {
        if (!this.data.item.primaryKey) { return Promise.resolve('没有查询到数据'); }
        return mission.remove(this.data.item.primaryKey)
          .then(() => {
            this.methods.cancal();
            window.notice.methods.alert('删除一条任务');
          });
      });
      // 提交按钮
      Dom.of(this.elements.submit).on('click', () => {
        this.methods.submit();
      });
      // 绑定ESC(27)
      const touchEsc = (event) => {
        if (event.keyCode === 27) {
          this.methods.cancal();
          document.removeEventListener('keydown', touchEsc);
        }
      };
      document.addEventListener('keydown', touchEsc);
      // 绑定Ctrl(17) + Enter(13)
      const touchEnter = (event) => {
        if (event.ctrlKey && event.keyCode === 13) {
          this.methods.submit();
          document.removeEventListener('keydown', touchEnter);
        }
      };
      document.addEventListener('keydown', touchEnter);
    },
    loadDB() {
      if (this.data.action === 'create' || !this.present.primaryKey) {
        return Promise.resolve(1);
      }
      const promise = mission.get(this.present.primaryKey)
        .then((res) => {
          this.data.item = res[0];
        });
      return promise;
    },
    fill() {
      // 四象限选项
      if (this.data.item.primaryKey) {
        Dom.of(this.elements.content).text(this.data.item.content);
        Dom.of(this.elements.date).attr('value', utils.formatDate(this.data.item.date));
      } else {
        Dom.of(this.elements.remove).addClass('hide');
        if (Object.keys(this.present).includes('urgent')) {
          this.data.item.urgent = this.present.urgent;
          this.data.item.important = this.present.important;
        } else {
          this.data.item.urgent = true;
          this.data.item.important = true;
        }
      }
      // 四象限选项
      const quadrantSelect = mission.quadrants.findIndex((item) => {
        let isMatch = true;
        if (item.important !== !!this.data.item.important) { isMatch = false; }
        if (item.urgent !== !!this.data.item.urgent) { isMatch = false; }
        return isMatch;
      });
      if (quadrantSelect > -1) {
        this.elements.quadrant.value = quadrantSelect;
      }
    },
  },
  created() {
    this.methods.init();
  },
};
export default param;
