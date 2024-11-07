/// <reference path="../node_modules/miniprogram-api-typings/index.d.ts" />

// 声明 wx 命名空间
declare namespace WechatMiniprogram {
  // ... 其他类型定义
}

// 声明全局变量
declare const wx: WechatMiniprogram.Wx
declare const Page: WechatMiniprogram.Page.Constructor
declare const getApp: WechatMiniprogram.GetApp
declare const getCurrentPages: WechatMiniprogram.GetCurrentPages 