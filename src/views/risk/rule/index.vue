<!-- src/components/RuleManage.vue -->
<template>
  <div class="rule-manage-container">
    <!-- 顶部操作栏 -->
    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="事件" class="form-item">
        <el-select v-model="queryForm.incidentCode" placeholder="请选择事件" clearable filterable class="input-style">
          <el-option
              v-for="item in incidentOptions"
              :key="item.code"
              :label="item.msg"
              :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="规则名称" class="form-item">
        <el-input v-model="queryForm.ruleName" placeholder="请输入规则名称" clearable class="input-style"></el-input>
      </el-form-item>
      <el-form-item label="规则编码" class="form-item">
        <el-input v-model="queryForm.ruleCode" placeholder="请输入规则编码" clearable class="input-style"></el-input>
      </el-form-item>
      <el-form-item label="状态" class="form-item">
        <el-select v-model="queryForm.status" placeholder="请选择状态" clearable class="input-style">
          <el-option
              v-for="item in ruleStatusOptions"
              :key="item.code"
              :label="item.msg"
              :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button class="btn-query" @click="fetchData">
          <i class="el-icon-search"></i> 查询
        </el-button>
        <el-button class="btn-add" @click="openAddDialog">
          <i class="el-icon-plus"></i> 新增
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
        :data="tableData"
        border
        class="custom-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        style="min-width: 1000px;"
    >
      <el-table-column prop="incidentName" label="事件名称" width="120"></el-table-column>
      <el-table-column prop="ruleCode" label="规则编码" width="140"></el-table-column>
      <el-table-column prop="ruleName" label="规则名称" width="140"></el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template v-slot="scope">
          <el-tag
              :type="getTagType(scope.row.status)"
              effect="dark"
              size="small"
          >
            {{ getDictLabel('msg', scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
      <el-table-column prop="updateTime" label="操作时间" width="160"></el-table-column>
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button size="mini" class="btn-edit" @click="openEditDialog(scope.row)">
            <i class="el-icon-edit"></i> 编辑
          </el-button>
          <el-button size="mini" class="btn-delete" @click="deleteRule(scope.row)">
            <i class="el-icon-delete"></i> 删除
          </el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="50%"
        class="custom-dialog"
        :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="ruleForm" label-width="80px" class="dialog-form">
        <el-form-item label="事件" prop="incidentCode">
          <el-select v-model="form.incidentCode" placeholder="请选择事件" filterable
                     @change="fetchMetrics"
                     :disabled="editFlag"
                     class="input-style">
            <el-option
                v-for="item in incidentOptions"
                :key="item.code"
                :label="item.msg"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则编码" prop="ruleCode">
          <el-input v-model="form.ruleCode" class="input-style" :disabled="editFlag" ></el-input>
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" class="input-style"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" class="input-style">
            <el-option
                v-for="item in ruleStatusOptions"
                :key="item.code"
                :label="item.msg"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="得分" prop="score">
          <el-input-number v-model="form.score" :min="0" :max="100" class="input-style"></el-input-number>
        </el-form-item>

        <el-form-item label="过期时间" prop="expiryTime">
          <el-input v-model="form.expiryTime" class="input-style"></el-input>
        </el-form-item>

        <el-form-item label="指标" required>
          <div v-for="(metric, index) in form.metrics" :key="index" class="metric-row">
            <el-row :gutter="10">
              <el-col :span="1">
                <div>{{ index + 1 }}</div>
              </el-col>
              <el-col :span="7">
                <el-form-item
                    :prop="'metrics.' + index + '.metricCode'"
                    :rules="[{ required: true, message: '请选择指标', trigger: 'change' }]"
                >
                  <el-select v-model="metric.metricCode" placeholder="请选择指标" filterable :disabled="!form.incidentCode" class="input-style">
                    <el-option
                        v-for="item in metricOptions"
                        :key="item.code"
                        :label="item.msg"
                        :value="item.code"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4">
                <el-form-item
                    :prop="'metrics.' + index + '.operationSymbol'"
                    :rules="[{ required: true, message: '请选择操作符', trigger: 'change' }]"
                >
                  <el-select v-model="metric.operationSymbol" placeholder="请选择操作符" class="input-style">
                    <el-option
                        v-for="item in operationOptions"
                        :key="item.code"
                        :label="item.msg"
                        :value="item.code"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- 指标值类型 -->
              <el-col :span="4">
                <el-form-item
                    :prop="'metrics.' + index + '.metricValueType'"
                    :rules="[{ required: true, message: '请选择指标值类型', trigger: 'change' }]"
                >
                  <el-select v-model="metric.metricValueType" placeholder="请选择指标值类型" class="input-style" @change="onMetricValueTypeChange(index)">
                    <el-option
                        v-for="item in metricValueTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="7">
                <el-form-item
                    :prop="'metrics.' + index + '.metricValue'"
                    :rules="metricValueRules(index)"
                >
                  <!-- 自定义：显示输入框 -->
                  <el-input
                      v-if="metric.metricValueType === 'custom'"
                      v-model="metric.metricValue"
                      placeholder="请输入指标值"
                      class="input-style"
                  ></el-input>
                  <!-- 指标：显示下拉框 -->
                  <el-select
                      v-else-if="metric.metricValueType === 'metric'"
                      v-model="metric.metricValue"
                      placeholder="请选择指标值"
                      class="input-style"
                  >
                    <el-option
                        v-for="item in metricOptions"
                        :key="item.code"
                        :label="item.msg"
                        :value="item.code"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="3">
                <el-button class="btn-delete" size="mini" @click="removeMetric(index)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </el-col>
            </el-row>
          </div>
          <el-button class="btn-add-metric" size="small" @click="addMetric">
            <i class="el-icon-plus"></i> 添加指标
          </el-button>
        </el-form-item>

        <el-form-item label="表达式" prop="logicScript">
          <el-input v-model="form.logicScript" class="input-style"></el-input>
        </el-form-item>

        <el-form-item label="负责人" prop="responsiblePerson">
          <el-input v-model="form.responsiblePerson" class="input-style"></el-input>
        </el-form-item>

        <el-form-item label="决策结果" prop="decisionResult">
          <el-select v-model="form.decisionResult" placeholder="请选择决策结果" class="input-style">
            <el-option
                v-for="item in decisionResultOptions"
                :key="item.code"
                :label="item.msg"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="label">
          <el-select v-model="form.label" placeholder="请选择标签" class="input-style">
            <el-option
                v-for="item in ruleLabelOptions"
                :key="item.code"
                :label="item.msg"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="处置方式" prop="penaltyAction">
          <el-select v-model="form.penaltyAction" placeholder="请选择处置方式" class="input-style">
            <el-option
                v-for="item in penaltyActionOptions"
                :key="item.code"
                :label="item.msg"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="btn-cancel" @click="dialogVisible = false">取消</el-button>
        <el-button class="btn-save" @click="submitForm('ruleForm')">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { post, get } from '@/api/request';
import {MessageBox} from "element-ui";

export default {
  name: 'RuleManage',
  data() {
    return {
      queryForm: {
        incidentCode: '',
        ruleName: '',
        ruleCode: '',
        status: null
      },
      // 分页参数
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      tableData: [],
      form: {
        incidentCode: '',
        ruleCode: '',
        ruleName: '',
        status: 2,
        score: 0,
        groovyScript: '',
        jsonScript: '',
        logicScript: '',
        decisionResult: '',
        expiryTime: 0,
        label: '',
        penaltyAction: '',
        responsiblePerson: '',
        operator: 'cherry.zhang',
        metrics: [{ metricCode: '', operationSymbol: '', metricValueType: '', metricValue: '' }]
      },
      rules: {
        incidentCode: [{ required: true, message: '请输入事件编码', trigger: 'blur' }],
        ruleCode: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
        ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        score: [{ required: true, message: '请输入得分', trigger: 'blur' }],
        responsiblePerson: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
        logicScript: [{ required: true, message: '请输入表达式', trigger: 'blur' }],
      },
      metricValueTypeOptions: [
        { value: 'custom', label: '自定义' },
        { value: 'metric', label: '指标' }
      ],
      metricOptions: [], //特征字典
      operationOptions: [], //操作符字典
      ruleStatusOptions: [], //规则字典
      metricTypeOptions: [], //指标类型字典
      incidentOptions: [], //事件字典
      ruleLabelOptions: [], //规则标签字典
      decisionResultOptions: [], //规则决策结果字典
      penaltyActionOptions: [], //规则处置字典
      dict: {
        dictKeyList: ['operationSymbol', 'ruleStatus' , 'metricType', 'ruleLabel', 'decisionResult'],
      },
      dictDb: {
        dictKeyList: ['metric', 'incident', 'penaltyAction'],
        queryCode: '',
      },
      dialogVisible: false,
      dialogTitle: '',
      editFlag: false,
    };
  },
  mounted() {
    this.fetchData();
    this.fetchOptions();
    this.fetchMetrics();
  },
  methods: {
    async fetchData() {
      try {
        const response = await post('/rule/list', {
          pageNum: this.page.current,
          pageSize: this.page.size,
          ruleName: this.queryForm.ruleName,
          ruleCode: this.queryForm.ruleCode,
          status: this.queryForm.status,
        });
        this.tableData = response.list || [];
        this.page.total = response.total || 0;
      } catch (error) {
        console.log(`查询失败: ${error.message || error.error}`);
        console.error('错误详情:', error);
      }
    },
    // 搜索
    handleSearch() {
      this.page.current = 1; // 重置到第一页
      this.fetchData();
    },
    // 重置搜索
    resetSearch() {
      this.queryForm.ruleName = '';
      this.queryForm.ruleCode = '';
      this.queryForm.status = '';
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

    // 根据字段名和值获取字典标签
    getDictLabel(field, value) {
      const options = this.ruleStatusOptions.find(opt => opt.code === value) || {};
      return options[field] !== undefined ? options[field] : '未知'; // 默认显示 '未知'
    },
    // 根据状态值动态设置标签类型
    getTagType(value) {
      const statusMap = {
        0: 'danger',  // 下线 - 红色
        1: 'success', // 上线 - 绿色
        2: 'danger',  // 下线 - 红色
        3: 'warning'  // 模拟 - 黄色
      };
      return statusMap[value];
    },

    fetchOptions: async function () {
      try {
        const dictResult = await get('/dict/options', this.dict);
        this.operationOptions = dictResult.operationSymbol;
        this.ruleStatusOptions = dictResult.ruleStatus;
        this.metricTypeOptions = dictResult.metricType;
        this.ruleLabelOptions = dictResult.ruleLabel;
        this.decisionResultOptions = dictResult.decisionResult;
      } catch (error) {
        console.log('获取字典失败: ' + error.message);
      }
    },

    // 根据事件获取指标
    async fetchMetrics(incidentCode) {
      try {
        // 假设后端接口根据事件编码返回相关指标
        this.dictDb.queryCode = incidentCode;
        const dictResult = await get('/dict/options/db', this.dictDb);
        this.metricOptions = dictResult.metric || [];
        this.incidentOptions = dictResult.incident || [];
        this.penaltyActionOptions = dictResult.penaltyAction || [];
      } catch (error) {
        console.log('获取指标失败: ' + error.message);
        this.metricOptions = [];
      }
    },

    openAddDialog() {
      this.dialogTitle = '新增规则';
      this.form = {
        status: 1,
        score: 0,
        metrics: [{ metricCode: '', operationSymbol: '', metricValueType: '', metricValue: '' }]
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate();
      });
    },

    async openEditDialog(row) {
      this.dialogTitle = '编辑规则';
      this.dialogVisible = false; // 先隐藏，等数据加载后再打开
      this.editFlag = true;

      try {
        // 调用详情接口，获取完整数据
        const response = await get(`/rule/detail/`, {id: row.id});

        // 复制返回数据到表单
        this.form = { ...response, metrics: [] };

        //加载指标字典
        await this.fetchMetrics(row.incidentCode);

        // 解析 jsonScript 字段
        if (this.form.jsonScript) {
          this.form.metrics = JSON.parse(this.form.jsonScript).map(item => ({
            metricCode: item.metricCode || '',
            operationSymbol: item.operationSymbol || '',
            metricValue: item.metricValue || '',
            metricValueType: item.metricValueType || '',
          }));
        }

        // 确保至少有一个空指标
        if (this.form.metrics.length === 0) {
          this.form.metrics.push({ metricCode: '', operationSymbol: '', metricValueType: '', metricValue: '' });
        }

        // 数据加载完毕后，打开弹窗
        this.dialogVisible = true;
      } catch (error) {
        console.log('加载详情失败: ' + error.message);
      }
    },

    // 指标值类型变化时，清空 metricValue
    onMetricValueTypeChange(index) {
      this.form.metrics[index].metricValue = '';
    },

    // 动态生成 metricValue 的校验规则
    metricValueRules(index) {
      const type = this.form.metrics[index].metricValueType;
      if (type === 'custom') {
        return [{ required: true, message: '请输入指标值', trigger: 'blur' }];
      } else if (type === 'metric') {
        return [{ required: true, message: '请选择指标值', trigger: 'change' }];
      }
      return [];
    },

    addMetric() {
      this.form.metrics.push({
        metricCode: '',
        operationSymbol: '',
        metricValue: '',
        metricValueType: '',
      });
    },
    removeMetric(index) {
      if (this.form.metrics.length > 1) {
        this.form.metrics.splice(index, 1);
      } else {
        this.$message.warning('至少保留一行指标');
      }
    },
    async submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.form.jsonScript = JSON.stringify(
              this.form.metrics.map((item, index) => ({
                serialNumber: index + 1,
                metricCode: item.metricCode,
                operationSymbol: item.operationSymbol,
                metricValue: item.metricValue,
                metricValueType: item.metricValueType || '',
              }))
          );
          try {
            const url = this.form.ruleCode && this.dialogTitle === '编辑规则' ? `/rule/update` : '/rule/insert';
            await post(url, this.form);
            this.$message.success('操作成功');
            this.dialogVisible = false;
            await this.fetchData();
          } catch (error) {
            console.log('操作失败: ' + error.message);
          }
        }
      });
    },
    deleteRule(row) {
      MessageBox.confirm('确认删除此规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return post(`/rule/delete/`, { id: row.id });
      }).then(() => {
        this.$message.success('删除成功');
        return this.fetchData();
      }).catch(error => {
        if (error !== 'cancel') {
          console.log('删除失败: ' + error.message);
        }
      });
    },
  }
};
</script>

<style scoped>

.rule-manage-container {
  width: 100%;
  overflow-x: auto; /* 让表格可以横向滚动 */
  padding: 20px;
  background: #f0f2f5;
}

.query-form {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.form-item {
  margin-right: 20px;
}

.input-style {
  width: 200px; /* 调整宽度以适应更多查询条件 */
}

.custom-table {
  width: 100%;
  min-width: 1000px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-query {
  background: linear-gradient(90deg, #409eff, #66b1ff);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  color: #fff;
  transition: all 0.3s;
}

.btn-query:hover {
  background: linear-gradient(90deg, #66b1ff, #409eff);
}

.btn-add {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  color: #fff;
  transition: all 0.3s;
}

.btn-add:hover {
  background: linear-gradient(90deg, #85ce61, #67c23a);
}

.btn-edit {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
  border: none;
  color: #fff;
  border-radius: 15px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: linear-gradient(90deg, #ebb563, #e6a23c);
}

.btn-delete {
  background: linear-gradient(90deg, #f56c6c, #f78989);
  border: none;
  color: #fff;
  border-radius: 15px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: linear-gradient(90deg, #f78989, #f56c6c);
}

.btn-save {
  background: linear-gradient(90deg, #409eff, #66b1ff);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  color: #fff;
  transition: all 0.3s;
}

.btn-save:hover {
  background: linear-gradient(90deg, #66b1ff, #409eff);
}

.btn-cancel {
  background: linear-gradient(90deg, #909399, #a6a9ad);
  border: none;
  color: #fff;
  border-radius: 20px;
  padding: 10px 20px;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: linear-gradient(90deg, #a6a9ad, #909399);
}

.btn-add-metric {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border: none;
  color: #fff;
  border-radius: 15px;
  padding: 6px 12px;
  margin-top: 10px;
  transition: all 0.3s;
}

.btn-add-metric:hover {
  background: linear-gradient(90deg, #85ce61, #67c23a);
}

.custom-dialog {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dialog-form {
  padding: 0 20px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px;
}

.metric-row {
  margin-bottom: 10px;
}
.metric-row {
  margin-bottom: 10px;
}
.input-style {
  width: 100%;
}
.btn-add-metric {
  margin-top: 10px;
}
.index-badge {
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #f0f0f0;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin: 0 auto;
}
</style>