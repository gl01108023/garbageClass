const rq = require('request-promise')
/**
 * 获取 百度智能云  token
 * 请求URL数据格式
 * 向授权服务地址https://aip.baidubce.com/oauth/2.0/token发送请求（推荐使用POST），并在URL中带上以下参数：
 * grant_type： 必须参数，固定为client_credentials；
 * client_id： 必须参数，应用的API Key；
 * client_secret： 必须参数，应用的Secret Key；
 */
// 云函数入口函数(异步函数)
exports.main = async(event, context) => {
  let API_KEY = "wivYmzYp8FKOP8WMA257Ae3M",
  SECRET_KEY = "2VaooZ8hXSV1bjHe1ZQU5jcgBxGuyqjv",
  grantType = 'client_credentials',
  url = `https://aip.baidubce.com/oauth/2.0/token`

  return await rq({
    method: 'POST',
    url,
    form: {
      "grant_type": grantType,
      "client_id": API_KEY,
      "client_secret": SECRET_KEY
    },
    json: true
  }).then(res => {
    return Promise.resolve({
      code: 0,
      data,
      info: '操作成功'
    })
  }).catch(err => {
    if (!error.code) {
      return Promise.reject(error)
    }
    return error;
  })
}