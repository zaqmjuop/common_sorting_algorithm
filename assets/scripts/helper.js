/** 获取指定长度的由随机数组成的数组 */
const getRandomArray = (length = 20, min = 0, max = 100) => {
  if (!Number.isSafeInteger(length)) { throw new TypeError(`参数length不能是${length}`); }
  if (!Number.isSafeInteger(min)) { throw new TypeError(`参数min不能是${min}`); }
  if (!Number.isSafeInteger(max)) { throw new TypeError(`参数max不能是${max}`); }
  if (max < min) { throw new TypeError('max < min'); }
  const container = [];
  for (let index = 0; index < length; index += 1) {
    const value = Math.trunc((max + 1 - min) * Math.random()) + min;
    container.push(value);
  }
  return container;
};

function* colorNameGenerator() {
  let time = -1;
  while (1) {
    time += 1;
    if (time > 30) { time = 0; }
    let color;
    const index = time % 3;
    const value = 240 - Math.trunc(time / 6) * 32;
    if (Math.trunc(time / 3) % 2 === 0) {
      color = [0, 0, 0];
      color.splice(index, 1, value);
    } else {
      color = [value, value, value];
      color.splice(index, 1, 0);
    }
    const color16 = color.map(item => (item).toString(16).padEnd(2, item));
    const name = `#${color16.join('')}`;
    yield name;
  }
}
const colorNameStore = colorNameGenerator();
// 获取一个颜色值
const takeColorName = () => colorNameStore.next().value;

export { getRandomArray, takeColorName };
