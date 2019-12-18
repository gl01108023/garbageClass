// miniprogram/pages/sort/voice/voice.js
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isStop: false,
    tempFilePath: "",
    size: 0,
    accessToken: "",
    result: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var time = wx.getStorageInfoSync("time")
    var currentTime = new Date().getTime();
    var timeNumber = parseInt(currentTime - parseInt(time)) / (1000 * 60 * 60 * 24);
    var accessToken = wx.getStorageSync("access_token");
    //因为accesstoken只在一个月内有效所以要加时间判断
    if (timeNumber > 30 || !accessToken) {
      this.accessTokenRequest();
    } else {
      this.setData({
        accessToken: wx.getStorageSync("access_token")
      })
    }
  },
  /**
   * 一般Access Token的有效期(秒为单位，一般为1个月),所以请求可能随时会发生,所以要异步方法；
   */
  accessTokenRequest: function() {
    var that = this;
    //调用云函数,获取Access Token
    wx.cloud.callFunction({
      name: 'baiduAccessToken',
      success: function(res) {
        that.data.accessToken = res.result.data.access_token
        wx.setStorageSync("access_token", res.result.data.access_token)
        wx.setStorageSync("time", new Date().getTime())
      },
      fail: function(err) {
        wx.clearStorageSync("access_token")
        wx.showToast({
          title: "调用失败,请稍后重试"
        })
        console.error('[云函数]调用失败', err)
      }
    })
  },
  /** 录音开始 */
  clickSay: function(e, that) {
    this.setData({
      isStop: true
    })
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50
    }
    recorderManager.start(options);
  },
  /**停止录音 */
  clickStop: function() {
    recorderManager.stop();
    this.setData({
      isStop: false
    })
    var that = this
    recorderManager.onStop((res) => {
      console.log('停止录音', res.tempFilePath)
      that.setData({
        tempFilePath: res.tempFilePath
      })
      //读取本地文件内容
      wx.getFileSystemManager().getFileInfo({
        filePath: that.data.tempFilePath, //要读取的文件的路径 (本地路径)
        success: res0 => { //接口调用成功的回调函数
          that.setData({
            size: res0.size
          })
          //读取本地文件内容
          wx.getFileSystemManager().readFile({
            filePath: that.data.tempFilePath, //要读取的文件的路径 (本地路径)
            encoding: "base64",
            success: res1 => { //接口调用成功的回调函数
              that.req(that.data.accessToken, res1.data, that.data.size)
              // console.log(res1.data)
            },
            fail: res1 => { //接口调用失败的回调函数
              console.log(res1.errMsg)
              wx.showToast({
                title: '录音失败',
              })
            }
          })
        },
        fail: res0 => { //接口调用失败的回调函数
          console.log(res0.errMsg)
          wx.showToast({
            title: '录音失败',
          })
        }
      })
    })
  },
  //播放声音
  play: function() {
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  /**
   * 发送百度ai智能识别请求
   */
  req: function(accessToken, voice, size) {
    var that = this
    //该请求用于通用物体及场景识别，即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中的多个物体及场景标签。
    wx.request({
      url: 'https://vop.baidu.com/server_api',
      data: {
        "format": "pcm",
        "rate": 16000,
        "dev_pid": 1536,
        "channel": 1,
        "token": accessToken,
        "cuid": "68-F7-28-F3-35-26",
        "len": size,
        "speech": voice, // xxx为 base64（FILE_CONTENT）
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success(res) {
        console.log(res)
        var code = res.data.err_no
        if (code == 3302) {
          wx.clearStorageSync("access_token")
          wx.clearStorageSync("time")
          that.accessTokenRequest()
          return
        }
        console.log(res.data.result)
        var result = res.data.result
        if (result) {
          that.setData({
            result: result,
          })
          wx.navigateTo({
            url: '../../ai/search/search?name1=' + result[0],
          })
        } else {
          wx.clearStorageSync("access_token")
          wx.showToast({
            title: 'AI识别失败,请重新尝试',
            icon: "none"
          })
        }
      },
      fail(res) {
        console.log(res.data.err_msg)
      }
    })
  },
})