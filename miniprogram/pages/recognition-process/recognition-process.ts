interface IOptions {
  imageUrl?: string
}

interface IPageData {
  imageUrl: string
  scanProgress: number
  scanLines: number[]
  analyzing: boolean
  currentStep: number
  steps: string[]
}

Page<IPageData>({
  data: {
    imageUrl: '',
    scanProgress: 0,
    scanLines: Array(5).fill(0),
    analyzing: true,
    currentStep: 0,
    steps: [
      '图像预处理',
      '特征提取',
      '模型识别',
      '结果分析'
    ]
  },

  progressInterval: null as any,
  scanInterval: null as any,

  onLoad(options: IOptions) {
    if (options.imageUrl) {
      this.setData({
        imageUrl: decodeURIComponent(options.imageUrl),
        scanLines: Array(5).fill(0).map((_, i) => -20 * (i + 1))
      })
      this.startScanAnimation()
    }
  },

  startScanAnimation() {
    let progress = 0
    const totalTime = 20000 // 20秒
    const interval = 100 // 每100ms更新一次
    const increment = 100 / (totalTime / interval) // 计算每次增加的进度

    this.progressInterval = setInterval(() => {
      let deltaProgress = increment
      if (progress < 20) {
        deltaProgress = increment * 1.5 // 开始阶段快一些
      } else if (progress > 80) {
        deltaProgress = increment * 1.2 // 结束阶段稍快
      } else if (progress > 40 && progress < 60) {
        deltaProgress = increment * 0.7 // 中间阶段慢一些
      }

      progress += deltaProgress
      
      let currentStep = 0
      if (progress >= 15) currentStep = 1
      if (progress >= 45) currentStep = 2
      if (progress >= 75) currentStep = 3
      
      // 将进度取整到个位数
      const roundedProgress = Math.min(Math.floor(progress), 99)
      
      this.setData({
        scanProgress: roundedProgress,
        currentStep
      })

      if (progress >= 99) {
        clearInterval(this.progressInterval)
      }
    }, interval)

    // 扫描线动画
    this.scanInterval = setInterval(() => {
      if (!this.data.analyzing) {
        clearInterval(this.scanInterval)
        return
      }

      const positions = this.data.scanLines.map((pos: number) => {
        pos += 0.8
        if (pos > 120) {
          return -20
        }
        return pos
      })
      
      this.setData({ scanLines: positions })
    }, 16)
  },

  onUnload() {
    this.setData({ analyzing: false })
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
    }
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
    }
  }
}) 