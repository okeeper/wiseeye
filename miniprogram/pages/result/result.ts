interface ICharacteristic {
  type: string
  feature: string
}

interface IResultData {
  result: {
    name: string
    description: string
    introduction: string
    characteristics: ICharacteristic[]
    topics: string[]
    wiki: string
    imageUrl: string
  } | null
}

interface IResultMethods {
  previewImage: () => void
  copyWikiLink: () => void
}

Page<IResultData, IResultMethods>({
  data: {
    result: null
  },

  onLoad(options) {
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data))
        if (data.success && data.data) {
          this.setData({
            result: {
              ...data.data,
              imageUrl: data.data.imageUrl
            }
          })
        } else {
          this.showError(data.error || '识别失败')
        }
      } catch (err) {
        this.showError('数据解析失败')
      }
    }
  },

  // 预览图片
  previewImage() {
    const imageUrl = this.data.result?.imageUrl
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

  // 复制百科链接
  copyWikiLink() {
    const url = this.data.result?.wiki
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success',
            duration: 2000
          })
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'error'
          })
        }
      })
    } else {
      wx.showToast({
        title: '链接不存在',
        icon: 'error'
      })
    }
  },

  // 显示错误信息
  showError(message: string) {
    wx.showToast({
      title: message,
      icon: 'error'
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
}) 