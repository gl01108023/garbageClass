// miniprogram/pages/sort/sortToDetail/sortToDetail.js
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
    type: 1,
    logo: "",
    loading: false,
    showGoTop: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.type = options.type
    var title = ""
    var logoImg = ""
    var typeIndex = parseInt(this.data.type)
    switch (typeIndex) {
      case 1:
        title = '可回收物'
        logoImg = "/images/Icon_03.jpg"
        break;
      case 2:
        title = '有害垃圾'
        logoImg = "/images/Icon_05.jpg"
        break;
      case 3:
        title = '湿垃圾'
        logoImg = "/images/Icon_09.jpg"
        break;
      case 4:
        title = '干垃圾'
        logoImg = "/images/Icon_10.jpg"
        break;
    }
    wx.setNavigationBarTitle({
      title: title,
    })
    this.setData({
      logo: logoImg
    })
    let that = this
    db.collection('product').where({
      sortId: parseInt(this.data.type)
    }).count({
      success: function (res) {
        that.data.dataCount = res.total
      }
    })
    this.onGetData()
  },
  // 获取滚动条当前位置，并显隐按钮
  onPageScroll: function (e) {
    if (e.scrollTop < 200) {
      this.setData({
        showGoTop: true
      })
    } else {
      this.setData({
        showGoTop: false
      })
    }
  },
  // 回到顶部
  goTop: function (e) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 云数据库请求
   */
  onGetData: function () {
    this.setData({
      loading: true
    })
    if (this.data.dataCount < this.data.page * this.data.MAX_LIMIT) {
      wx.showToast({
        title: '数据已经加载完',
        icon: "none"
      })
      this.setData({
        loading: false
      })
      return
    }
    var that = this
    if (this.data.page == 0) {
      this.data.datas = []
    }
    var datas = db.collection('product').skip(this.data.page * this.data.MAX_LIMIT).limit(this.data.MAX_LIMIT).where({
      sortId: parseInt(that.data.type)
    }).get({
      success: function (res) {
        that.data.page = that.data.page + 1
        for (var i = 0; i < res.data.length; i++) {
          that.data.datas.push(res.data[i])
        }
        that.setData({
          loading: false,
          datas: that.data.datas
        })
      },
      fail: res => {
        this.setData({
          loading: false
        })
        wx.showToast({
          title: '数据加载失败',
          icon: "none"
        })
      }
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.data.page = 0
    this.onGetData()
  },
  /**
   * 上滑加载更多数据
   */
  onReachBottom: function () {
    this.onGetData()
  },
})