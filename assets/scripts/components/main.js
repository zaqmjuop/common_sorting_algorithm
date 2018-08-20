import Component from './component';
import routerParam from './router';
import noticeParam from './notice';

/** 加载全部组件 */

async function main() {
  const router = await Component.of(routerParam);
  const notice = await Component.of(noticeParam);
  window.router = router;
  window.notice = notice;
  return console.log('组件加载完毕');
}

export default main;
