// miniprogram/pages/sort/voice/voice.js
const recorderManager = wx.getRecorderManager();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isStop:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /** 录音开始 */
  clickSay: function (e, that){
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 64000,
      format: 'mp3',
      frameSize: 50
    }
    recorderManager.start(options);
  },
  /** 语音识别 */
  speechRecognition(that, res) {
    console.log("语音识别");
    wx.uploadFile({
      url: API_URL,
      filePath: res.tempFilePath,
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: function (res) {
        console.log(res); console.log(res.data);
      },
      fail: function () {
        console.log("语音识别失败");
      }
    })
  },
  /**停止录音 */
  clickStop:function(){
    recorderManager.stop();
  }
})