import Dom from '../dom';
import utils from '../utils';

/** 消息通知组件 */

const param = {
  name: 'notice',
  query: 'notice',
  url: './assets/templates/notice.html',
  data() {
    return {
      fixedTop: 10,
    };
  },
  selectors: {
    content: '.content',
    cancal: '.cancal',
  },
  methods: {
    render(content, klass) {
      // 返回一个HTMLElement实例的notice box
      // content是内容,
      // klass 可选 一个字符串表示颜色，默认是蓝色,可选'success','error','warn','primary','gray'
      const clone = document.importNode(this.template, 1);
      clone.className = utils.isEffectiveString(klass) ? klass : '';
      Dom.of(clone).child('.content').innerText = String(content);
      this.methods.bindNoticeEvents(clone);
      return clone;
    },
    bindNoticeEvents(notice) {
      // bind cancal
      if (!utils.isElement(notice)) { throw new TypeError(`notice不能是${notice}`); }
      Dom.of(notice).child('.cancal').onclick = () => notice.classList.add('hide');
    },
    alert(content, klass) {
      // 替代window.alert
      // content是内容,klass一个字符串表示颜色，默认是蓝色,可选'success','error','warn','primary','gray'
      const box = this.methods.render(content, klass);
      Dom.of('body').appendAccurate(box, -1);
      Dom.of(box).css('top', `${this.data.fixedTop}px`);
      const realHeight = Dom.of(box).css('height').match(/\d*/);
      const height = (realHeight && Number(realHeight[0])) || 0;
      this.data.fixedTop += height;
      Dom.of(box).css('opacity', '0');
      // 自动删除
      setTimeout(() => {
        this.data.fixedTop -= height;
        Dom.of(box).remove();
      }, 5000);
      return box;
    },
    noticeIn(element, content, klass) {
      // 指定元素内notice position是absolute
      if (!utils.isElement(element)) { throw new TypeError(`element不能是${element}`); }
      const box = this.methods.render(content, klass);
      Dom.of(element).appendAccurate(box, -1);
      const noticeTop = Dom.of(element).attr('data-notice-top') || '0';
      let top = Number(noticeTop.match(/\d+/)[0]);
      Dom.of(box).css('top', `${top}px`);
      const realHeight = Dom.of(box).css('height').match(/\d*/);
      const height = (realHeight && Number(realHeight[0])) || 0;
      top += height;
      Dom.of(box).css('opacity', '0');
      Dom.of(element).attr('data-notice-top', String(top));
      // 自动删除
      setTimeout(() => {
        const minus = Number(Dom.of(element).attr('data-notice-top').match(/\d+/)[0]) - height;
        Dom.of(element).attr('data-notice-top', String(minus));
        Dom.of(box).remove();
      }, 5000);
    },
  },
  created() {
    this.methods.bindNoticeEvents(this.template);
  },
};

export default param;
