interface IFailedData {
  imageUrl: string
}

interface IFailedMethods {
  previewImage: () => void
  retryRecognition: () => void
  backToHome: () => void
}

Page<IFailedData, IFailedMethods>({
  data: {
    imageUrl: ''
  },

  onLoad(options) {
    if (options.imageUrl) {
      this.setData({
        imageUrl: decodeURIComponent(options.imageUrl)
      })
    }
  },

  // 预览图片
  previewImage() {
    const { imageUrl } = this.data
    if (imageUrl) {
      wx.previewImage({
        urls: [imageUrl],
        current: imageUrl,
        fail: (err) => {
          console.error('预览图片失败:', err)
          wx.showToast({
            title: '预览失败',
            icon: 'error'
          })
        }
      })
    }
  },

  // 重新识别
  retryRecognition() {
    // 获取页面栈
    const pages = getCurrentPages()
    // 获取上一页实例
    const prevPage = pages[pages.length - 2]
    
    if (prevPage) {
    // 返回上一页
      wx.navigateBack()
      // 调用上一页的处理图片方法
      prevPage.processImage(this.data.imageUrl)
      
    } else {
      wx.showToast({
        title: '重试失败',
        icon: 'error'
      })
    }
  },

  // 返回首页
  backToHome() {
    wx.navigateBack({
      delta: 2
    })
  }
})