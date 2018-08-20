import leftMenu from './leftMenu';
import missionCard from './missionCard';
import missionEdit from './missionEdit';
import quadrants from './quadrants';
import noteCard from './noteCard';
import noteEdit from './noteEdit';
import Component from './component';
import navbar from './navbar';
import Dom from '../dom';

/** 应用主体组件 */

const left = Component.of(leftMenu);

const param = {
  query: 'mission-content',
  url: './assets/templates/welcome.html',
  name: 'welcome',
  selectors: {
    left: '.left',
    body: '.body',
    overlay: '.overlay',
  },
  components: [navbar],
  data() {
    return {};
  },
  methods: {
    init() {
      if (this.data.inited) { return false; }
      this.data.inited = 1;
      return this;
    },
    showLeft() {
      Dom.of(this.elements.left).css('left', '0');
      Dom.of(this.elements.overlay).css('left', '0');
      this.data.leftSeen = true;
    },
    hideLeft() {
      let width = Dom.of(this.selectors.left).css('width') || '';
      width = width.match(/\d+/) || 0;
      Dom.of(this.elements.left).css('left', `-${Number(width)}px`);
      Dom.of(this.elements.overlay).css('left', '-100%');
      this.data.leftSeen = false;
    },
    bindEvents() {
      Dom.of(this.elements.overlay).on('click', () => {
        this.methods.hideLeft();
      });
      const nav = this.findBy({ name: 'navbar' });
      if (nav) {
        nav.addEventListener('toggle', () => {
          if (this.data.leftSeen) {
            this.methods.hideLeft();
          } else {
            this.methods.showLeft();
          }
        });
      }
    },
  },
  created() {
    this.methods.bindEvents();
    // 左侧选项栏
    this.appendChild(left, this.elements.left, 0);
    // 右侧子页面
    if (this.present.action === 'edit') {
      missionEdit.present = this.present;
      this.appendChild(missionEdit, this.elements.body, 0);
    } else if (this.present.action === 'quadrants') {
      quadrants.present = this.present;
      this.appendChild(quadrants, this.elements.body, 0);
    } else if (this.present.action === 'noteCard') {
      noteCard.present = this.present;
      this.appendChild(noteCard, this.elements.body, 0);
    } else if (this.present.action === 'noteEdit') {
      noteEdit.present = this.present;
      this.appendChild(noteEdit, this.elements.body, 0);
    } else {
      this.present.query = this.present.query || 'all';
      missionCard.present = this.present;
      this.appendChild(missionCard, this.elements.body, 0);
    }
    this.methods.init();
  },
};
export default param;
