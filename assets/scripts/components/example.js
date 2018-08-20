import Component from './component';

const param = {
  // 必需 name 组件的名称，可以用于查找组件
  name: 'example',
  // 必需 query是目标替换元素,接受String或HTMLElement
  // 若query为String则最为querySelector参数
  query: '.klass',
  // 必需 url是模板文件路径
  url: './assets/templates/example.html',
  // 必需 data 是组件的初始数据,若作为Object则共享一个对象，若作为Function return Object则不共享
  data() {
    return { counter: 1 };
  },
  // 可选 selectors 选中模板中的元素key是标识,value是querySelector参数，结果保存在elements属性中
  selectors: {
    div: 'div',
  },
  // 可选 methods是方法的集合 this会绑定在组件上
  methods: {
    log() {
      console.log(this); // param
    },
  },
  // 可选 created在实例化之后，插入到页面之前执行
  created() { console.log('create'); },
  // 可选 implanted在插入到页面之后执行
  implanted() { console.log('implanted'); },
};

// 创建组件实例对象
const cpt = new Component(param);
export default param;
