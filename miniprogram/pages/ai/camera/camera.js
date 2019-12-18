var http = require("../../../util/http.js")

Page({
  //基础数据服务
  data: {
    accessToken: "",
    isShow: false,
    results: [],
    src: "",
    isCamera: true,
    btnText: "拍照"
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
  /**
   * 获取拍照图片信息,通过小程序api对照片进行处理
   */
  takePhoto() {
    var that = this
    if (this.data.isCamera == false) {
      this.setData({
        isCamera: true,
        btnTxt: "拍照"
      })
      return
    }
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'normal',
      success: (res) => {
        this.setData({
          src: res.tempImagePath,
          isCamera: false,
          btnText: "再来一张"
        })
        wx.showLoading({
          title: '正在加载中......',
        })
        //读取本地文件内容
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath,//要读取的文件的路径 (本地路径)
          encoding: "base64",//指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容
          success: res => {//接口调用成功的回调函数
            that.req(that.data.accessToken, res.data)
            wx.hideLoading()
          },
          fail: res => {//接口调用失败的回调函数
            wx.hideLoading()
            wx.showToast({
              title: '拍照失败',
            })
          }
        })
      }
    })
  },
  /**
   * 发送百度ai智能识别请求
   */
  req: function(accessToken, image) {
    var that = this
    //该请求用于通用物体及场景识别，即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中的多个物体及场景标签。
    http.req("https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=" + accessToken, {
      "image": image
    }, function(res){
      wx.hideLoading()
      var code = res.data.error_code
      if (code == 100 || code == 110 || code == 111){
        wx.clearStorageSync("access_token")
        wx.clearStorageSync("time")
        that.accessTokenRequest()
        return
      }
      var resultNum = res.data.result_num
      var results = res.data.result
      if(results){
        /**
         * 如果直接用this调用setData就会报TypeError: Cannot read property 'setData' of undefined
         * 该问题为作用域问题——回调函数中的作用域已经脱离了调用函数了
         * 因此需要在回调函数外边把this赋给一个新的变量才可以
         */
        that.setData({
          results: results,
          isShow: true
        })
      } else {
        wx.clearStorageSync("access_token")
        wx.hideLoading()
        wx.showToast({
          title: 'AI识别失败,请重新尝试',
          icon: "none"
        })
      }
    },"POST")
  },
  /**
   * 隐藏弹出层
   */
  hideModal: function () {
    this.setData({
      isShow: false,
    })
  },
  /**
   * 识别后单选框自带方法
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    //保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
    //使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层
    wx.navigateTo({
      url: "/pages/ai/detail/detail?keyword=" + e.detail.value,
      fail: function(res) {
        wx.showToast({
          title: '跳转页面失败',
        })
      }
    })
  },
  /**
   * 错误信息打印
   */
  error(e) {
    console.log(e.detail)
  }
})