<template>
	<view class="app-container">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-row">
				<input class="search-input" placeholder="搜索角色名称" v-model="queryParams.roleName"
					@confirm="handleQuery" />
			</view>
			<view class="search-row">
				<input class="search-input" placeholder="搜索角色编码" v-model="queryParams.roleKey" @confirm="handleQuery" />
			</view>

			<button class="search-btn" @tap="handleQuery">搜索</button>
			<button class="search-btn reset" @tap="resetQuery">重置</button>
		</view>

		<!-- 操作按钮栏 -->
		<scroll-view class="action-bar" scroll-x="true">
			<view class="action-btn primary" @tap="handleAdd">
				<view class="action-icon">+</view>
				<view class="action-btn-text">新增</view>
			</view>
			<!--  <view class="action-btn" @tap="handleExport">
        <view class="action-icon">↓</view>
        <view class="action-btn-text">导出</view>
      </view>
      <view class="action-btn warning" @tap="handleImport">
        <view class="action-icon">↑</view>
        <view class="action-btn-text">导入</view>
      </view> -->
			<view class="action-btn danger" @tap="handleDeleteMultiple">
				<view class="action-icon">×</view>
				<view class="action-btn-text">删除</view>
			</view>
		</scroll-view>

		<!-- 角色列表 -->
		<view class="user-list">
			<view class="user-header">
				<view>角色信息</view>
				<view>状态</view>
			</view>

			<block v-for="(role, index) in roleList" :key="role.roleId">
				<view class="user-item">
					<view class="user-info">
						<view>
							<view class="user-name">{{ role.roleName }}</view>
							<view class="user-id">编码: {{ role.roleKey }}</view>
						</view>
						<view class="switch" :class="{active: role.status === '0'}"
							@tap="toggleRoleStatus(role, index)"></view>
					</view>

					<view class="user-details">
						<view class="user-detail">
							<view class="detail-label">描述：</view>
							<view>{{ role.remark || '无' }}</view>
						</view>
						<view class="user-detail">
							<view class="detail-label">创建时间：</view>
							<view>{{ formatDate(role.createTime) }}</view>
						</view>
					</view>

					<view class="user-actions">
						<view class="action-icon edit" @tap="handleUpdate(role)">
							<text>编辑</text>
						</view>
						<view class="action-icon delete" @tap="handleDelete(role)">
							<text>删除</text>
						</view>
						<view class="action-icon more" @tap="handleMore(role)">
							<text>更多</text>
						</view>
					</view>
				</view>
			</block>

			<view v-if="roleList.length === 0" class="empty">
				<view>暂无角色数据</view>
			</view>
		</view>

		<!-- 分页组件 -->
		<uni-pagination class="pagination" :current="queryParams.pageNum" :total="total"
			:pageSize="queryParams.pageSize" @change="handlePageChange" />

		<!-- 添加/编辑角色模态框 -->
		<uni-popup ref="popup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">{{ title }}</view>
				<view class="form-group">
					<view class="form-label">角色名称</view>
					<input class="form-input" v-model="form.roleName" placeholder="请输入角色名称" />
				</view>
				<view class="form-group">
					<view class="form-label">角色编码</view>
					<input class="form-input" v-model="form.roleKey" placeholder="请输入角色编码" />
				</view>
				<view class="form-group">
					<view class="form-label">显示顺序</view>
					<input class="form-input" v-model="form.roleSort" placeholder="请输入显示顺序 (1-32767)" type="digit"
						@input="handleRoleSortInput" />
					<view class="error-tip" v-if="roleSortError">{{ roleSortError }}</view>
				</view>

				<view class="form-group">
					<view class="form-label">角色状态</view>
					<switch class="form-switch" :checked="form.status === '0'" @change="onStatusSwitch" />
				</view>
				<view class="form-group">
					<view class="form-label">角色描述</view>
					<textarea class="form-textarea" v-model="form.remark" placeholder="请输入角色描述"
						maxlength="500"></textarea>
				</view>
				<!-- <view class="form-group">
            <view class="form-label">选择部门</view>
            <view class="dept-tree-select" @tap="selectDeptTree">
              <view class="dept-tree-text">{{ form.deptName || '请选择部门' }}</view>
              <view class="picker-arrow">▼</view>
            </view>
          </view> -->

				<view class="popup-footer">
					<button class="dialog-btn" @tap="cancelPopup">取消</button>
					<button class="dialog-btn primary" @tap="submitForm">确定</button>
				</view>
			</view>
		</uni-popup>

		<!-- 分配用户弹出框 -->
		<uni-popup ref="authUserPopup" type="full">
			<view class="auth-user-popup">
				<view class="popup-header" v-if="currentRole">
					<view>{{ currentRole.roleName }} - 分配用户</view>
					<view class="close-btn" @tap="closeAuthUserPopup">×</view>
				</view>

				<view class="auth-search">
					<input class="auth-search-input" placeholder="搜索用户" v-model="authQuery.userName"
						@confirm="handleAuthQuery" />
				</view>

				<view class="auth-tabs">
					<view class="auth-tab" :class="{ active: activeTab === 'allocated' }" @tap="switchTab('allocated')">
						已分配用户</view>
					<view class="auth-tab" :class="{ active: activeTab === 'unallocated' }"
						@tap="switchTab('unallocated')">未分配用户</view>
				</view>

				<view class="auth-user-list">
					<view v-if="activeTab === 'allocated'">
						<view v-for="(user, index) in allocatedUsers" :key="user.userId" class="auth-user-item">
							<view class="user-info">
								<view class="user-name">{{ user.nickName || user.userName }}</view>
								<view class="user-id">ID: {{ user.userId }}</view>
							</view>
							<view class="action-icon delete" @tap="cancelAuthUser(user)">
								<text>取消分配</text>
							</view>
						</view>
						<view v-if="allocatedUsers.length === 0" class="empty">暂无已分配用户</view>
					</view>

					<view v-if="activeTab === 'unallocated'">
						<view v-for="(user, index) in unallocatedUsers" :key="user.userId" class="auth-user-item"
							@tap="selectAuthUser(user)">
							<view class="user-info">
								<view class="user-name">{{ user.nickName || user.userName }}</view>
								<view class="user-id">ID: {{ user.userId }}</view>
							</view>
							<view class="select-checkbox" :class="{checked: selectedAuthUsers.includes(user.userId)}">
							</view>
						</view>
						<view v-if="unallocatedUsers.length === 0" class="empty">暂无未分配用户</view>
					</view>
				</view>

				<view v-if="activeTab === 'unallocated' && selectedAuthUsers.length > 0" class="auth-confirm-btn">
					<button class="dialog-btn primary" @tap="confirmAuthUser">确认分配</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		listRole,
		getRole,
		addRole,
		updateRole,
		delRole,
		changeRoleStatus,
		allocatedUserList,
		unallocatedUserList,
		authUserCancel,
		authUserCancelAll,
		authUserSelectAll
	} from '@/api/system/role';

	export default {
		data() {
			return {
				roleSortError: '', // 显示顺序错误提示
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					roleName: undefined,
					roleKey: undefined,
					status: undefined
				},
				// 角色列表数据
				roleList: [],
				total: 0,
				// 加载状态
				loading: false,
				// 筛选选项
				statusOptions: ['全部', '启用', '禁用'],
				statusIndex: 0,
				// 表单数据
				form: {
					roleName: '',
					roleKey: '',
					roleSort: '1', // 使用字符串类型更安全
					status: '0',
					remark: '',
					menuIds: [],
					deptCheckStrictly: true
				},
				title: '添加角色',
				// 选中的角色ID数组
				selectedRoleIds: [],
				// 分配用户相关
				currentRole: null,
				activeTab: 'allocated',
				authQuery: {
					userName: '',
					pageNum: 1,
					pageSize: 10
				},
				allocatedUsers: [],
				unallocatedUsers: [],
				selectedAuthUsers: []
			}
		},
		onLoad() {
			this.getList();
		},
		methods: {
			// 处理显示顺序输入
			handleRoleSortInput(e) {
				let value = e.detail.value;

				// 清空错误提示
				this.roleSortError = '';

				// 允许空值（由表单验证处理）
				if (value === '') {
					this.form.roleSort = '';
					return;
				}

				// 过滤非数字字符
				value = value.replace(/[^\d]/g, '');

				// 限制最大值
				if (parseInt(value) > 32767) {
					value = '32767';
					this.roleSortError = '显示顺序不能超过32767';
				}

				// 限制最小值
				if (value === '0') {
					value = '1';
					this.roleSortError = '显示顺序不能小于1';
				}

				this.form.roleSort = value;
			},

			// 分页变化
			handlePageChange(e) {
				this.queryParams.pageNum = e.current;
				this.getList();
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			},

			// 获取角色列表
			async getList() {
				this.loading = true;
				try {
					const res = await listRole(this.queryParams);
					if (res.code === 200) {
						this.roleList = res.rows;
						this.total = res.total;
					} else {
						uni.showToast({
							title: `获取数据失败：${res.msg}`,
							icon: 'none'
						});
					}
				} finally {
					this.loading = false;
				}
			},

			// 搜索按钮
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getList();
			},

			// 重置按钮
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 10,
					roleName: undefined,
					roleKey: undefined,
					status: undefined
				};
				this.statusIndex = 0;
				this.getList();
			},

			// 状态筛选变化
			statusChange(e) {
				this.statusIndex = e.detail.value;
				if (this.statusIndex === 0) {
					this.queryParams.status = undefined;
				} else {
					this.queryParams.status = this.statusIndex - 1;
				}
				this.handleQuery();
			},

			// 切换角色状态
			async toggleRoleStatus(role, index) {
				const newStatus = role.status === '0' ? '1' : '0';
				uni.showModal({
					title: '提示',
					content: `确定要${newStatus === '0' ? '启用' : '禁用'}该角色吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await changeRoleStatus(role.roleId, newStatus);
								this.roleList[index].status = newStatus;
								uni.showToast({
									title: '状态已更新',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '状态更新失败',
									icon: 'none'
								});
								// 恢复原状态
								this.roleList[index].status = role.status;
							}
						}
					}
				});
			},

			// 打开添加角色弹窗
			handleAdd() {
				this.title = '添加角色';
				this.form = {
					roleName: '',
					roleKey: '',
					roleSort: '1',
					status: '0',
					remark: '',
					menuIds: [],
					deptCheckStrictly: true
				};
				this.roleSortError = '';
				this.$refs.popup.open();
			},

			// 打开编辑角色弹窗
			async handleUpdate(role) {
				try {
					const res = await getRole(role.roleId);
					if (res.code === 200) {
						this.title = '编辑角色';
						this.form = {
							roleId: res.data.roleId,
							roleName: res.data.roleName,
							roleKey: res.data.roleKey,
							roleSort: res.data.roleSort ? String(res.data.roleSort) : 1, // 确保为字符串
							status: res.data.status || '0',
							remark: res.data.remark || '',
							menuIds: res.data.menuIds || [],
							deptCheckStrictly: res.data.deptCheckStrictly !== undefined ? res.data
								.deptCheckStrictly : true
						};
						this.roleSortError = '';
						this.$refs.popup.open();
					} else {
						uni.showToast({
							title: res.msg || '获取角色信息失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取角色信息失败',
						icon: 'none'
					});
				}
			},

			// 删除单个角色
			async handleDelete(role) {
				uni.showModal({
					title: '提示',
					content: `确定要删除角色"${role.roleName}"吗？该操作不可恢复。`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await delRole(role.roleId);
								this.roleList = this.roleList.filter(r => r.roleId !== role.roleId);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 删除多个角色
			async handleDeleteMultiple() {
				if (this.selectedRoleIds.length === 0) {
					uni.showToast({
						title: '请先选择要删除的角色',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '提示',
					content: `确定要删除选中的${this.selectedRoleIds.length}个角色吗？这些操作不可恢复。`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const deletePromises = this.selectedRoleIds.map(roleId => delRole(roleId));
								await Promise.all(deletePromises);
								this.getList();
								this.selectedRoleIds = [];
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 导出按钮操作
			handleExport() {
				uni.showLoading({
					title: '导出中...'
				});
				// 这里应该调用导出API
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '导出成功',
						icon: 'success'
					});
				}, 1500);
			},

			// 导入按钮操作
			handleImport() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						console.log('选择文件成功', res);
						uni.showLoading({
							title: '导入中...'
						});
						// 这里应该调用导入API
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '导入成功',
								icon: 'success'
							});
							this.getList();
						}, 2000);
					}
				});
			},

			// 更多操作
			handleMore(role) {
				uni.showActionSheet({
					itemList: ['分配用户', '数据权限', '查看详情'],
					success: (res) => {
						const actionIndex = res.tapIndex;
						if (actionIndex === 0) {
							// this.openAuthUserPopup(role);
							uni.showToast({
								title: '数据权限功能开发中',
								icon: 'none'
							});
						} else if (actionIndex === 1) {
							uni.showToast({
								title: '数据权限功能开发中',
								icon: 'none'
							});
						} else if (actionIndex === 2) {
							uni.showToast({
								title: '查看详情功能开发中',
								icon: 'none'
							});
						}
					}
				});
			},

			// 打开分配用户弹窗
			openAuthUserPopup(role) {
				this.currentRole = role;
				this.activeTab = 'allocated';
				this.authQuery.pageNum = 1;
				this.authQuery.roleId = role.roleId;
				this.loadAuthUsers();
				this.$refs.authUserPopup.open();
			},

			// 关闭分配用户弹窗
			closeAuthUserPopup() {
				this.$refs.authUserPopup.close();
				this.currentRole = null;
				this.selectedAuthUsers = [];
			},

			// 切换分配用户标签页
			switchTab(tab) {
				this.activeTab = tab;
				if (tab === 'allocated') {
					this.loadAllocatedUsers();
				} else {
					this.loadUnallocatedUsers();
				}
			},

			// 搜索分配用户
			handleAuthQuery() {
				this.authQuery.pageNum = 1;
				if (this.activeTab === 'allocated') {
					this.loadAllocatedUsers();
				} else {
					this.loadUnallocatedUsers();
				}
			},

			// 加载已分配用户
			async loadAllocatedUsers() {
				try {
					if (!this.currentRole) return;

					const res = await allocatedUserList({
						...this.authQuery,
						roleId: this.currentRole.roleId
					});
					if (res.code === 200) {
						this.allocatedUsers = res.rows;
					} else {
						uni.showToast({
							title: res.msg || '获取已分配用户失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取已分配用户失败',
						icon: 'none'
					});
				}
			},

			// 加载未分配用户
			async loadUnallocatedUsers() {
				try {
					if (!this.currentRole) return;

					const res = await unallocatedUserList({
						...this.authQuery,
						roleId: this.currentRole.roleId
					});
					if (res.code === 200) {
						this.unallocatedUsers = res.rows;
					} else {
						uni.showToast({
							title: res.msg || '获取未分配用户失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取未分配用户失败',
						icon: 'none'
					});
				}
			},

			// 加载分配用户数据
			loadAuthUsers() {
				this.loadAllocatedUsers();
				this.loadUnallocatedUsers();
			},

			// 选择分配用户
			selectAuthUser(user) {
				const index = this.selectedAuthUsers.indexOf(user.userId);
				if (index === -1) {
					this.selectedAuthUsers.push(user.userId);
				} else {
					this.selectedAuthUsers.splice(index, 1);
				}
			},

			// 取消分配用户
			async cancelAuthUser(user) {
				if (!this.currentRole) return;

				uni.showModal({
					title: '提示',
					content: `确定要取消用户"${user.nickName || user.userName}"的角色分配吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await authUserCancel({
									roleId: this.currentRole.roleId,
									userId: user.userId
								});
								this.loadAllocatedUsers();
								this.loadUnallocatedUsers();
								uni.showToast({
									title: '取消分配成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '取消分配失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 确认分配用户
			async confirmAuthUser() {
				if (!this.currentRole) return;

				if (this.selectedAuthUsers.length === 0) {
					uni.showToast({
						title: '请先选择要分配的用户',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '提示',
					content: `确定要将选中的${this.selectedAuthUsers.length}个用户分配给角色"${this.currentRole.roleName}"吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await authUserSelectAll({
									roleId: this.currentRole.roleId,
									userIds: this.selectedAuthUsers.join(',')
								});
								this.closeAuthUserPopup();
								uni.showToast({
									title: '分配用户成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '分配用户失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 状态切换
			onStatusSwitch(e) {
				this.form.status = e.detail.value ? '0' : '1';
			},

			// 提交表单方法 - 确保提交数据格式正确
			async submitForm() {
				// 表单验证
				if (!this.validateForm()) return;

				try {
					let res;
					// 准备提交数据，只包含API需要的字段
					const submitData = {
						roleId: this.form.roleId,
						roleName: this.form.roleName,
						roleKey: this.form.roleKey,
						roleSort: this.form.roleSort,
						status: this.form.status,
						remark: this.form.remark,
						menuIds: this.form.menuIds,
						deptCheckStrictly: this.form.deptCheckStrictly
					};

					if (this.form.roleId) {
						// 编辑角色
						res = await updateRole(submitData);
					} else {
						// 新增角色
						res = await addRole(submitData);
					}

					if (res.code === 200) {
						this.$refs.popup.close();
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						this.getList();
					} else {
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
					console.error('保存角色失败', e);
				}
			},

			// 表单验证 - 调整字段名
			validateForm() {
				if (!this.form.roleName) {
					uni.showToast({
						title: '角色名称不能为空',
						icon: 'none'
					});
					return false;
				}

				if (!this.form.roleKey) {
					uni.showToast({
						title: '角色编码不能为空',
						icon: 'none'
					});
					return false;
				}

				if (this.form.roleSort === '') {
					uni.showToast({
						title: '显示顺序不能为空',
						icon: 'none'
					});
					return false;
				}

				const roleSort = parseInt(this.form.roleSort);

				if (roleSort < 1 || roleSort > 32767) {
					uni.showToast({
						title: '显示顺序必须在1-32767之间',
						icon: 'none'
					});
					return false;
				}

				if (!/^[a-zA-Z0-9_]+$/.test(this.form.roleKey)) {
					uni.showToast({
						title: '角色编码只能包含字母、数字和下划线',
						icon: 'none'
					});
					return false;
				}

				return true;
			},

			// 关闭弹窗
			cancelPopup() {
				this.$refs.popup.close();
			},

			// 格式化日期
			formatDate(dateString) {
				if (!dateString) return '';
				const date = new Date(dateString);
				return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			},

			// 选择用户
			selectRole(roleId) {
				const index = this.selectedRoleIds.indexOf(roleId);
				if (index === -1) {
					this.selectedRoleIds.push(roleId);
				} else {
					this.selectedRoleIds.splice(index, 1);
				}
			},

			// 选择部门树（简化处理，实际应实现部门树选择功能）
			selectDeptTree() {
				uni.showToast({
					title: '部门选择功能开发中',
					icon: 'none'
				});
			}
		}
	}
</script>

<style scoped lang="scss">
/* 引入公共SCSS */
@import '@/static/scss/common.scss';

/* 页面特有样式 */
.error-tip {
  color: #F56C6C;
  font-size: 12px;
  margin-top: 4px;
}
</style>