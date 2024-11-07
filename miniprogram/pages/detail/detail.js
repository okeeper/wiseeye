Page({
  data: {
    plantData: null
  },
  onLoad: function(options) {
    if (options.data) {
      try {
        const plantData = JSON.parse(decodeURIComponent(options.data));
        this.setData({ plantData });
      } catch (err) {
        console.error('解析数据失败:', err);
        wx.showToast({
          title: '数据解析失败',
          icon: 'error'
        });
      }
    }
  }
}); 