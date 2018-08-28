const radixSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  // 设置一个长度为10的容器，每个成员是一个空数组
  const container = [];
  const initContainer = () => {
    container.splice(0, 10, ...[[], [], [], [], [], [], [], [], [], []]);
  };
  initContainer();
  // 找到最大值
  let max = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
  });
  // 计算出位数
  let decimal = 0;
  while (max > 0) {
    decimal += 1;
    max = Math.floor(max / 10);
  }
  decimal = (decimal >= 1) ? decimal : 1;
  // 最大值是2位数就排2次，3位数就排3次
  for (let time = 0; time < decimal; time += 1) {
    // 算出对应位数的数字，并按分组放进容器
    array.forEach((item) => {
      const index = Math.floor(item / (10 ** time)) % 10;
      container[index].push(item);
    });
    // 替换原数组并清空容器
    array.splice(0, array.length);
    container.forEach(team => array.push(...team));
    initContainer();
  }
  return array;
}

export default radixSort;
