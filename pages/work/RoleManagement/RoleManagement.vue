<template>
  <view class="app-container">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="search-row">
        <view class="input-container">
          <uni-icons type="search" size="18" color="#999" class="search-icon"></uni-icons>
          <input 
            class="search-input" 
            placeholder="搜索角色名称" 
            v-model="queryParams.roleName"
            @confirm="handleQuery"
          />
        </view>
        <view class="input-container">
          <uni-icons type="key" size="18" color="#999" class="search-icon"></uni-icons>
          <input 
            class="search-input" 
            placeholder="搜索角色编码" 
            v-model="queryParams.roleKey"
            @confirm="handleQuery"
          />
        </view>
      </view>
      <view class="button-row">
        <button class="search-btn" @tap="handleQuery">
          <uni-icons type="search" size="16" color="#fff"></uni-icons> 搜索
        </button>
        <button class="search-btn reset" @tap="resetQuery">
          <uni-icons type="refresh" size="16" color="#fff"></uni-icons> 重置
        </button>
      </view>
    </view>
    
    <!-- 操作按钮栏 - 水平排列 -->
    <view class="action-bar-horizontal">
      <view class="action-btn primary" @tap="handleAdd">
        <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        <view class="action-btn-text">新增</view>
      </view>
      <view class="action-btn danger" @tap="handleDeleteMultiple">
        <uni-icons type="trash" size="20" color="#fff"></uni-icons>
        <view class="action-btn-text">删除</view>
      </view>
    </view>
    
    <!-- 角色列表 -->
    <view class="user-list">
      <view v-if="roleList.length === 0" class="empty">
        <image src="/static/images/empty.png" class="empty-img" />
        <view class="empty-text">暂无角色数据</view>
        <button class="empty-btn" @tap="handleAdd">添加角色</button>
      </view>
      
      <block v-else>
        <!-- 状态筛选 -->
		
        <view class="list-header">
			<view class="list-header">
			  <view class="select-all" @tap="toggleSelectAll">
			    <uni-icons 
			      :type="isAllSelected ? 'checkbox-filled' : 'circle'" 
			      size="20" 
			      :color="isAllSelected ? '#1890ff' : '#999'">
			    </uni-icons>
			    <text>全选</text>
			  </view>
			  
			</view>
          <text>共 {{ total }} 个角色</text>
          <view class="status-filter">
            <text 
              :class="{active: statusIndex === 0}" 
              @tap="changeStatus(0)"
            >全部</text>
            <text 
              :class="{active: statusIndex === 1}" 
              @tap="changeStatus(1)"
            >启用</text>
            <text 
              :class="{active: statusIndex === 2}" 
              @tap="changeStatus(2)"
            >禁用</text>
          </view>
        </view>
        
        <block v-for="(role, index) in roleList" :key="role.roleId">
          <view class="user-card" :class="{'card-disabled': role.status === '1'}">
            <view class="user-selector" @tap="selectRole(role.roleId)">
                <uni-icons 
                  :type="selectedRoleIds.includes(role.roleId) ? 'checkbox-filled' : 'circle'" 
                  size="20" 
                  :color="selectedRoleIds.includes(role.roleId) ? '#1890ff' : '#999'">
                </uni-icons>
              </view>
			<view class="card-header">
              <view class="user-avatar">
                <uni-icons type="person" size="40" color="#1890ff"></uni-icons>
              </view>
              <view class="user-info">
                <view class="user-name">{{ role.roleName }}</view>
                <view class="user-id">编码: {{ role.roleKey }}</view>
              </view>
              <view class="status-badge" :class="role.status === '0' ? 'active' : 'inactive'">
                {{ role.status === '0' ? '启用中' : '已禁用' }}
              </view>
            </view>
            
            <view class="card-content">
              <view class="info-row">
                <uni-icons type="info" size="14" color="#666"></uni-icons>
                <text class="info-text">{{ role.remark || '无描述信息' }}</text>
              </view>
              <view class="info-row">
                <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                <text class="info-text">{{ formatDate(role.createTime) }}</text>
              </view>
            </view>
            
            <view class="card-actions">
              <view class="action-btn" @tap="toggleRoleStatus(role, index)">
                <uni-icons :type="role.status === '0' ? 'eye' : 'eye-slash'" size="18" 
                  :color="role.status === '0' ? '#1890ff' : '#ff4d4f'"></uni-icons>
                <text>{{ role.status === '0' ? '禁用' : '启用' }}</text>
              </view>
              <view class="action-btn" @tap="handleUpdate(role)">
                <uni-icons type="compose" size="18" color="#666"></uni-icons>
                <text>编辑</text>
              </view>
              <view class="action-btn" @tap="handleMore(role)">
                <uni-icons type="more" size="18" color="#666"></uni-icons>
                <text>更多</text>
              </view>
            </view>
          </view>
        </block>
      </block>
    </view>
    
    <!-- 分页组件 -->
    <view class="pagination-container" v-if="roleList.length > 0">
      <uni-pagination 
        class="pagination"
        :current="queryParams.pageNum" 
        :total="total" 
        :pageSize="queryParams.pageSize"
        @change="handlePageChange"
        :icon="true"
      />
    </view>
    
    <!-- 添加/编辑角色模态框 -->
    <uni-popup ref="popup" type="center" :mask-click="false" class="custom-popup">
      <view class="popup-card">
        <view class="popup-header">
          <text>{{ title }}</text>
          <uni-icons type="closeempty" size="20" color="#999" @tap="cancelPopup"></uni-icons>
        </view>
        
        <scroll-view scroll-y="true" class="form-container">
          <view class="form-group">
            <text class="form-label">角色名称</text>
            <input 
              class="form-input" 
              v-model="form.roleName" 
              placeholder="请输入角色名称" 
            />
          </view>
          <view class="form-group">
            <text class="form-label">角色编码</text>
            <input 
              class="form-input" 
              v-model="form.roleKey" 
              placeholder="请输入角色编码" 
            />
          </view>
          <view class="form-group">
            <text class="form-label">显示顺序</text>
            <input 
              class="form-input" 
              v-model="form.roleSort" 
              placeholder="请输入显示顺序 (1-32767)" 
              type="digit"
              @input="handleRoleSortInput"
            />
            <view class="error-tip" v-if="roleSortError">{{ roleSortError }}</view>
          </view>
          <view class="form-group switch-group">
            <text class="form-label">状态</text>
            <switch 
              class="form-switch" 
              :checked="form.status === '0'" 
              @change="onStatusSwitch"
              color="#1890ff"
            />
            <text class="switch-label">{{ form.status === '0' ? '启用' : '禁用' }}</text>
          </view>
          <view class="form-group">
            <text class="form-label">角色描述</text>
            <textarea 
              class="form-textarea" 
              v-model="form.remark" 
              placeholder="请输入角色描述"
              maxlength="500"
            ></textarea>
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <button class="dialog-btn" @tap="cancelPopup">取消</button>
          <button class="dialog-btn primary" @tap="submitForm">确定</button>
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
  computed: {
    isAllSelected() {
      return this.selectedRoleIds.length === this.roleList.length && this.roleList.length > 0;
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
	  toggleSelectAll() {
	      if (this.isAllSelected) {
	        this.selectedRoleIds = [];
	      } else {
	        this.selectedRoleIds = this.roleList.map(role => role.roleId);
	      }
	    },
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
    changeStatus(index) {
      this.statusIndex = index;
      if (index === 0) {
        this.queryParams.status = undefined;
      } else {
        this.queryParams.status = index - 1;
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
            roleSort: res.data.roleSort ? String(res.data.roleSort) : '1', // 确保为字符串
            status: res.data.status || '0',
            remark: res.data.remark || '',
            menuIds: res.data.menuIds || [],
            deptCheckStrictly: res.data.deptCheckStrictly !== undefined ? res.data.deptCheckStrictly : true
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

    // 更多操作
    handleMore(role) {
      uni.showActionSheet({
        itemList: ['分配用户', '数据权限', '查看详情'],
        success: (res) => {
          const actionIndex = res.tapIndex;
          if (actionIndex === 0) {
            uni.showToast({
              title: '分配用户功能开发中',
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

    // 状态切换
    onStatusSwitch(e) {
      this.form.status = e.detail.value ? '0' : '1';
    },

    // 提交表单
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

    // 表单验证
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

    // 选择角色
    selectRole(roleId) {
      const index = this.selectedRoleIds.indexOf(roleId);
      if (index === -1) {
        this.selectedRoleIds.push(roleId);
      } else {
        this.selectedRoleIds.splice(index, 1);
      }
      // 添加震动反馈
      uni.vibrateShort();
    },
  }
}

</script>

<style scoped lang="scss">
/* 引入共享样式 */
@import "@/static/scss/common.scss";

</style>