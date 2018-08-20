import Dom from '../dom';
import promiseAjax from '../ajax';
import utils from '../utils';

// 视图模板缓存
const viewsCache = [];

// href
const origin = window.location.href.match(/^[^#]+/)[0];
const root = window.location.href;

// 保存所有创建的组件
const components = new Set();

let counter = 100001;
const takeId = () => {
  counter += 1;
  return counter;
};

/** 组件类,一个组件由一个html文件和一个配置文件js组成.
 * html文件提供组件的template和style.
 * js文件提供组件的JavaScript.
 * 可以对组件进行增加，删除，修改，查询的操作，就像操作HTMLElement一样.
 * 组件之间也可以有父子关系，父子间通过事件进行通讯.
 * 组件实例化后会被分配一个componentId用于查询.
 */
class Component {
  /**
   * 实例化一个组件
   * @param {Object} param - 必须，组件配置对象
   * @param {String} param.name - 必须，用于组件的索引
   * @param {String|HTMLElement} param.query - 必须，标记组件插入的位置，若为字符串则作为querySelector参数
   * @param {String} param.url - 一个相对于执行html文件的路径，表示该组件的视图模板的文件，一般作为第一次实例化时调用一次，
   * param.url被调用一次后会缓存视图模板，组件有3个参数可以获取视图模板
   * 调用优先度 param.template > 缓存 > param.url 按优先度从高到低调用，当存在高优先度的参数时，低优先度参数不被调用
   * @param {HTMLElement} param.template - 可选，组件的html结构，当存在时优先作为视图模板
   * @param {HTMLStyleElement} param.style - 可选，组件的style元素，当param.template存在时作为style加入组件，否则无效
   * @param {Function} param.data - 必须，组件的初始数据，从方法中返回一个Object作为数据保存到组件的data属性
   * @param {Object} param.present - 可选，没有实际作用，可以作为初始化时传递数据
   * @param {Object} param.selectors - 可选，索引并保存视图中的元素，形式：{name: selector}，保存到组件的elememts属性中，
   * 形式：{name: document.querySelector(selector)}
   * @param {Object} param.methods - 可选，组件的方法集合，键值类型必须为Function，保存到组件的methods属性中，同时自动绑定this到组件上
   * @param {Function} param.created - 可选，一个回调函数，组件实例化后插入到页面之前执行
   * @param {Function} param.implanted - 可选，一个回调函数，组件实例化后插入到页面之后执行
   */
  constructor(param) {
    if (param instanceof Component) { return param; }
    if (new.target !== Component) { throw new Error('必须使用 new 命令生成实例'); }
    if (typeof param !== 'object') { throw new TypeError('param应该是一个object'); }
    const result = Object.assign(this, param);
    // 索引和标识
    if (!utils.isEffectiveString(result.name)) {
      throw new Error(`Component.name 不能为${result.name}`);
    }
    // present
    result.present = result.present || {};
    // 在页面插入的位置
    const position = Dom.of(result.query).dom;
    if (utils.isElement(position)) {
      result.query = position;
    }
    // parent父组件
    const originParent = result.parent;
    result.defineParent();
    result.parent = originParent;
    // 子组件components
    result.formatComponents();
    // 处理data和watch
    result.formatData();
    // 绑定param.methods下的function的this指向
    result.formatMethods();

    result.load();
    return result;
  }
  load() {
    if (this.loadPromise) { return Promise.resolve(this.loadPromise); }
    const promise = Promise.resolve(1)
      .then(() => {
        const view = this.template || this.getView();
        return view;
      })
      .then(() => {
        // 填充param.selectors 填充this.elements
        this.fillSelectors();
        // 设置this.componentId属性
        this.setComponentId();
        // 保存组件
        components.add(this);
      })
      .then(() => this.formatChildren())
      .then(() => this.lifeCycle())
      .then(() => {
        this.loaded = 'done';
        this.loadPromise = 'done';
        return this;
      });
    this.loadPromise = promise;
    return this.loadPromise;
  }
  formatChildren() {
    // 处理子组件components中不是组件实例化对象的对象
    let promise = new Promise(resolve => resolve(1));
    const params = Array.from(this.components).filter(item => !(item instanceof Component));
    params.forEach((item) => {
      const param = Object.assign({}, item);
      // 传递present child.passon = [] 若是空数组则parsent全部传递，否则查找键名传递
      if (param.passon instanceof Array) {
        let passPresent = {};
        if (param.passon.length === 0) {
          passPresent = this.present;
        } else {
          const presentKeys = Object.keys(this.present);
          const passKeys = param.passon.filter(key => ((typeof key === 'string') && presentKeys.includes(key)));
          passKeys.forEach((key) => {
            passPresent[key] = this.present[key];
          });
        }
        param.present = passPresent;
      }
      // 传递present
      promise = promise
        .then(() => Component.getView(param))
        .then(() => {
          const query = this.template.querySelector(param.query);
          if (Dom.isElement(query)) {
            param.query = query;
          }
          param.parent = this;
          const cpt = Component.of(param);
          const selector = Dom.of(query).attr('data-c-selector');
          if (selector) {
            this.elements[selector] = cpt.template;
          }
          this.components.delete(item);
          this.components.add(cpt);
          return cpt;
        });
    });
    return promise;
  }
  lifeCycle() {
    // 生命周期
    let promise = Promise.resolve(1);
    if (utils.isFunction(this.created)) {
      promise = promise.then(() => this.created());
    }
    promise = promise.then(() => this.implant());
    if (utils.isFunction(this.implanted)) {
      promise = promise.then(() => this.implanted());
    }
    this.state = 'implanted';
    return promise;
  }
  defineParent() {
    // 修改this.parent的getter和setter
    let parent;
    Object.defineProperty(this, 'parent', {
      enumerable: true,
      configurable: true,
      get: () => parent,
      set: (cpt) => {
        if (cpt === parent) { return parent; }
        if (cpt !== undefined && cpt !== null && !Component.isComponent(cpt)) {
          throw new TypeError(`父组件不可以为${cpt}`);
        }
        if (Component.isComponent(parent)) {
          parent.components.delete(this);
        }
        if (cpt) {
          parent = cpt;
          parent.components.add(this);
        } else {
          parent = null;
        }
        return parent;
      },
    });
  }
  formatComponents() {
    // 子组件components
    let componentsSet;
    if (!this.components) {
      componentsSet = new Set();
    } else if ((this.components instanceof Array) || (this.components instanceof Set)) {
      componentsSet = new Set([...this.components]);
    } else {
      throw new TypeError(`${this.components}不能作为子组件集`);
    }
    this.components = componentsSet;
  }
  formatData() {
    // 确保param.data符合设定
    if (!(this.data instanceof Function)) throw new TypeError('缺少data属性或data不是Function类型');
    const data = this.data();
    this.data = Object.assign({}, data);
    if ((data instanceof Array) || (typeof data !== 'object')) {
      throw new TypeError('data应该返回一个Object');
    } else {
      const keys = Object.keys(this.data);
      const isHasFunc = keys.some((key) => {
        const isFunc = this.data[key] instanceof Function;
        return isFunc;
      });
      if (isHasFunc) { throw new TypeError('data返回的Object中不能含有Function'); }
    }
    // watch data
    // const insideData = Object.assign({}, data);
    if (this.watch instanceof Function) {
      const watchs = this.watch();
      if ((watchs instanceof Object) && (!(watchs instanceof Array))) {
        const watchKeys = Object.keys(watchs);
        const dataKeys = Object.keys(data);
        const keys = watchKeys.filter(key => dataKeys.includes(key));
        keys.forEach((key) => {
          Object.defineProperty(this.data, key, {
            enumerable: true,
            get: () => data[key],
            set: (val) => {
              data[key] = val;
              watchs[key]();
            },
          });
        });
      }
    }
  }
  formatMethods() {
    // 绑定param.methods下的function的this指向
    if (this.methods) {
      const methods = {};
      const methodNames = Object.keys(this.methods);
      methodNames.forEach((methodName) => {
        const method = this.methods[methodName];
        if (typeof method === 'function') {
          methods[methodName] = method.bind(this);
        }
      });
      this.methods = methods;
    }
  }
  fillSelectors() {
    // 填充param.selectors 填充this.elements
    this.elements = {};
    if (this.selectors && (typeof this.selectors === 'object')) {
      // 接受{}类型的属性param.selectors 遍历param.selectors的键，取每个键的值作为querySelector参数，
      // 然后找到对应的HTMLElement集合并设置在this.elements属性中
      // 例如存在param.selectors.foo = '.foo' 则得到this.elements.foo = querySelector('.foo')
      const selectorNames = Object.keys(this.selectors);
      const elements = {};
      selectorNames.forEach((name) => {
        const selector = this.selectors[name];
        if (selector && utils.isString(selector)) {
          const element = this.template.querySelector(selector);
          if (utils.isElement(element)) {
            Dom.of(element).attr('data-c-selector', name);
            elements[name] = element;
          }
        }
      });
      if (Object.keys(elements).length > 0) {
        elements.template = this.template;
        this.elements = elements;
      }
    }
  }
  refresh(present) {
    // 刷新组件
    if (present) {
      this.present = present;
    }
    if (utils.isFunction(this.created)) {
      this.created();
    }
    if (utils.isFunction(this.implanted)) {
      this.implanted();
    }
  }
  /**
   * 查询一个组件
   * @param {Object} query - 必须，查询参数对象,可选索引componentId和name
   * @param {Number} query.componentId - 可选，实例化后组件被分配的唯一id
   * @param {String} query.name - 可选，组件的名称
   * @param {Component} cpt - 可选，实例化的组件，当存在时则从该组件的子组件中查找
   * @returns {Component|null}
   */
  static findBy(query, cpt) {
    const keys = Object.keys(query);
    const keyName = keys.find(key => (key === 'name'));
    const keyId = keys.find(key => (key === 'componentId'));
    if (!keyName && !keyId) { throw new Error(`查询参数无效${JSON.stringify(query)}`); }
    if (arguments.length > 1 && !(cpt instanceof Component)) { throw new TypeError(`不是有效组件${JSON.stringify(cpt)}`); }
    if (keyId && !Number.isSafeInteger(query.componentId)) { throw new TypeError(`不是有效组件componentId ${query.componentId}`); }
    let result = null;
    const set = (arguments.length > 1) ? cpt.components : components;
    const cpts = Array.from(set);
    for (let index = 0; index < cpts.length; index += 1) {
      const item = cpts[index];
      const matchName = !(keyName) || (query.name === item.name);
      const matchCId = !(keyId) || (Number(query.componentId) === Number(item.componentId));
      const isMatch = matchName && matchCId;
      if (isMatch) {
        result = item;
        break;
      }
    }
    return result;
  }
  /**
   * 查询单个子组件
   * @param {Object} query - 必须，查询参数对象,可选索引componentId和name
   * @param {Number} query.componentId - 可选，实例化后组件被分配的唯一id
   * @param {String} query.name - 可选，组件的名称
   * @returns {Component|null}
   */
  findBy(query) {
    return Component.findBy(query, this);
  }
  /**
   * 查找多个组件
   * @param {Object} query - 必须，查询参数对象,可选索引componentId和name
   * @param {Number} query.componentId - 可选，实例化后组件被分配的唯一id
   * @param {String} query.name - 可选，组件的名称
   * @param {Component} cpt - 可选，实例化的组件，当存在时则从该组件的子组件中查找
   * @returns {Array}
   */
  static where(query, cpt) {
    if (!query.name && !query.componentId) { throw new Error(`查询参数无效${JSON.stringify(query)}`); }
    if (arguments.length > 1 && !(cpt instanceof Component)) { throw new TypeError(`不是有效组件${JSON.stringify(cpt)}`); }
    const set = (arguments.length > 1) ? cpt.components : components;
    const cpts = Array.from(set);
    const filter = cpts.filter((item) => {
      const matchName = !(query.name) || query.name === item.name;
      const matchCId = !(query.componentId) || query.componentId === item.componentId;
      const isMatch = matchName && matchCId;
      return isMatch;
    });
    return filter;
  }
  /**
   * 查找多个子组件
   * @param {Object} query - 必须，查询参数对象,可选索引componentId和name
   * @param {Number} query.componentId - 可选，实例化后组件被分配的唯一id
   * @param {String} query.name - 可选，组件的名称
   * @returns {Array}
   */
  where(query) {
    return Component.where(query, this);
  }
  /**
   * 添加一个自定义事件
   * @param {String} typeArg - 必须，事件的名称
   * @param {Function} callback -  必须，触发事件的回调函数
   * @returns {undefined}
   */
  addEventListener(typeArg, callback) {
    this.template.addEventListener(typeArg, callback);
  }
  /**
   * 触发自定义事件
   * @param {String} typeArg - 必须，事件的名称
   * @param {Object} detail - 可选，用于传递数据
   * @returns {undefined}
   */
  dispatchEvent(typeArg, detail) {
    const event = new CustomEvent(typeArg, { detail });
    this.template.dispatchEvent(event);
  }

  handleImgSrc(element) {
    // 修改图片的src
    // 开发服务器是相对于component.html
    // 而打包完是相当于index.html
    // 如果图片是相对路径加载失败尝试根据此组件的url属性赋值新路径
    // 开发环境不用管
    // \u002e是.
    if (element.tagName !== 'IMG') { return false; }
    if (utils.getEnv() === 'node') { return false; }
    const beforeSrc = element.getAttribute('src');
    if (!beforeSrc.match(/^\u002e/)) { return false; }
    // 把元素的src属性和组件的url结合，就是相对组件url的路径
    const concat = this.url.concat(beforeSrc);
    const split = concat.split('/');
    // 处理 ../
    const mergeTwoPoints = (sp) => {
      const twoPointsIndex = sp.findIndex(item => item.match(/\u002e\u002e/));
      if (!twoPointsIndex || twoPointsIndex < 1) { return sp; }
      sp.splice(twoPointsIndex - 1, 2);
      return mergeTwoPoints(sp);
    };
    mergeTwoPoints(split);
    // 处理 ./
    const mergeOnePoint = (sp) => {
      const onePointIndex = sp.findIndex(item => item.match(/\u002e/));
      if (!onePointIndex || onePointIndex < 1) { return sp; }
      sp.splice(onePointIndex, 1);
      return mergeOnePoint(sp);
    };
    mergeOnePoint(split);
    const afterPath = split.join('/');
    Dom.of(element).attr('src', afterPath);
    console.log(`重新设置src为${afterPath}`);
    // 还是错误就尝试替换成白色图像，再失败就清除src
    let retry = 0;
    let blank = '';
    Dom.of(element).on('error', () => {
      if (retry < 1) {
        blank = afterPath.replace(/[^\u002f]+$/, 'blank.png');
      } else if (retry === 1) {
        blank = beforeSrc.replace(/[^\u002f]+$/, 'blank.png');
      } else {
        blank = '';
      }
      Dom.of(element).attr('src', blank);
      retry += 1;
      return blank;
    });
    return element;
  }

  setComponentId() {
    // 设置 data-component-id 属性
    this.componentId = String(takeId());
    this.template.setAttribute('data-c-id', `c${this.componentId}`);
    this.style.setAttribute('data-c-id', `c${this.componentId}`);
    const recursive = (element) => {
      if (!(element instanceof HTMLElement) || (element.childElementCount < 1)) { return false; }
      element.children.forEach((child) => {
        child.setAttribute('data-c-id', `c${this.componentId}`);
        if (child.src) {
          this.handleImgSrc(child);
        }
        recursive(child);
      });
      return element;
    };
    recursive(this.template);
    return this;
  }

  replaceGeneralScopedStyles(stylesContent) {
    // stylesContent是常规style 如 "div{} li{}"
    // 返回 "div[data-c-id=c${this.componentId}]{} li[data-c-id=c${this.componentId}]{}"
    const regGeneralStyleCompleteStructure = /[#\u002e\u002aA-Za-z][^{}]*{([^{}]*{[^{}]*})*[^{}]*}/g;
    const styles = stylesContent.match(regGeneralStyleCompleteStructure);
    styles.forEach((styleContent, styleIndex) => {
      const rep = this.replaceGeneralScopedStyle(styleContent);
      styles[styleIndex] = rep;
    });
    const result = styles.join(' ');
    return result;
  }

  replaceGeneralScopedStyle(style) {
    // 是单个结构完整的style 如： .klass: hover ul > li[name = x]: before{}
    // 返回 ...:hover ul[data-c-id=c${this.componentId}]> li
    const selectorsContents = style.replace(/\s*{.*$/, '').replace(/^\s*/, '').split(',');
    selectorsContents.forEach((singleSelectorsContent, selectorIndex) => {
      // singleSelectorsContent是单个结构完整的选择器 如： .klass:hover ul>li[name=x]:before
      const regSingleSelector = /[#\u002a\u002eA-Za-z][^\s+~>{]*/g; // 如  [".klass:hover", "ul>", "li[name=x]:before"]
      const repConent = singleSelectorsContent.replace(regSingleSelector, (selector) => {
        // selector是单个选择器如 .klass:hover 或 ul 或 li[name=x]:before
        const regNoPseudo = /([#\u002a\u002eA-Za-z][^:]*)/;
        const repSingleSelector = selector.replace(regNoPseudo, (selectorNoPseudo) => {
          // repSingleSelector是将选择器主体末尾，伪选择器前加上[data-c-id=c${this.componentId}]
          // 如从 li[name=x]:before => li[name=x][data-c-id=c${this.componentId}]:before
          const repNoPseudo = `${selectorNoPseudo}[data-c-id=c${this.componentId}]`;
          return repNoPseudo;
        });
        return repSingleSelector;
      });
      // 替换.klass:hover ul>li[name=x]:before 到.klass[data-c-id=c${this.componentId}]。。。
      selectorsContents[selectorIndex] = repConent;
    });
    const repselectorsContents = selectorsContents.join(',');
    const result = style.replace(/^[^{}]*{/, () => {
      const rep = `${repselectorsContents} {`;
      return rep;
    });
    return result;
  }

  handleScopedStyle() {
    // 处理scoped style 把每个选择器后都加上[data-c-id=c${this.componentId}]
    // unicode *#. \u002a\u0023\u002e
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    if (!isScoped) { return false; }
    // 去掉注释
    const commentReg = /\u002f\u002a(\u002f\u002a|[^\u002a])*\u002a\u002f/g;
    const removeComments = this.style.innerHTML.replace(commentReg, '');
    const content = removeComments;
    // 去掉换行
    const compressed = content.replace(/\n/g, '').replace(/\s+/g, ' ');
    const regStyleCompleteStructure = /(@keyframes|@media|[#\u002e\u002aA-Za-z])[^{}]*{([^{}]*{[^{}]*})*[^{}]*}/g;
    const styles = compressed.match(regStyleCompleteStructure);
    if (!styles) { return false; }
    styles.forEach((singleStyle, styleIndex) => {
      let repConent;
      // singleStyle是单条结构完整的style 如: selector {}
      if (singleStyle.match('@keyframes')) {
        // css 动画 如：@keyframes myfirst{ from { background: red; }to { background: yellow; }}
        repConent = singleStyle;
      } else if (singleStyle.match('@media')) {
        // 媒体查询 如：@media screen and (max-width: 300px) { body {background-color:lightblue; }}
        const mediaHeadReg = /^[^@]*@media[^{]*{/;
        const mediaHead = singleStyle.match(mediaHeadReg)[0];
        const styleContents = singleStyle.replace(mediaHead, '').replace(/}[^}]*$/, '');
        // styleContents是style主体 body {background-color:lightblue; }
        const replacedContents = (!utils.isEmptyString(styleContents))
          ? this.replaceGeneralScopedStyles(styleContents) : '';
        const mediaContent = `${mediaHead} ${replacedContents} }`;
        repConent = mediaContent;
      } else {
        // 常规单条style 如#id{} 或.class{} 或div{} 或div::before{} 或div:hover::before{}
        repConent = this.replaceGeneralScopedStyle(singleStyle);
      }
      styles[styleIndex] = repConent;
    });
    const resultStyleHTML = styles.join(' ');
    this.style.innerHTML = resultStyleHTML;
    return this;
  }
  implantStyle() {
    // 插入style
    if (!this.style) { return false; }
    const head = Dom.of('head');
    if (!head.hasChild(this.style)) { head.append(this.style); }
    return this.style;
  }
  implant() {
    // 根据this.query嵌入页面
    const isScoped = this.style.getAttribute('scoped') || (this.style.getAttribute('scoped') === '');
    if (utils.isElement(this.query)) {
      Dom.of(this.query).replace(this.template);
    }
    // 处理style
    if (this.style) {
      // 处理scoped style
      if (isScoped) { this.handleScopedStyle(); }
      // 插入 style
      this.implantStyle();
    }
    return this;
  }
  getView() {
    // 获取template和style
    return Component.getView(this);
  }
  static getView(param) {
    // 给参数获取template和style
    // 返回promise
    // 若含有template 直接返回
    // 若param.name有cache 则从cache获取
    // 若都没有，则ajax请求html文件获取并缓存
    let promise = Promise.resolve(1);
    const parameter = Object.assign(param);
    // 获取或保存cache bug 没有缓存到
    const cache = utils.isEffectiveString(param.name)
      && viewsCache.find(item => (item.name === param.name));
    if (!cache) {
      promise = Component.pjaxFormatHtml(param.url)
        .then(({ template, style }) => {
          const newCache = { template, style, name: param.name };
          const index = viewsCache.findIndex(item => (item.name === param.name));
          if (index && index > -1) {
            viewsCache.splice(index, 1, newCache);
          } else {
            viewsCache.push(newCache);
          }
        });
    }
    promise = promise
      .then(() => {
        const view = viewsCache.find(item => (item.name === param.name));
        const template = view.template && view.template.cloneNode(1);
        const style = view.style && view.style.cloneNode(1);
        parameter.template = template;
        parameter.style = style;
        return parameter;
      });
    return promise;
  }

  static pjaxFormatHtml(url) {
    // promiseAjax请求html文件 返回一个对象{template, style} template是该html文件的<body>下第一个子元素 style是第一个<style>
    if (!utils.isEffectiveString(url)) {
      throw new TypeError(`${url}不是有效的html文件地址`);
    }
    const promise = promiseAjax.get(url).then((result) => {
      const html = document.createElement('html');
      html.innerHTML = result;
      const styles = html.querySelectorAll('style');
      const body = html.querySelector('body');
      if (styles.length > 1) { throw new TypeError('至多可以有一个<style>元素'); }
      if (body.childElementCount !== 1) { throw new TypeError('<body>内应有且只有一个根元素'); }
      const template = body.firstElementChild;
      const style = styles[0] || document.createElement('style');
      const view = {
        template: template && template.cloneNode(1),
        style: style && style.cloneNode(1),
      };
      return view;
    });
    return promise;
  }
  /**
   * 相当于构造函数
   * @param {object} - 必须，配置参数
   * @returns {Component}
   */
  static of(param) {
    return new Component(param);
  }

  /**
   * 获取全部组件实例
   * @returns {Array}
   */
  static all() {
    return components;
  }
  /**
   * 判断是否是一个组件实例化对象
   * @param {*} component - 必须，被判断对象
   * @returns {boolean}
   */
  static isComponent(component) {
    // 判断是否是一个组件实例化对象
    return component && (component instanceof Component);
  }
  /**
   * 添加一个子组件到指定位置
   * @param {object|Component} want - 必须，组件参数或组件实例化对象
   * @param {HTMLElement} element - 必须，组件的template或其子元素
   * @param {number} position - 必须，一个数字，表示相对element的位置，-1表示成为element最后一个子元素，
   * 0表示成为element第一个子元素，1表示成为element第二个子元素
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  appendChild(want, element, position) {
    return Component.appendComponent(want, this, element, position);
  }
  /**
   * 将这个组件插入到一个指定位置
   * @param {HTMLElement} element - 必须，该组件将要作为这个元素的内部
   * @param {number} position - 必须，一个数字，表示相对element的位置，-1表示成为element最后一个子元素，
   * 0表示成为element第一个子元素，1表示成为element第二个子元素
   * @returns {Promise} - 若成功，则返回该组件
   */
  insertTo(element, position) {
    return Component.insertComponent(this, element, position);
  }
  /**
   * 替换子组件
   * @param {Object|Component} want - 必须，组件参数或组件实例化对象
   * @param {Component} exist - 必须，将被替换的子组件
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  replaceChild(want, exist) {
    const promise = Component.replaceComponent(want, exist).then((cpt) => {
      cpt.parent = this;
      return cpt;
    });
    return promise;
  }
  /**
   * 移除一个子组件
   * @param {Component} exist - 必须，将被移除的子组件
   * @returns {Promise} - 若成功，则返回exist
   */
  removeChild(exist) {
    if (!this.components.has(exist)) {
      throw new TypeError(`不是子组件${JSON.stringify(exist)}`);
    }
    return Component.removeComponent(exist);
  }
  /**
   * 将该组件替换为另一个组件
   * @param {Object|Component} want - 必须，组件参数或组件实例化对象
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  replace(want) {
    return Component.replaceComponent(want, this);
  }
  /**
   * 添加一个组件到另一个组件内部的指定位置成为其子组件
   * @param {object|Component} want - 必须，组件参数或组件实例化对象
   * @param {Component} exist - 必须，将作为父组件
   * @param {HTMLElement} element - 必须，exist组件的template或其子元素
   * @param {number} position - 必须，一个数字，表示相对element的位置，-1表示成为element最后一个子元素，
   * 0表示成为element第一个子元素，1表示成为element第二个子元素
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  static appendComponent(want, exist, element, position) {
    if (!Component.isComponent(exist)) {
      throw new TypeError(`${exist}不是组件`);
    }
    const validElement = Dom.isElement(element) &&
      (exist.template.isSameNode(element) || Dom.of(element).hasParent(exist.template));
    if (!validElement) {
      throw new TypeError(`${element}不是组件id:${exist.componentId}的子元素`);
    }
    if (!Number.isSafeInteger(position)) {
      throw new TypeError(`Component.appendComponent position不能是${position}`);
    }
    let promise = new Promise(resolve => resolve(want));
    if (!(want instanceof Component)) {
      const param = Object.assign(want);
      promise = Component.getView(param)
        .then(() => {
          param.query = param.template;
          const cptLoad = Component.of(param).load();
          return cptLoad;
        });
    }
    promise = promise.then((cpt) => {
      // 把template插入到position的位置
      Dom.of(element).appendAccurate(cpt.template, position);
      cpt.implantStyle();
      cpt.parent = exist;
      return cpt;
    });
    return promise;
  }
  /**
   * 将一个组件插入到页面的指定位置
   * @param {object|Component} want - 必须，组件参数或组件实例化对象
   * @param {HTMLElement} element - 必须，目标元素
   * @param {number} position - 必须，一个数字，表示相对element的位置，-1表示成为element最后一个子元素，
   * 0表示成为element第一个子元素，1表示成为element第二个子元素
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  static insertComponent(want, element, position) {
    if (!utils.isElement(element)) { throw new TypeError(`Component.insertComponent element不能是${element}`); }
    if (!Number.isSafeInteger(position)) {
      throw new TypeError(`Component.insertComponent position不能是${position}`);
    }
    async function action() {
      const cpt = await Component.of(want).load();
      Dom.of(element).appendAccurate(cpt.template, position);
      cpt.implantStyle();
      return cpt;
    }
    return action();
  }
  /**
   * 将一个组件实例化对象替换为另一个组件参数或实例化的组件
   * @param {object|Component} want - 必须，组件参数或组件实例化对象
   * @param {Component} exist - 必须，被替换的组件
   * @returns {Promise} - 若成功，则返回被添加的子组件
   */
  static replaceComponent(want, exist) {
    if (!Component.isComponent(exist)) { throw new TypeError(`${exist}不是组件实例化对象`); }
    let promise = new Promise(resolve => resolve(want));
    if (!(Component.isComponent(want))) {
      if (!utils.isString(want.url)) { throw new TypeError('param.url应该是字符串类型html文件地址'); }
      promise = Component.getView(want)
        .then(() => {
          want.query = exist.template;
          return Component.of(want);
        });
    }
    promise = promise.then((cpt) => {
      Dom.of(exist.template).replace(cpt.template);
      Dom.of(exist.style).replace(cpt.style);
      cpt.parent = exist.parent;
      return cpt;
    });
    return promise;
  }
  /**
   * 移除一个组件
   * @param {Component} component - 必须，将被移除的组件
   * @returns {Promise} - 若成功，则返回component
   */
  static removeComponent(component) {
    if (!Component.isComponent(component)) { throw new TypeError(`${component}不是一个组件`); }
    const clearTemplate = (cpt) => {
      if (!Component.isComponent(cpt)) { return false; }
      const removed = Dom.of(`*[data-c-id=c${cpt.componentId}]`).remove();
      if (!removed) { return false; }
      return clearTemplate(cpt);
    };
    const destroy = (cpt) => {
      if (!Component.isComponent(cpt)) { return false; }
      Dom.of(cpt.style).remove();
      components.delete(cpt);
      cpt.components.forEach(item => destroy(item));
      cpt.components.clear();
      cpt.parent = null;
      clearTemplate(cpt);
      if (cpt.removed && cpt.removed instanceof Function) { cpt.removed(); }
      return cpt;
    };
    const promise = new Promise((resolve) => {
      destroy(component);
      Dom.of(component.template).remove();
      resolve(component);
    });
    return promise;
  }
}

Component.components = components;
Component.root = root;
Component.origin = origin;
window.Component = Component;

export default Component;
// todo 把handleImgSrc放在html变成元素之前处理 就不会重复请求图片了
