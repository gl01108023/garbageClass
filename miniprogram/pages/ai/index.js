// pages/ai/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon: [{ name: '卫生纸', isShow: true }, { name: 'A4纸', isShow: true }, { name: '电池', isShow: true }, {              name: '筷子', isShow: true }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { },
  goSearch: function () {
    wx.navigateTo({
      url: 'search/search',
    })
  },
  onBindCamera: function () {
    wx.navigateTo({
      url: 'camera/camera',
    })
  },
})