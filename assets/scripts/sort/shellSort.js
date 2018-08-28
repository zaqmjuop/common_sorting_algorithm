import insertionSort from './insertionSort';

const shellSort = (array) => {
  if (!(array instanceof Array)) { return false; }
  let increment = Math.trunc(array.length / 2);
  for (; increment >= 1; increment = Math.trunc(increment / 2)) {
    // 分组 -> 排序 -> 替换原值
    // 分组,按照影响的index分组
    const effectIndexTeams = []; // 一个二元数组，每个成员是一个数组记录影响的index
    for (let index = 0; index < increment; index += 1) {
      const effectIndexTeam = []; // 影响的Index数组
      let effectIndex = index; // 影响的index
      while (effectIndex < array.length) {
        effectIndexTeam.push(effectIndex);
        effectIndex += increment;
      }
      effectIndexTeams.push(effectIndexTeam);
    }
    effectIndexTeams.forEach((effectIndexTeam) => {
      // 排序
      const effectTeam = effectIndexTeam.map(effectIndex => array[effectIndex]);
      // 这里插入排序effectTeam
      insertionSort(effectTeam);
      // 改变原值
      effectIndexTeam.forEach((effectIndex, index) => {
        array.splice(effectIndex, 1, effectTeam[index]);
      });
    });
  }
  return array;
};

export default shellSort;
