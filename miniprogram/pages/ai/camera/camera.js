
Page({
  //基础数据服务
  data: {
    accessToken: "",
    isShow: false,
    results: [],
    src: "",
    isCamera: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = wx.getStorageInfoSync("time")
    var currentTime = new Date().getTime();
    var timeNumber = parseInt(currentTime - parseInt(time))/(1000*60*60*24);
    var accessToken = wx.getStorageSync("access_token");
    if(timeNumber > 30 || !accessToken){
      this.accessTokenRequest();
    } else {
      this.setData({
        accessToken: wx.getStorageSync("access_token")
      })
    }
  },
  /**
   * 一般Access Token的有效期(秒为单位，一般为1个月),所以请求可能随时会发生；
   */
  accessTokenRequest: function() {
    var that = this;
    wx.cloud.callFunction({
      name:'baiduToken',
      success: function(res) {
        console.log("==baiduAccessToken==" + JSON.stringify(res))
      },
      fail:console.error
    })
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath,
          isCamera: false
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  }

})