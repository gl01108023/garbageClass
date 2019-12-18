
wx.cloud.init();
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    MAX_LIMIT: 20,
    page: 0,
    dataCount: 0,
    datas: [],
    searchTxt: "",
    logo: "",
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.dataCount = db.collection('product').count()
    db.collection('product').where({
    }).get({ // get 方法会触发网络请求，往数据库取数据
      success: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 获取查询输入值
   */
  searchIcon: function (e) {
    this.data.searchTxt = e.detail.value
    console.log(this.data.searchTxt)
    this.data.page = 0
    this.onGetData()
  },
  /**
   * 根据输入框的值进行查询
   */
  onGetData: function () {
    wx.showLoading({
      title: '正在加载数据中......',
    })
    if (this.data.dataCount < this.data.page * this.data.MAX_LIMIT) {
      wx.showToast({
        title: '数据加载完成',
        icon: "none"
      })
      wx.hideLoading()
      return
    }
    var that = this
    if (this.data.page == 0) {
      this.data.datas = [];
    }
    //Collection.skip / Query.skip指定查询返回结果时从指定序列后的结果开始返回，常用语分页
    console.log(this.data.searchTxt)
    var datas = db.collection('product').skip(
      this.data.page * this.data.MAX_LIMIT
      //Collection.limit / Query.limit指定查询结果集数量上限
    ).limit(this.data.MAX_LIMIT).where({
      //从基础库 2.3.2 开始（wx-server-sdk 从 0.0.23 开始），数据库支持正则表达式查询，开发者可以在查询语句中使用           //JavaScript 原生正则对象或使用 db.RegExp 方法来构造正则对象然后进行字符串匹配。在查询条件中对一个字段进行正则匹       //配即要求该字段的值可以被给定的正则表达式匹配，注意正则表达式不可用于 db.command 内（如 db.command.in）。
      name: db.RegExp({
        regexp: that.data.searchTxt,
      })
    }).get({
      success: function (res) {
        wx.hideLoading()
        that.data.page = that.data.page + 1;
        for (var i = 0; i < res.data.length; i++) {
          that.data.datas.push(res.data[i])
        }
        that.setData({
          datas: that.data.datas
        })
      }
      , fail: res => {
        wx.hideLoading()
        wx.showToast({
          title: '数据加载失败',
          icon: "none"
        })
      }
    })
  },
  /**
   * 根据定义好的index 判断垃圾类型并显示
   */
  onClick: function (event) {
    var index = event.currentTarget.dataset.index
    var logoImg = ""
    switch (parseInt(index)) {
      case 1:
        logoImg = "/images/RecycleableWaste.jpg"
        break;
      case 2:
        logoImg = "/images/HazardouAwaste.jpg"
        break;
      case 3:
        logoImg = "/images/HouseholdfoodWaste.jpg"
        break;
      case 4:
        logoImg = "/images/ResidualWaste.jpg"
        break;
    }
    this.setData({
      logo: logoImg,
      isShow: !this.data.isShow
    })
  },
  /**
   * 放大图片,告知垃圾类型
   */
  hideModal: function () {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  /**
   * 下拉刷新PullDownRefresh
   */
  onPullDownRefresh: function () {
    this.data.page = 0
    this.data.datas = []
    this.onGetData()
  },
  /**
     * 上拉触底事件onReachBottom
     */
  onReachBottom: function () {
    this.onGetData()
  },
})