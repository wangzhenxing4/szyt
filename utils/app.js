// src/utils/app.js
/**
 * 应用工具函数
 */

/**
 * 微信小程序检测Referer环境
 * @returns {boolean} 是否在微信小程序环境
 * 原注释：微信小程序判断
 */
export function checkRefererEnvironment() {
  // #ifdef MP-WEIXIN
  return true;
  // #else
  return false;
  // #endif
}

/**
 * 健康打卡跳转（核心修改此处）
 * @param {Function} navigateTo 页面跳转函数
 * @param {Object} config 配置对象，包含健康打卡URL
 * 原注释：
 * 健康打卡跳转（核心修改此处）
 * 判断是否在微信小程序环境
 * 微信小程序环境下执行原逻辑
 */
export function openHealthCheck(navigateTo, config) {
  // 直接调用 checkRefererEnvironment 函数，而不是通过 this
  const isWeChatEnv = checkRefererEnvironment();
  
  if (!isWeChatEnv) {
    uni.showToast({
      title: '此功能仅支持微信小程序',
      icon: 'none'
    });
    return;
  }
  
  // 微信小程序环境下执行原逻辑
  const url = config.HEALTH_CHECK;
  navigateTo({
    url: `/pages/work/SchoolWebsite/SchoolWebsite?url=${encodeURIComponent(url)}`
  });
}

/**
 * 学工系统跳转
 * @param {Function} navigateTo 页面跳转函数
 * @param {string} url 学工系统URL
 * 原注释：学工系统跳转
 */
export function openXgxtSystem(navigateTo, url) {
  // 直接跳转到SchoolWebsite.vue页面，传递URL参数
  navigateTo({
    url: `/pages/work/SchoolWebsite/SchoolWebsite?url=${encodeURIComponent(url)}`
  });
}