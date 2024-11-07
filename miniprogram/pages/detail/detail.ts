interface IBaikeCard {
  key: string
  name: string 
  value: string[]
  format: string[]
}

interface IBaikeData {
  id: number
  key: string
  title: string
  desc: string
  abstract: string
  image: string
  imageHeight: number
  imageWidth: number
  card: IBaikeCard[]
  catalog: string[]
  url: string
  wapUrl: string
}

interface IWikiData {
  id?: number
  key?: string
  title?: string
  desc?: string
  abstract?: string
  mainImage?: string
  imageHeight?: number
  imageWidth?: number
  basicInfo?: IBaikeCard[]
  taxonomyInfo?: IBaikeCard[]
  distributionInfo?: IBaikeCard[]
  catalog?: string[]
  url?: string
  wapUrl?: string
}

interface IDetailData {
  plantData: {
    name: string
    latinName: string
    family: string
    description: string
    imageUrl: string
  } | null
  wikiData: IWikiData
  showFullAbstract: boolean
}

interface IDetailMethods {
  fetchWikiData: () => void
  previewImage: (event: any) => void
  toggleAbstract: () => void
  copyText: (event: any) => void
  openUrl: (event: any) => void
}

Page<IDetailData, IDetailMethods>({
  data: {
    plantData: null,
    wikiData: {},
    showFullAbstract: false
  },

  onLoad(options) {
    if (options.data) {
      try {
        const plantData = JSON.parse(decodeURIComponent(options.data))
        this.setData({ plantData }, () => {
          this.fetchWikiData()
        })
      } catch (err) {
        console.error('解析数据失败:', err)
        wx.showToast({
          title: '数据解析失败',
          icon: 'error'
        })
      }
    }
  },

  fetchWikiData() {
    if (!this.data.plantData?.name) return

    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: 'https://baike.baidu.com/api/openapi/BaikeLemmaCardApi',
      method: 'GET',
      data: {
        format: 'json',
        appid: '379020',
        bk_key: this.data.plantData.name
      },
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          const baikeData: IBaikeData = res.data
          
          // 分类处理百科卡片信息
          const taxonomyKeys = ['m159_level', 'm159_class3', 'm159_class5', 'm159_class9', 'm159_class11', 'm159_class15', 'm159_class19']
          const distributionKeys = ['m159_areaP', 'm159_customDefault']
          
          const taxonomyInfo = baikeData.card.filter(item => taxonomyKeys.includes(item.key))
          const distributionInfo = baikeData.card.filter(item => distributionKeys.includes(item.key))
          const basicInfo = baikeData.card.filter(item => !taxonomyKeys.includes(item.key) && !distributionKeys.includes(item.key))

          const wikiData: IWikiData = {
            id: baikeData.id,
            key: baikeData.key,
            title: baikeData.title,
            desc: baikeData.desc,
            abstract: baikeData.abstract,
            mainImage: baikeData.image,
            imageHeight: baikeData.imageHeight,
            imageWidth: baikeData.imageWidth,
            basicInfo,
            taxonomyInfo,
            distributionInfo,
            catalog: baikeData.catalog,
            url: baikeData.url,
            wapUrl: baikeData.wapUrl
          }
          
          this.setData({ wikiData })
        } else {
          throw new Error('获取数据失败')
        }
      },
      fail: (err) => {
        console.error('获取百科数据失败:', err)
        wx.showToast({
          title: '获取详情失败',
          icon: 'error'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 预览图片
  previewImage(event: any) {
    const url = event.currentTarget.dataset.url
    const urls = [this.data.wikiData.mainImage || '']

    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 展开/收起摘要
  toggleAbstract() {
    console.log('toggleAbstract called, current state:', this.data.showFullAbstract)
    this.setData({
      showFullAbstract: !this.data.showFullAbstract
    }, () => {
      console.log('new state:', this.data.showFullAbstract)
    })
  },

  // 复制文本
  copyText(event: any) {
    const text = event.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  // 打开链接
  openUrl(event: any) {
    const url = event.currentTarget.dataset.url
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  }
}) 