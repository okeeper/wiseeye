// index.ts
import { config } from '../../config/index'

interface IIndexData {
  userInfo?: WechatMiniprogram.UserInfo,
  hasUserInfo: boolean,
  token: string
}

interface IIndexMethods {
  getToken: () => Promise<string>
  uploadImage: (filePath: string) => Promise<string>
  recognizeImage: (imageUrl: string) => Promise<any>
  processImage: (tempFilePath: string) => void
}

Page<IIndexData, IIndexMethods>({
  data: {
    userInfo: undefined,
    hasUserInfo: false,
    token: ''  // 存储token
  },

  onLoad() {
    // 页面加载时获取token
    this.getToken()
  },

  // 获取token
  async getToken() {
    try {
      // 同步调用登录接口
      const loginRes = await wx.login()
      if (!loginRes.code) {
        throw new Error('微信登录失败')
      }
      const jsCode = loginRes.code

      // 使用登录凭证获取token
      const res = await new Promise<any>((resolve, reject) => {
        wx.request({
          url: `${config.apiDomain}${config.apis.getToken}` + "?code="+jsCode,
          method: 'POST',
          success: resolve,
          fail: reject
        })
      })
      
      console.info("获取token响应:", JSON.stringify(res))
      if (res.statusCode === 200 && res.data && res.data.success) {
        this.setData({ token: res.data.data })
        return res.data.data
      } else {
        throw new Error(res.data?.message || '获取token失败')
      }
    } catch (err) {
      console.error('获取token失败:', err)
      wx.showToast({
        title: '系统错误',
        icon: 'error'
      })
      return ''
    }
  },

  // 上传图片
  async uploadImage(filePath: string): Promise<string> {
    try {
      console.log('开始上传图片, filePath:', filePath)
      console.log('当前token:', this.data.token)

      const uploadRes = await new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>((resolve, reject) => {
        wx.uploadFile({
          url: `${config.apiDomain}${config.apis.uploadImage}`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': this.data.token
          },
          success: resolve,
          fail: (error) => {
            console.error('上传请求失败:', error)
            reject(error)
          }
        })
      })

      console.log('上传响应原始数据:', uploadRes)
      
      // uploadFile 返回的 data 是字符串
      const responseData = uploadRes.data
      console.log('响应数据(string):', responseData)
      
      try {
        // 解析响应数据
        const res = JSON.parse(responseData)
        console.log('解析后的响应数据(object):', res)
        
        if (res.success && res.data) {
          console.log('上传成功，返回URL:', res.data)
          return res.data  // 返回图片URL
        } else {
          throw new Error(res.msg || '上传失败')
        }
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError)
        console.log('原始响应数据:', responseData)
        throw new Error('解析响应数据失败')
      }
    } catch (err) {
      console.error('上传图片失败:', err)
      wx.showToast({
        title: err.message || '上传失败',
        icon: 'error'
      })
      throw err
    }
  },

  // 识别图片
  async recognizeImage(imageUrl: string) {
    try {
      console.log('开始识别图片, imageUrl:', imageUrl)
      console.log('当前token:', this.data.token)

      const res = await new Promise<any>((resolve, reject) => {
        wx.request({
          url: `${config.apiDomain}${config.apis.recognize}`,
          method: 'POST',
          data: {
            imageUrl: imageUrl
          },
          header: {
            'Authorization': this.data.token,
            'content-type': 'application/json'
          },
          success: (res) => {
            console.log('识别响应原始数据:', res)
            resolve(res)
          },
          fail: (error) => {
            console.error('识别请求失败:', error)
            reject(error)
          }
        })
      })

      console.log('识别响应数据:', res)
      
      if (res.statusCode === 200 && res.data) {
        console.log('识别成功，响应数据:', res.data)
        
        if (res.data.success) {
          // 从返回文本中提取 JSON 代码块
          const markdownText = res.data.data
          console.log('markdown文本:', markdownText)

          // 修改正则表达式，同时匹配 ```json 和 ``` 开头的代码块
          const jsonMatch = markdownText.match(/```(?:json)?\n([\s\S]*?)```/)
          if (jsonMatch && jsonMatch[1]) {
            const jsonStr = jsonMatch[1].trim()
            console.log('提取的JSON字符串:', jsonStr)

            try {
              const markdownJson = JSON.parse(jsonStr)
              if (Object.keys(markdownJson).length === 0) {
                // 返回空结果表示识别失败
                return null
              }
              console.log('解析后的JSON对象:', markdownJson)

              // 构造结果对象
              const result = {
                success: true,
                data: markdownJson
              }

              console.log('构造的结果对象:', result)
              return result

            } catch (parseError) {
              console.error('解析JSON失败:', parseError)
              return null
            }
          } else {
            console.error('未找到JSON代码块')
            return null
          }
        } else {
          throw new Error(res.data.msg || '识别失败')
        }
      } else {
        throw new Error('识别请求失败')
      }
    } catch (err) {
      console.error('识别图片失败:', err)
      throw err
    }
  },

  // 处理图片
  async processImage(tempFilePath: string) {
    wx.showLoading({
      title: '识别中...',
      mask: true
    })
    
    const timeout = 30000
    let timeoutId: NodeJS.Timeout

    try {
      if (!this.data.token) {
        await this.getToken()
      }
      
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('识别超时，请重试'))
        }, timeout)
      })

      const recognitionPromise = (async () => {
        const imageUrl = await this.uploadImage(tempFilePath)
        const recognitionResult = await this.recognizeImage(imageUrl)
        
        // 判断识别结果
        if (!recognitionResult) {
          console.log('识别失败，跳转到失败页面')
          // 先清除超时定时器
          clearTimeout(timeoutId)
          // 隐藏加载提示
          wx.hideLoading()
          // 跳转到失败页面，使用本地临时文件路径
          return wx.navigateTo({
            url: '/pages/recognition-failed/recognition-failed?imageUrl=' + encodeURIComponent(tempFilePath),
            fail: (err) => {
              console.error('跳转失败页面失败:', err)
              wx.showToast({
                title: '跳转失败',
                icon: 'error'
              })
            }
          })
        }
        
        // 在结果中添加图片路径
        return {
          ...recognitionResult,
          data: {
            ...recognitionResult.data,
            imageUrl: tempFilePath  // 使用本地图片路径
          }
        }
      })()

      const result = await Promise.race([
        recognitionPromise,
        timeoutPromise
      ])

      clearTimeout(timeoutId)
      wx.hideLoading()
      
      if (result) {
        console.log('识别成功，准备跳转到结果页面')
        // 识别成功，跳转到结果页面
        return wx.navigateTo({
          url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(result)),
          fail: (err) => {
            console.error('跳转结果页面失败:', err)
            wx.showToast({
              title: '跳转失败',
              icon: 'error'
            })
          }
        })
      }

    } catch (err) {
      clearTimeout(timeoutId)
      wx.hideLoading()
      
      if (err.message === '识别超时，请重试') {
        wx.showModal({
          title: '提示',
          content: '识别时间较长，请稍后重试',
          showCancel: true,
          cancelText: '取消',
          confirmText: '重试',
          success: (res) => {
            if (res.confirm) {
              this.processImage(tempFilePath)
            }
          }
        })
      } else {
        wx.showToast({
          title: err.message || '识别失败',
          icon: 'error',
          duration: 2000
        })
      }
    }
  },

  // 拍照识别
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.processImage(tempFilePath)
      },
      fail: (err) => {
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.processImage(tempFilePath)
      },
      fail: (err) => {
        wx.showToast({
          title: '选择失败',
          icon: 'error'
        })
      }
    })
  }
})
