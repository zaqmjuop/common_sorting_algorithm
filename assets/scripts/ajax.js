import Utils from './utils';

const ajax = {
  get: (url, callback) => {
    // ajax get
    if (typeof url !== 'string') { throw new TypeError('路径错误'); }
    if (!(callback instanceof Function)) { throw new TypeError('回调函数错误'); }
    const xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = (res) => {
      if (xmlhttp.readyState !== 4 || xmlhttp.status !== 200) { return false; }
      return callback(res);
    };
  },
};

/** ajax封装模块 */
const promiseAjax = {
  get: (url) => {
    // promise ajax get
    if (!Utils.isString(url)) { throw new TypeError('参数url是路径 字符串类型'); }
    const promise = new Promise((resolve) => {
      ajax.get(url, (result) => {
        resolve(result.target.response);
      });
    });
    return promise;
  },
};

export default promiseAjax;
