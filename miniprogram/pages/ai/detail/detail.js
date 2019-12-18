// pages/ai/detail/detail.js
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
    garbageContent: "",
    detailContent: "",
    isShow: true,
    dialogModalShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.searchTxt = options.keyword;
    this.data.dataCount = db.collection('product').count()
    this.onGetData()
  },
  /**
   * 根据输入框的值进行查询
   */
  onGetData: function() {
    this.setData({
      loading: true
    })
    if (this.data.dataCount < this.data.page * this.data.MAX_LIMIT) {
      wx.showToast({
        title: '数据加载完成',
        icon: "none"
      })
      this.setData({
        loading: false
      })
      return
    }
    var that = this
    if (this.data.page == 0) {
      this.data.datas = [];
    }
    //Collection.skip / Query.skip指定查询返回结果时从指定序列后的结果开始返回，常用语分页
    var datas = db.collection('product').skip(
      this.data.page * this.data.MAX_LIMIT
      //Collection.limit / Query.limit指定查询结果集数量上限
    ).limit(this.data.MAX_LIMIT).where({
      //从基础库 2.3.2 开始（wx-server-sdk 从 0.0.23 开始），数据库支持正则表达式查询，开发者可以在查询语句中使用           //JavaScript 原生正则对象或使用 db.RegExp 方法来构造正则对象然后进行字符串匹配。在查询条件中对一个字段进行正则匹       //配即要求该字段的值可以被给定的正则表达式匹配，注意正则表达式不可用于 db.command 内（如 db.command.in）。
      name: db.RegExp({
        regexp: that.data.searchTxt,
      })
    }).get({
      success: function(res) {
        console.log(res)
        console.log(that.data.datas.length)
        if (res.data.length == 0 && that.data.datas.length == 0) {
          that.setData({
            isShow: false,
            loading: false
          })
        } else {
          that.data.page = that.data.page + 1;
          for (var i = 0; i < res.data.length; i++) {
            that.data.datas.push(res.data[i])
          }
          that.setData({
            datas: that.data.datas,
            isShow: true,
            loading: false
          })
        }
      },
      fail: function(res) {
        if (that.data.datas.length == 0) {
          that.setData({
            isShow: false,
            loading: false
          })
        }
        wx.showToast({
          title: '数据加载失败',
          icon: "none"
        })
      }
    })
  },
  onClick: function(event) {
    var index = event.currentTarget.dataset.index
    var logoImg = ""
    var garbageContent1 = ""
    var detailContent1 = ""
    switch (parseInt(index)) {
      case 1:
        logoImg = "/images/Icon_03.jpg"
        garbageContent1 = "可回收物"
        detailContent1 = "可回收物就是可以再生循环的垃圾,本身或材质可再利用的纸类、硬纸板、玻璃、塑料、金属、塑料包装，与这些材质有关的如：报纸、杂志、广告单及其它干净的纸类等皆可回收。"
        break;
      case 2:
        logoImg = "/images/Icon_05.jpg"
        garbageContent1 = "有害垃圾"
        detailContent1 = "有害垃圾指废电池、废灯管、废药品、废油漆及其容器等对人体健康或者自然环境造成直接或者潜在危害的生活废弃物。常见包括废电池、废荧光灯管、废灯泡、废水银温度计、废油漆桶、过期药品等。有害有毒垃圾需特殊正确的方法安全处理。"
        break;
      case 3:
        logoImg = "/images/Icon_09.jpg"
        garbageContent1 = "湿垃圾"
        detailContent1 = "湿垃圾又称为厨余垃圾、有机垃圾，即易腐垃圾，指食材废料、剩菜剩饭、过期食品、瓜皮果核、花卉绿植、中药药渣等易腐的生物质生活废弃物。"
        break;
      case 4:
        logoImg = "/images/Icon_10.jpg"
        garbageContent1 = "干垃圾"
        detailContent1 = "其他垃圾包括砖瓦陶瓷、渣土、卫生间废纸、瓷器碎片等难以回收的废弃物，采取卫生填埋可有效减少对地下水、地表水、土壤及空气的污染，在当今社会，还无有效化解其他垃圾的好方法，所以需尽量少产生。"
        break;
    }
    this.setData({
      logo: logoImg,
      garbageContent: garbageContent1,
      detailContent: detailContent1,
      dialogModalShow: true
    })
  },
  /**
   * 隐藏弹出窗
   */
  hideModal: function() {
    this.setData({
      dialogModalShow: !this.data.dialogModalShow
    })
  },
  /**
   * 下拉刷新PullDownRefresh
   */
  onPullDownRefresh: function() {
    this.data.page = 0
    this.data.datas = []
    this.onGetData()
  },
  /**
   * 上拉触底事件onReachBottom
   */
  onReachBottom: function() {
    this.onGetData()
  },
  /**
   * 返回首页
   */
  toStart: function() {
    //首页被tabBar所包含的页面必须使用wx.switchTab来跳转
    wx.switchTab({
      url: '../../sort/sort',
      fail: function(res) {
        wx.showToast({
          title: '跳转页面失败',
          icon: "none"
        })
      }
    })
  },
  /**
   * 返回拍照页面
   */
  toCamera: function() {
    wx.navigateTo({
      url: '../camera/camera',
      fail: function(res) {
        wx.showToast({
          title: '跳转页面失败',
          icon: "none"
        })
      }
    })
  }
})