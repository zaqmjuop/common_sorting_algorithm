const radixSort = (array) => {
  if (!(array instanceof Array)) { throw new TypeError(`${array} 不是Array`); }
  // 设置一个长度为10的容器，每个成员是一个空数组
  const container = [[], [], [], [], [], [], [], [], [], []];
  // 找到最大值
  let max = array[0];
  array.forEach((item) => {
    if (item > max) { max = item; }
  });
  // 计算出位数
  let digit = 0;
  while (max > 0) {
    digit += 1;
    max = Math.trunc(max / 10);
  }
  // 最大值是2位数就排2次，3位数就排3次
  for (let time = 0; time < digit; time += 1) {
    // 算出对应位数的数字，并按分组放进容器
    array.forEach((item) => {
      const index = Math.trunc(item / (10 ** time)) % 10;
      container[index].push(item);
    });
    // 替换原数组并清空容器
    array.splice(0, array.length);
    container.forEach((team) => {
      array.push(...team);
      team.splice(0, team.length);
    });
  }
  return array;
};

export default radixSort;
