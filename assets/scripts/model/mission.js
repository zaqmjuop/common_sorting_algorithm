import ArrayStorage from 'arraystorage';
import utils from '../utils';

const mission = new ArrayStorage({ databaseName: 'mission' });

const getAll = () => {
  const filter = mission.getAll();
  return filter;
};
const getExpired = () => {
  const filter = mission.filter((item) => {
    const isNeed = (item.date instanceof Date) && (utils.differDay(item.date, utils.now) > 0);
    return isNeed;
  });
  return filter;
};
const getDone = () => {
  const filter = mission.filter(item => (item.state === 'done'));
  return filter;
};
const getUndone = () => {
  const filter = mission.filter(item => (item.state !== 'done'));
  return filter;
};

const defaultQuery = {
  all: getAll,
  expired: getExpired,
  done: getDone,
  undone: getUndone,
};


const getDate = () => {
  const filter = mission.filter((item) => {
    const isNeed = (item.date instanceof Date) && (utils.differDay(item.date, utils.now) > 0);
    return isNeed;
  });
  return filter;
};
const getMark = (mark) => {
  const filter = mission.filter((item) => {
    const isNeed = (typeof item.mark === 'string') && item.mark === String(mark);
    return isNeed;
  });
  return filter;
};

const getObj = (obj) => {
  const keys = Object.keys(obj);
  const filter = mission.filter((item) => {
    const isMatch = keys.every(key => (item[key] === obj[key]));
    return isMatch;
  });
  return filter;
};

const getQuery = (query) => {
  let result;
  if (typeof query === 'string') {
    if (defaultQuery[query]) {
      result = defaultQuery[query]();
    } else {
      result = getMark(query);
    }
  } else if (query instanceof Date) {
    result = getDate(query);
  } else if (query instanceof Object) {
    result = getObj(query);
  } else {
    console.warn(`mission.methods.GetQuery 尚不支持查询${query}`);
  }
  return result;
};

mission.quadrants = [
  { important: true, urgent: true },
  { important: true, urgent: false },
  { important: false, urgent: true },
  { important: false, urgent: false },
];

mission.methods = {
  getAll, getExpired, getDate, getMark, getQuery,
};

/** 任务model */
export default mission;
