<!-- pages/work/ttdk/ttdk.vue -->
<template>
	<view>
		<!-- 修正：移除了组件名称中的空格 -->
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// url: 'http://fdcatss.cn365vip.com/menu/' // 固定页面
				url: ''
			}
		},
		onLoad(options) {
			this.url = decodeURIComponent(options.url);
		}
	}
</script>