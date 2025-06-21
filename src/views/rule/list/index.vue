<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="事件" prop="incidentCode">
        <el-select
            v-model="queryParams.incidentCode"
            placeholder="请选择事件"
            clearable
            filterable
            style="width: 240px"
        >
          <el-option
              v-for="item in incidentOptions"
              :key="item.code"
              :label="item.msg"
              :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规则名称" prop="ruleName">
        <el-input
            v-model="queryParams.ruleName"
            placeholder="请输入规则名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规则编码" prop="ruleCode">
        <el-input
            v-model="queryParams.ruleCode"
            placeholder="请输入规则编码"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 240px"
        >
          <el-option
              v-for="dict in rule_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:rule:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:rule:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="ruleList" border row-key="id">
      <el-table-column prop="incidentName" label="事件名称" width="120" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ruleCode" label="规则编码" width="140" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ruleName" label="规则名称" width="140" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="rule_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="操作时间" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:rule:edit']"
          >编辑</el-button>
          <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:rule:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="60%" append-to-body>
      <el-form ref="ruleRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事件" prop="incidentCode">
              <el-select
                  v-model="form.incidentCode"
                  placeholder="请选择事件"
                  filterable
                  :disabled="editFlag"
                  style="width: 100%"
                  @change="fetchMetrics"
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
            <el-form-item label="规则编码" prop="ruleCode">
              <el-input v-model="form.ruleCode" :disabled="editFlag" placeholder="请输入规则编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option
                    v-for="dict in rule_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="得分" prop="score">
              <el-input-number v-model="form.score" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expiryTime">
              <el-input v-model="form.expiryTime" placeholder="请输入过期时间" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="指标" required>
              <div v-for="(metric, index) in form.metrics" :key="index" class="metric-row">
                <el-row :gutter="10">
                  <el-col :span="1">
                    <span class="index-badge">{{ index + 1 }}</span>
                  </el-col>
                  <el-col :span="7">
                    <el-form-item
                        :prop="'metrics.' + index + '.metricCode'"
                        :rules="[{ required: true, message: '请选择指标', trigger: 'change' }]"
                    >
                      <el-select
                          v-model="metric.metricCode"
                          placeholder="请选择指标"
                          filterable
                          :disabled="!form.incidentCode"
                          style="width: 100%"
                      >
                        <el-option
                            v-for="item in metricOptions"
                            :key="item.code"
                            :label="item.msg"
                            :value="item.code"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-form-item
                        :prop="'metrics.' + index + '.operationSymbol'"
                        :rules="[{ required: true, message: '请选择操作符', trigger: 'change' }]"
                    >
                      <el-select
                          v-model="metric.operationSymbol"
                          placeholder="请选择操作符"
                          style="width: 100%"
                      >
                        <el-option
                            v-for="dict in operation_symbol"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-form-item
                        :prop="'metrics.' + index + '.metricValueType'"
                        :rules="[{ required: true, message: '请选择指标值类型', trigger: 'change' }]"
                    >
                      <el-select
                          v-model="metric.metricValueType"
                          placeholder="请选择指标值类型"
                          style="width: 100%"
                          @change="onMetricValueTypeChange(index)"
                      >
                        <el-option
                            v-for="item in metricValueTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                        :prop="'metrics.' + index + '.metricValue'"
                        :rules="metricValueRules(index)"
                    >
                      <el-input
                          v-if="metric.metricValueType === 'custom'"
                          v-model="metric.metricValue"
                          placeholder="请输入指标值"
                          style="width: 100%"
                      />
                      <el-select
                          v-else-if="metric.metricValueType === 'metric'"
                          v-model="metric.metricValue"
                          placeholder="请选择指标值"
                          style="width: 100%"
                      >
                        <el-option
                            v-for="item in metricOptions"
                            :key="item.code"
                            :label="item.msg"
                            :value="item.code"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="2">
                    <el-button
                        type="danger"
                        icon="Delete"
                        circle
                        size="small"
                        @click="removeMetric(index)"
                    />
                  </el-col>
                </el-row>
              </div>
              <el-button type="success" icon="Plus" size="small" @click="addMetric">添加指标</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="表达式" prop="logicScript">
              <el-input v-model="form.logicScript" placeholder="请输入表达式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsiblePerson">
              <el-input v-model="form.responsiblePerson" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="决策结果" prop="decisionResult">
              <el-select v-model="form.decisionResult" placeholder="请选择决策结果" style="width: 100%">
                <el-option
                    v-for="dict in decision_result"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="label">
              <el-select v-model="form.label" placeholder="请选择标签" style="width: 100%">
                <el-option
                    v-for="dict in rule_label"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处置方式" prop="penaltyAction">
              <el-select v-model="form.penaltyAction" placeholder="请选择处置方式" style="width: 100%">
                <el-option
                    v-for="item in penaltyActionOptions"
                    :key="item.code"
                    :label="item.msg"
                    :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RuleManage">
import { addRule, delRule, getRule, listRule, getDictOptions } from "@/api/risk/rule.js"
import { getCurrentInstance, ref, reactive, toRefs } from "vue"

// 获取当前实例
const { proxy } = getCurrentInstance()
// 加载字典数据
const { rule_status, operation_symbol, metric_type, rule_label, decision_result } = proxy.useDict("rule_status", "operation_symbol", "metric_type", "rule_label", "decision_result")

// 响应式数据
const ruleList = ref([]) // 规则列表
const open = ref(false) // 对话框显示
const loading = ref(true) // 表格加载
const showSearch = ref(true) // 搜索表单显示
const title = ref("") // 对话框标题
const total = ref(0) // 总记录数
const editFlag = ref(false) // 编辑模式
const incidentOptions = ref([]) // 事件选项
const metricOptions = ref([]) // 指标选项
const penaltyActionOptions = ref([]) // 处置方式选项
const metricValueTypeOptions = ref([
  { value: "custom", label: "自定义" },
  { value: "metric", label: "指标" }
]) // 指标值类型选项

const data = reactive({
  queryParams: {
    incidentCode: undefined,
    ruleName: undefined,
    ruleCode: undefined,
    status: undefined,
    pageNum: 1,
    pageSize: 10
  }, // 查询参数
  form: {
    id: undefined,
    incidentCode: undefined,
    ruleCode: undefined,
    ruleName: undefined,
    status: "2",
    score: 0,
    groovyScript: undefined,
    jsonScript: undefined,
    logicScript: undefined,
    decisionResult: undefined,
    expiryTime: undefined,
    label: undefined,
    penaltyAction: undefined,
    responsiblePerson: undefined,
    operator: "SYSTEM",
    metrics: [{ metricCode: "", operationSymbol: "", metricValueType: "", metricValue: "" }]
  }, // 表单数据
  rules: {
    incidentCode: [{ required: true, message: "事件不能为空", trigger: "change" }],
    ruleCode: [{ required: true, message: "规则编码不能为空", trigger: "blur" }],
    ruleName: [{ required: true, message: "规则名称不能为空", trigger: "blur" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }],
    score: [{ required: true, message: "得分不能为空", trigger: "blur" }],
    responsiblePerson: [{ required: true, message: "负责人不能为空", trigger: "blur" }],
    logicScript: [{ required: true, message: "表达式不能为空", trigger: "blur" }]
  } // 表单验证规则
})

const { queryParams, form, rules } = toRefs(data)

// 查询规则列表
function getList() {
  loading.value = true
  listRule(queryParams.value).then(response => {
    ruleList.value = response.data.list || []
    total.value = Number(response.data.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 加载动态字典（事件、指标、处置方式）
async function fetchOptions() {
  try {
    const dictDb = {
      dictKeyList: ["metric", "incident", "penaltyAction"],
      queryCode: ""
    }
    const response = await getDictOptions(dictDb)
    incidentOptions.value = response.incident || []
    metricOptions.value = response.metric || []
    penaltyActionOptions.value = response.penaltyAction || []
  } catch (error) {
    proxy.$modal.msgError("加载字典失败")
  }
}

// 根据事件加载指标
async function fetchMetrics(incidentCode) {
  try {
    const dictDb = {
      dictKeyList: ["metric"],
      queryCode: incidentCode || form.value.incidentCode
    }
    const response = await getDictOptions(dictDb)
    metricOptions.value = response.metric || []
  } catch (error) {
    proxy.$modal.msgError("加载指标失败")
    metricOptions.value = []
  }
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置搜索
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.incidentCode = undefined
  queryParams.value.ruleName = undefined
  queryParams.value.ruleCode = undefined
  queryParams.value.status = undefined
  queryParams.value.pageNum = 1
  handleQuery()
}

// 导出
function handleExport() {
  proxy.download("/system/rule/export", { ...queryParams.value }, `rule_${new Date().getTime()}.xlsx`)
}

// 重置表单
function reset() {
  form.value = {
    id: undefined,
    incidentCode: undefined,
    ruleCode: undefined,
    ruleName: undefined,
    status: "2",
    score: 0,
    groovyScript: undefined,
    jsonScript: undefined,
    logicScript: undefined,
    decisionResult: undefined,
    expiryTime: undefined,
    label: undefined,
    penaltyAction: undefined,
    responsiblePerson: undefined,
    operator: "SYSTEM",
    metrics: [{ metricCode: "", operationSymbol: "", metricValueType: "", metricValue: "" }]
  }
  editFlag.value = false
  metricOptions.value = []
  proxy.resetForm("ruleRef")
}

// 取消对话框
function cancel() {
  open.value = false
  reset()
}

// 新增
function handleAdd() {
  reset()
  open.value = true
  title.value = "新增规则"
  fetchOptions()
}

// 编辑
async function handleUpdate(row) {
  reset()
  try {
    const response = await getRule(row.id)
    form.value = {
      ...response.data,
      status: String(response.data.status), // 确保字典类型匹配
      metrics: response.data.jsonScript
          ? JSON.parse(response.data.jsonScript).map(item => ({
            metricCode: item.metricCode || "",
            operationSymbol: item.operationSymbol || "",
            metricValue: item.metricValue || "",
            metricValueType: item.metricValueType || ""
          }))
          : [{ metricCode: "", operationSymbol: "", metricValueType: "", metricValue: "" }]
    }
    editFlag.value = true
    await fetchMetrics(row.incidentCode)
    open.value = true
    title.value = "编辑规则"
  } catch (error) {
    proxy.$modal.msgError("加载详情失败")
  }
}

// 删除
function handleDelete(row) {
  proxy.$modal.confirm(`确认删除规则 "${row.ruleName}"？`).then(() => {
    return delRule(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

// 指标值类型变化
function onMetricValueTypeChange(index) {
  form.value.metrics[index].metricValue = ""
}

// 动态生成指标值校验规则
function metricValueRules(index) {
  const type = form.value.metrics[index].metricValueType
  if (type === "custom") {
    return [{ required: true, message: "请输入指标值", trigger: "blur" }]
  } else if (type === "metric") {
    return [{ required: true, message: "请选择指标值", trigger: "change" }]
  }
  return []
}

// 添加指标
function addMetric() {
  form.value.metrics.push({
    metricCode: "",
    operationSymbol: "",
    metricValue: "",
    metricValueType: ""
  })
}

// 删除指标
function removeMetric(index) {
  if (form.value.metrics.length > 1) {
    form.value.metrics.splice(index, 1)
  } else {
    proxy.$modal.msgWarning("至少保留一行指标")
  }
}

// 提交表单
function submitForm() {
  proxy.$refs["ruleRef"].validate(valid => {
    if (valid) {
      form.value.jsonScript = JSON.stringify(
          form.value.metrics.map((item, index) => ({
            serialNumber: index + 1,
            metricCode: item.metricCode,
            operationSymbol: item.operationSymbol,
            metricValue: item.metricValue,
            metricValueType: item.metricValueType || ""
          }))
      )
      form.value.operator = "SYSTEM"
      const request = form.value.id ? updateRule : addRule
      request(form.value).then(response => {
        if (response.code === 200) {
          proxy.$modal.msgSuccess(form.value.id ? "修改成功" : "新增成功")
          open.value = false
          getList()
        } else {
          proxy.$modal.msgError(response.msg || "操作失败")
        }
      }).catch(() => {
        proxy.$modal.msgError("操作失败")
      })
    }
  })
}

// 初始化
getList()
fetchOptions()
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
.metric-row {
  margin-bottom: 10px;
}
.index-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #f0f0f0;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-top: 8px;
}
</style>