import Component from './component';
import welcomeParam from './welcome';

/** 加载全部组件 */

async function main() {
  const welcome = await Component.of(welcomeParam);
  return console.log('组件加载完毕');
}

export default main;
