// pages/ai/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon: [{ name: '卫生纸', color: "blue" }, { name: 'A4纸', color: "red" }, { name: '电池', color: "grey" }, { name: '筷子', color: "green" }, { name: '水壶', color: "orange" }, { name: '白糖', color: "purple" }, { name: '圆珠笔', color: "pink" }, { name: '玻璃瓶', color: "yellow" }, { name: '牙签', color: "brown " }, { name: '充电器', color: "blue" }, { name: '数据线', color: "brown" }, { name: '中药药渣', color: "grey" }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { },
  goSearch: function (event) {
    var name1 = event.currentTarget.dataset.name ? event.currentTarget.dataset.name : "" 
    wx.navigateTo({
      url: 'search/search?name1='+name1,
    })
  },
})