Page({
  data: {
    TabCur: 1,//选项卡值
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      TabCur : options.TabCur
    })
  },
  /**
   * 选项卡变化
   */
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  },
  /**
   * 查看具体分类
   */
  seeDetail: function (event){
    var index = event.currentTarget.dataset.index
    switch (parseInt(index)) {
      case 1:
        console.log("可回收垃圾")
        wx.navigateTo({
          url: '../sortToDetail/sortToDetail?type=' + 1,
        })
        break;
      case 2:
        wx.navigateTo({
          url: '../sortToDetail/sortToDetail?type=' + 2,
        })
        break;
      case 3:
        wx.navigateTo({
          url: '../sortToDetail/sortToDetail?type=' + 4,
        })
        break;
      case 4:
        wx.navigateTo({
          url: '../sortToDetail/sortToDetail?type=' + 3,
        })
        break;
    }
  }
})