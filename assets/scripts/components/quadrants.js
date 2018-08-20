import Dom from '../dom';
import missionCard from './missionCard';
import mission from '../model/mission';

/** 四象限组件 */

const param = {
  query: 'quadrants',
  url: './assets/templates/quadrants.html',
  name: 'quadrants',
  data() {
    return {
      top: 5,
      left: 4,
      urgent: true,
      important: true,
    };
  },
  selectors: {
  },
  methods: {
    bindEvents() {
      const boxes = this.template.children;
      // 修改盒子宽高 点击哪个盒子 哪个盒子就最大
      boxes.forEach((box) => {
        Dom.of(box).on('click', () => {
          if (this.data.currentBox !== box) {
            const position = Dom.of(box).attr('data-position');
            this.data.urgent = !position.match('not-urgent');
            this.data.important = !position.match('not-important');
            this.data.top = (this.data.urgent) ? 10 : 0.1;
            this.data.left = (this.data.important) ? 10 : 0.1;
            this.methods.changeSize();
            // 添加missionCard到该box
            const existCard = this.findBy({ name: 'missionCard' });
            if (existCard) {
              this.removeChild(existCard);
            }
            const card = Object.assign({}, missionCard);
            card.present = card.present || {};
            card.present.query = { important: !!this.data.important, urgent: !!this.data.urgent };
            this.appendChild(card, box, 2)
              .then(() => {
                // 把上一个currentBox的title恢复到中间，把下一个currentBox移到右侧
                if (this.data.currentBox) {
                  const beforeTitle = Dom.of(this.data.currentBox).child('.title');
                  Dom.of(beforeTitle).removeClass('hide');
                }
                this.data.currentBox = box;
                const title = Dom.of(this.data.currentBox).child('.title');
                Dom.of(title).addClass('hide');
              });
          }
        });
      });
    },
    changeSize() {
      // 改变盒子大小
      Dom.of(this.template).css('grid-template-rows', `${this.data.top}fr 1fr`);
      Dom.of(this.template).css('grid-template-columns', `${this.data.left}fr 1fr`);
    },
    init() {
      if (Object.keys(this.present).includes('urgent')) {
        this.data.urgent = this.present.urgent;
        this.data.important = this.present.important;
      }
    },
    fill() {
      const quadrantSelect = mission.quadrants.findIndex((item) => {
        const isMatch = (item.important === !!this.data.important)
          && (item.urgent === !!this.data.urgent);
        return isMatch;
      });
      const area = ['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'];
      Dom.of(this.template).child(`.${area[quadrantSelect]}`).click();
    },
  },
  created() {
    this.methods.bindEvents();
    this.methods.init();
    this.methods.fill();
  },
};
export default param;
