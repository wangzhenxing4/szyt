// 应用全局配置
module.exports = {
	// baseUrl: 'http://10.5.105.36:8080',
	// baseUrl: 'http://192.168.1.10:8080',
	// baseUrl: 'http://127.0.0.1:8080',
	
	// 后端接口地址
	baseUrl: 'https://szythd.wangzhenxing.cn',
	// 轮播图地址
	imageBaseUrl: 'http://47.96.64.183/szyt/img/banner/',
	// 学工系统地址
	XGXT: 'https://xgphone.sxzy.edu.cn/#/homeNew',
	// 健康打卡地址
	HEALTH_CHECK: 'http://fdcatss.cn365vip.com/menu/',

	// 应用信息
	appInfo: {
		// 应用名称
		name: "山职云台",
		// 应用版本
		version: "1.0.0",
		// 应用logo
		logo: "/static/logo.png",
		// 官方网站
		site_url: "https://www.sxzy.edu.cn/",
		// 开发人员
		dev_url: "http://wangzhenxing.cn",
		// 政策协议
		agreements: [{
				title: "隐私政策",
				url: "http://szyt.wangzhenxing.cn/PrivacyPolicy/PrivacyPolicy.html"
			},
			{
				title: "用户服务协议",
				url: "http://szyt.wangzhenxing.cn/TermsofService/TermsofService.html"
			}
		]
	}
}