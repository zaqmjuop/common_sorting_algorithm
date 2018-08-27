import 'babel-polyfill';
import main from './components/main';
import Dom from './dom';

document.addEventListener('DOMContentLoaded', () => {
  window.Dom = Dom;
  window.addEventListener('resize', () => {
    document.body.style.offsetHeight = `${window.innerHeight}px`;
  });
  window.resizeTo(window.innerWidth, window.innerHeight);
  main();
});
// 十分恶心的东西 你算吧
// var a = 10;
// ++a**a%a--
