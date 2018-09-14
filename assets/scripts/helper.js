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

export { getRandomArray };
