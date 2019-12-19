// miniprogram/pages/sort/voice/voice.js
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFilePath: "",
    size: 0,
    accessToken: "",
    result: [],
    hasRecord: false,
    isDot: "block",
    isTouchStart: false,
    isTouchEnd: false,
    value: '100',
    touchStart: 0,
    touchEnd: 0,
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
    var a = this;
    wx.authorize({
      scope: "scope.record",
      success: function() {
        console.log("录音授权成功");
      },
      fail: function() {
        console.log("录音授权失败");
      }
    }), a.onShow()
  },
  // 点击录音按钮
  onRecordClick: function() {
    wx.getSetting({
      success: function(t) {
        console.log(t.authSetting),
        t.authSetting["scope.record"] ? console.log("已授权录音") : (console.log("未授权录音"),
        wx.openSetting({
          success: function(t) {
            console.log(t.authSetting);
          }
        }));
      }
    });
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
  recordStart: function(e, that) {
    var n = this;
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50
    }
    recorderManager.start(options);
    n.setData({
      touchStart: e.timeStamp,
      isTouchStart: true,
      isTouchEnd: false,
      showPg: true,
    })
    var a = 15,
      o = 10;
    this.timer = setInterval(function() {
      n.setData({
        value: n.data.value - 100 / 1500
      }), (o += 10) >= 1e3 && o % 1e3 == 0 && (a--, console.log(a), a <= 0 && (recorderManager.stop(),
        clearInterval(n.timer), n.animation2.scale(1, 1).step(), n.setData({
          animationData: n.animation2.export(),
          showPg: false,
        })));
    }, 10);
  },
  /**
   * 长按录音结束
   */
  recordTerm: function(e) {
    recorderManager.stop();
    this.clickStop();
    this.setData({
      isTouchEnd: true,
      isTouchStart: false,
      touchEnd: e.timeStamp,
      showPg: false,
      value: 100
    }), clearInterval(this.timer);
  },
  /**停止录音 */
  clickStop: function() {
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
        "dev_pid": 1537,
        "channel": 1,
        "token": accessToken,
        "cuid": "68-F7-28-F3-35-26",
        "len": parseInt(size),
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