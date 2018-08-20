import welcome from './welcome';
import Component from './component';

/** 路由组件 */

const router = {
  query: 'router',
  url: './assets/templates/router.html',
  name: 'router',
  data() {
    return {
      counter: 1,
      current: this,
      inited: 0,
      path: '',
      state: {},
      origin: window.location.href.match(/^[^#]+/)[0],
      href: window.location.href,
      home: 'welcome',
      history: [],
    };
  },
  route: {
    welcome,
  },
  methods: {
    init(path, state) {
      // 若init有参数则初始化跳转到Init参数
      // 否则若有有效url则跳转到有效url
      // 否则跳转到this.data.home
      if (this.data.initPromise) { return this.data.initPromise; }
      this.data.initPromise = Promise.resolve(1);
      // 页面加载时若存在 #/route/ 就跳转，否则跳转到route第一个
      const hashMatch = window.location.hash.match(/#\u002f([^?\u002f]+)/);
      const home = { path, state };
      if (!path) {
        if (hashMatch) {
          home.path = hashMatch[1];
        } else {
          home.path = this.data.home;
        }
      }
      this.data.initPromise = this.data.initPromise
        .then(() => this.methods.render(home.path, home.state));
      return this.data.initPromise;
    },
    // 不刷新页面改变path
    // 参数path是this.route指定的组件，state会作为present传入
    render(path, state) {
      const route = this.route[String(path)];
      if (!route) { throw new Error(`路径${path}对应Component不存在`); }
      this.data.path = path;
      this.data.state = Object.assign({}, state);
      const param = Object.assign({}, route);
      const present = Object.assign({}, param.present, this.data.state);
      param.present = present;
      const current = this.data.current;
      const promise = current.replace(param).then((cpt) => {
        if (current !== this) { Component.removeComponent(current); }
        this.data.current = cpt;
        const url = `${this.data.origin.replace(/\u002f$/, '')}/#/${path}/`;
        const log = { path, state: this.data.state };
        this.data.history.push(log);
        window.history.pushState(this.data.state, 0, url);
        this.data.href = window.location.href;
        return cpt;
      });
      return promise;
    },
    restore() {
      if (!this.data.path) { return false; }
      const promise = this.methods.render(this.data.path, this.data.state);
      return promise;
    },
    back(detail) {
      let promise;
      if (this.data.history.length > 1) {
        this.data.history.pop();
        const prev = this.data.history.pop();
        const state = Object.assign(prev.state, detail);
        promise = this.methods.render(prev.path, state);
      }
      return promise || Promise.resolve('没有历史');
    },
  },
  created() {
    return this.methods.init('welcome', { action: 'quadrants' });
  },
};

export default router;

