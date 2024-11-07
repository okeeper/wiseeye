Page({
  data: {
    url: ''
  },

  onLoad(options) {
    if (options.url) {
      try {
        const url = decodeURIComponent(options.url)
        // 直接设置URL，不再验证域名
        this.setData({ url })
      } catch (err) {
        this.handleError('链接无效')
      }
    } else {
      this.handleError('参数错误')
    }
  },

  // 统一错误处理
  handleError(message: string) {
    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      complete: () => {
        wx.navigateBack()
      }
    })
  },

  // 监听web-view加载错误
  onWebviewError(e: any) {
    console.error('网页加载失败:', e.detail)
    this.handleError('页面加载失败')
  }
}) 