// 环境配置
const env = {
  dev: {
    apiDomain: 'http://localhost:8585',  // 开发环境
  },
  prod: {
    apiDomain: 'https://pen.okeeper.com',  // 生产环境
  }
}

// 当前环境
const currentEnv = 'prod'  // 这里可以根据需要切换 'dev' 或 'prod'

// 导出配置
export const config = {
  apiDomain: env[currentEnv].apiDomain,
  
  // API 路径
  apis: {
    getToken: '/getToken',
    uploadImage: '/wiseeye/uploadImage',
    recognize: '/wiseeye/shibie'
  }
} 