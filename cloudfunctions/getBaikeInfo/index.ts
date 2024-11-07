import * as cloud from 'wx-server-sdk'
import axios from 'axios'
import * as cheerio from 'cheerio'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 百科API配置
const BAIKE_API = {
  search: 'https://baike.baidu.com/api/searchword',
  content: 'https://baike.baidu.com/item/'
}

export const main = async (event: any) => {
  try {
    const { keyword } = event

    // 1. 搜索词条
    const searchResponse = await axios.get(BAIKE_API.search, {
      params: { word: keyword },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!searchResponse.data.length) {
      return {
        success: false,
        message: '未找到相关词条'
      }
    }

    // 2. 获取词条内容
    const lemmaUrl = BAIKE_API.content + encodeURIComponent(keyword)
    const contentResponse = await axios.get(lemmaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    // 3. 解析HTML内容
    const $ = cheerio.load(contentResponse.data)
    
    // 提取摘要
    const summary = $('.lemma-summary').text().trim()
    
    // 提取图片
    const images = $('.summary-pic img, .picture img').map((_, img) => {
      let src = $(img).attr('src') || ''
      if (src.startsWith('//')) {
        src = 'https:' + src
      } else if (src.startsWith('/')) {
        src = 'https://baike.baidu.com' + src
      }
      return src
    }).get()
    
    // 提取基本信息
    const basicInfo: { [key: string]: string } = {}
    $('.basic-info .basicInfo-block').each((_, block) => {
      const label = $(block).find('.basicInfo-item.name').text().trim()
      const value = $(block).find('.basicInfo-item.value').text().trim()
      if (label && value) {
        basicInfo[label] = value
      }
    })

    return {
      success: true,
      data: {
        summary,
        images,
        basicInfo
      }
    }

  } catch (error) {
    console.error('获取百科数据失败:', error)
    return {
      success: false,
      message: error.message || '获取百科数据失败'
    }
  }
} 