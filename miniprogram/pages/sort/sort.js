// pages/sort/sort.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  toAR: function(){
    wx.showToast({
      title: '功能正在开发中，敬请期待。。。',
      icon: "none"
    })
  },
  /**
   * 前往拍照页面
   */
  toCamera: function(){
    wx.navigateTo({
      url: '../ai/camera/camera',
    })
  },
  /**
   * 前往语音搜索页面
   */
  toVoice: function () {
    wx.navigateTo({
      url: 'voice/voice',
    })
  },
  /**
   * 前往文字识别页面
   */
  toText: function () {
    wx.navigateTo({
      url: '../ai/search/search',
    })
  },
  /**
   * 根据定义好的val 判断垃圾类型并显示
   */
  sortDetail: function(event) {
    var index = event.currentTarget.dataset.index
    switch (parseInt(index)) {
      case 1:
        console.log("可回收垃圾")
        wx.navigateTo({
          url: 'sortDetail/sortDetail?TabCur=' + 1,
        })
        break;
      case 2:
        wx.navigateTo({
          url: 'sortDetail/sortDetail?TabCur=' + 2,
        })
        break;
      case 3:
        wx.navigateTo({
          url: 'sortDetail/sortDetail?TabCur=' + 3,
        })
        break;
      case 4:
        wx.navigateTo({
          url: 'sortDetail/sortDetail?TabCur=' + 4,
        })
        break;
    }
  }
})