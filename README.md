# 需求介绍
这是一个用typescript写的微信小程序，主要功能是通过拍照来识别图片中的物体，包括植物、动物、昆虫、矿物等。
需求如下：
1. 程序的首页是一个拍照按钮，点击后可以调出相机拍照，并调用百度AI的API来识别图片中的物体。按钮的下方也有一个从相册中选择图片的小按钮。参考图片 @1.PNG 
2. 识别成功后，显示识别结果，参考图片 @2.PNG，这是对“绿萝”植物的识别结果，识别结果中包含植物的名称、描述、科属、图片链接等信息。有点击查看详情的按钮。
3. 点击查看详情按钮后，跳转到一个新的页面，显示植物的详细信息，参考图片 @3.PNG，包括植物的名称、描述、科属、图片、与之相关的诗、趣事、寓意、传说等。数据内容可以来源于百科。
4. 点击返回按钮后，返回到首页。

# 技术栈
1. typescript
2. 微信小程序
3. 百度AI

# 项目结构
```
docs/                     # 文档目录,样例图片等
miniprogram/
├── app.json              # 小程序公共设置
├── app.wxss              # 小程序公共样式表
├── app.ts                # 小程序逻辑层入口文件（TypeScript版本）
├── pages/                # 页面文件夹
│   ├── index/            # 首页
│   │   ├── index.json    # 页面配置文件
│   │   ├── index.wxml    # 页面结构层文件
│   │   └── index.wxss    # 页面样式表文件
│   │   └── index.ts      # 页面逻辑层文件（TypeScript版本）
│   ├── logs/              # 日志页面
│   │   ├── logs.json     # 页面配置文件
│   │   ├── logs.wxml     # 页面结构层文件
│   │   └── logs.wxss     # 页面样式表文件
│   │   └── logs.ts       # 页面逻辑层文件（TypeScript版本）
│   └── ...                # 其他页面
├── utils/                 # 工具函数文件夹
│   ├── util.ts           # 工具函数（TypeScript版本）
│   └── ...                # 其他工具函数
├── components/            # 自定义组件文件夹
│   ├── my-component/      # 自定义组件
│   │   ├── my-component.json
│   │   ├── my-component.wxml
│   │   ├── my-component.ts # 自定义组件逻辑层文件（TypeScript版本）
│   │   └── my-component.wxss # 自定义组件样式表文件
│   └── ...                # 其他自定义组件
├── typings/                 # 类型定义文件夹
│   ├── index.d.ts         # 全局类型定义
│   └── types                # 其他类型定义
├── project.config.json    # 项目配置文件
├── tsconfig.json          # TypeScript配置文件
└── package.json           # 项目依赖和脚本配置
```

# 扫码体验

[](./doc/erweima.jpg)

