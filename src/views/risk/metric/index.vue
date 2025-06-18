<template>
  <div class="metric-manage">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="事件">
        <el-select v-model="searchForm.incidentCode" placeholder="请选择事件" clearable style="width: 200px;">
          <el-option
              v-for="item in incidentOptions"
              :key="item.code"
              :label="item.msg"
              :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计数器指标编码">
        <el-input v-model="searchForm.metricCode" placeholder="请输入计数器指标编码" clearable />
      </el-form-item>
      <el-form-item label="计数器指标名称">
        <el-input v-model="searchForm.metricName" placeholder="请输入计数器指标名称" clearable />
      </el-form-item>
      <el-form-item>
        <custom-button type="query" label="查询" @click="handleSearch" />
        <custom-button type="cancel" label="重置" @click="resetSearch" />
        <custom-button type="add" label="新增" @click="showAddDialog" />
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="metricCode" label="计数器指标编码" width="180" />
      <el-table-column prop="metricName" label="计数器指标名称" width="180" />
      <el-table-column prop="incidentCode" label="事件编码" width="180" />
      <el-table-column prop="attributeKey" label="分组条件指标Key" width="180" />
      <el-table-column prop="windowSize" label="时间窗口" width="140" />
      <el-table-column prop="aggregationType" label="聚合方式" width="140" />
      <el-table-column prop="status" label="状态" width="100">
        <template v-slot="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="windowType" label="窗口类型" width="80" />
      <el-table-column prop="groovyScript" label="条件表达式" width="80" />
      <el-table-column prop="operator" label="操作人" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column prop="updateTime" label="更新时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template v-slot="scope">
          <custom-button type="edit" label="编辑" size="mini" @click="showEditDialog(scope.row)" />
          <custom-button type="delete" label="删除" size="mini" @click="handleDelete(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="page.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        style="margin-top: 20px; text-align: right;"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="60%" :before-close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="metricForm" label-width="120px" class="dialog-form">
        <el-row :gutter="20">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="事件" prop="incidentCode">
                <el-select
                    v-model="form.incidentCode"
                    placeholder="请选择事件"
                    style="width: 100%;"
                    @change="handleIncidentChange"
                >
                  <el-option
                      v-for="item in incidentOptions"
                      :key="item.code"
                      :label="item.msg"
                      :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="应用事件" prop="incidentCodeList">
                <el-select
                    v-model="form.incidentCodeList"
                    placeholder="请选择事件"
                    multiple
                    style="width: 100%;"
                >
                  <el-option
                      v-for="item in incidentOptions"
                      :key="item.code"
                      :label="item.msg"
                      :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="属性指标Key" prop="attributeKey">
                <el-select v-model="form.attributeKey" multiple placeholder="请选择属性指标" style="width: 100%;">
                  <el-option
                      v-for="item in attributeKeyOptions"
                      :key="item.code"
                      :label="item.msg"
                      :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="指标编码" prop="metricCode">
                <el-input v-model="form.metricCode" placeholder="请输入指标编码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="指标名称" prop="metricName">
                <el-input v-model="form.metricName" placeholder="请输入指标名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="指标类型" prop="metricType">
                <el-select v-model="form.metricType" placeholder="请选择指标类型" style="width: 100%;">
                  <el-option
                      v-for="item in counterMetricTypeOptions"
                      :key="item.code"
                      :label="item.msg"
                      :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="时间窗口" prop="windowSize">
                <el-select v-model="form.windowSize" placeholder="请选择时间窗口" style="width: 100%;">
                  <el-option
                      v-for="item in windowSizeOptions"
                      :key="item.code"
                      :label="item.msg"
                      :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="窗口类型" prop="windowType">
              <el-input v-model="form.windowType" placeholder="窗口类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条件表达式" prop="groovyScript">
              <el-input v-model="form.groovyScript" placeholder="条件表达式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="聚合方式" prop="aggregationType">
              <el-select v-model="form.aggregationType" placeholder="请选择聚合方式" style="width: 100%;">
                <el-option
                    v-for="item in aggregationTypeOptions"
                    :key="item.code"
                    :label="item.msg"
                    :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                  type="textarea"
                  v-model="form.description"
                  placeholder="请输入描述"
                  :rows="3"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <custom-button type="cancel" label="取消" @click="handleDialogClose" />
        <custom-button type="save" label="确定" @click="handleSubmit" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get, post } from '@/api/request';
import CustomButton from '@/components/CustomButton.vue';

export default {
  name: 'MetricManage',
  components: {
    CustomButton
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        metricCode: '',
        metricName: '',
        incidentCode: ''
      },
      // 指标列表
      tableData: [],
      // 分页参数
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      // 弹窗控制
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        metricCode: '',
        metricName: '',
        metricType: null,
        incidentCode: '',
        incidentCodeList: [],
        attributeKey: [],
        windowSize: '',
        aggregationType: '',
        windowType: '',
        groovyScript: '',
        status: 0,
        description: ''
      },
      // 表单校验规则
      rules: {
        metricCode: [{ required: true, message: '请输入指标编码', trigger: 'blur' }],
        metricName: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
        metricType: [{ required: true, message: '请选择指标类型', trigger: 'change' }],
        incidentCode: [{ required: true, message: '请选择事件', trigger: 'change' }],
        incidentCodeList: [{ required: true, message: '请选择应用事件', trigger: 'change' }],
        attributeKey: [{ required: true, message: '请选择属性指标Key', trigger: 'change' }],
        windowSize: [{ required: true, message: '请选择时间窗口', trigger: 'change' }],
        aggregationType: [{ required: true, message: '请选择聚合方式', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      },
      dictDb: {
        dictKeyList: ['incident', 'metric'],
        queryCode: '',
      },
      dict: {
        dictKeyList: ['counterMetricType', 'windowSize', 'aggregationType'],
      },
      // 下拉框选项
      incidentOptions: [], // 事件选项
      counterMetricTypeOptions: [], // 指标类型选项
      windowSizeOptions: [], // 时间窗口选项
      aggregationTypeOptions: [], // 聚合方式选项
      attributeKeyOptions: [], // 属性指标选项
    };
  },
  mounted() {
    this.fetchData(); // 获取指标列表
    this.fetchOptions(); // 获取字典数据
  },
  methods: {
    // 获取指标列表
    async fetchData() {
      try {
        const response = await get('/metric/counter/list', {
          pageNum: this.page.current,
          pageSize: this.page.size,
          metricCode: this.searchForm.metricCode,
          metricName: this.searchForm.metricName,
          incidentCode: this.searchForm.incidentCode
        });
        this.tableData = response.list || [];
        this.page.total = response.total || 0;
      } catch (error) {
        this.$message.error('获取指标列表失败');
        console.error(error);
      }
    },
    // 获取字典数据
    async fetchOptions() {
      try {
        const dictResultDb = await get('/dict/options/db', this.dictDb);
        this.incidentOptions = dictResultDb.incident;
        const dictResult = await get('/dict/options', this.dict);
        this.counterMetricTypeOptions = dictResult.counterMetricType || [];
        this.windowSizeOptions = dictResult.windowSize || [];
        this.aggregationTypeOptions = dictResult.aggregationType || [];
      } catch (error) {
        this.$message.error('获取字典数据失败');
        console.error(error);
      }
    },
    // 获取事件关联的属性指标
    async fetchAttributes(incidentCode) {
      if (!incidentCode) {
        this.attributeKeyOptions = [];
        return;
      }
      try {
        this.dictDb.queryCode = incidentCode;
        const dictResult = await get('/dict/options/db', this.dictDb);
        this.attributeKeyOptions = dictResult.metric || [];
      } catch (error) {
        this.$message.error('获取属性指标失败');
        console.error(error);
      }
    },
    // 事件选择变化
    handleIncidentChange(incidentCode) {
      this.form.attributeKey = ''; // 重置属性指标
      this.fetchAttributes(incidentCode); // 获取属性指标
    },
    // 搜索
    handleSearch() {
      this.page.current = 1; // 重置到第一页
      this.fetchData();
    },
    // 重置搜索
    resetSearch() {
      this.searchForm.metricCode = '';
      this.searchForm.metricName = '';
      this.searchForm.incidentCode = '';
      this.page.current = 1;
      this.fetchData();
    },
    // 分页大小改变
    handleSizeChange(size) {
      this.page.size = size;
      this.page.current = 1;
      this.fetchData();
    },
    // 当前页改变
    handleCurrentChange(current) {
      this.page.current = current;
      this.fetchData();
    },
    // 显示新增弹窗
    showAddDialog() {
      this.dialogTitle = '新增指标';
      this.form = {
        id: null,
        metricCode: '',
        metricName: '',
        metricType: null,
        incidentCode: '',
        attributeKey: [],
        windowSize: '',
        aggregationType: '',
        status: 0,
        description: ''
      };
      this.attributeKeyOptions = []; // 重置属性指标选项
      this.dialogVisible = true;
    },
    // 显示编辑弹窗
    showEditDialog(row) {
      this.dialogTitle = '编辑指标';
      this.form = { ...row };
      this.fetchAttributes(row.incidentCode); // 加载属性指标
      this.dialogVisible = true;
    },
    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false;
      this.$refs.metricForm.resetFields();
    },
    // 提交表单（新增或编辑）
    handleSubmit() {
      this.$refs.metricForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              // 编辑
              await post(`/metric/counter/update`, this.form);
              this.$message.success('更新成功');
            } else {
              // 新增
              await post('/metric/counter/insert', this.form);
              this.$message.success('添加成功');
            }
            this.dialogVisible = false;
            await this.fetchData(); // 刷新列表
          } catch (error) {
            this.$message.error(this.form.id ? '更新失败' : '添加失败');
            console.error(error);
          }
        }
      });
    },
    // 删除指标
    handleDelete(id) {
      this.$confirm('确定删除该指标吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await post(`/metric/counter/delete/`, { id: id });
          this.$message.success('删除成功');
          await this.fetchData();
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  }
};
</script>

<style scoped>
.metric-manage {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.el-table {
  margin-bottom: 20px;
}

.dialog-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-form .el-input,
.dialog-form .el-select,
.dialog-form .el-textarea {
  width: 100%;
}
</style>