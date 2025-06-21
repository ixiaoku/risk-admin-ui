<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="事件" prop="incidentCode">
        <el-select
            v-model="queryParams.incidentCode"
            placeholder="请选择事件"
            clearable
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
      <el-form-item label="指标编码" prop="metricCode">
        <el-input
            v-model="queryParams.metricCode"
            placeholder="请输入指标编码"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="指标名称" prop="metricName">
        <el-input
            v-model="queryParams.metricName"
            placeholder="请输入指标名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
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
            v-hasPermi="['system:metric:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:metric:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="metricList" border row-key="id">
      <el-table-column prop="metricCode" label="指标编码" width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="metricName" label="指标名称" width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="incidentCode" label="事件编码" width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="attributeKey" label="分组条件指标Key" width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="windowSize" label="时间窗口" width="140" :show-overflow-tooltip="true" />
      <el-table-column prop="aggregationType" label="聚合方式" width="140" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <dict-tag :options="metric_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="windowType" label="窗口类型" width="80" :show-overflow-tooltip="true" />
      <el-table-column prop="groovyScript" label="条件表达式" width="80" :show-overflow-tooltip="true" />
      <el-table-column prop="operator" label="操作人" width="80" :show-overflow-tooltip="true" />
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:metric:edit']"
          >编辑</el-button>
          <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:metric:remove']"
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
      <el-form ref="metricRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事件" prop="incidentCode">
              <el-select
                  v-model="form.incidentCode"
                  placeholder="请选择事件"
                  style="width: 100%"
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
                  style="width: 100%"
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
              <el-select
                  v-model="form.attributeKey"
                  multiple
                  placeholder="请选择属性指标"
                  style="width: 100%"
              >
                <el-option
                    v-for="item in attributeKeyOptions"
                    :key="item.code"
                    :label="item.msg"
                    :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
          <el-col :span="12">
            <el-form-item label="指标类型" prop="metricType">
              <el-select v-model="form.metricType" placeholder="请选择指标类型" style="width: 100%">
                <el-option
                    v-for="dict in counter_metric_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间窗口" prop="windowSize">
              <el-select v-model="form.windowSize" placeholder="请选择时间窗口" style="width: 100%">
                <el-option
                    v-for="dict in window_size"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="窗口类型" prop="windowType">
              <el-input v-model="form.windowType" placeholder="请输入窗口类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条件表达式" prop="groovyScript">
              <el-input v-model="form.groovyScript" placeholder="请输入条件表达式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="聚合方式" prop="aggregationType">
              <el-select v-model="form.aggregationType" placeholder="请选择聚合方式" style="width: 100%">
                <el-option
                    v-for="dict in aggregation_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in metric_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                  type="textarea"
                  v-model="form.description"
                  placeholder="请输入描述"
                  :rows="3"
                  style="width: 100%"
              />
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

<script setup name="MetricManage">
import { addMetric, delMetric, getMetric, listMetric, getDictOptions } from "@/api/risk/counter.js"
import { getCurrentInstance, ref, reactive, toRefs } from "vue"

// 获取当前实例
const { proxy } = getCurrentInstance()
// 加载字典数据
const { counter_metric_type, window_size, aggregation_type, metric_status } = proxy.useDict("counter_metric_type", "window_size", "aggregation_type", "metric_status")

// 响应式数据
const metricList = ref([]) // 指标列表
const open = ref(false) // 对话框显示
const loading = ref(true) // 表格加载
const showSearch = ref(true) // 搜索表单显示
const title = ref("") // 对话框标题
const total = ref(0) // 总记录数
const incidentOptions = ref([]) // 事件选项
const attributeKeyOptions = ref([]) // 属性指标选项

const data = reactive({
  queryParams: {
    incidentCode: undefined,
    metricCode: undefined,
    metricName: undefined,
    pageNum: 1,
    pageSize: 10
  }, // 查询参数
  form: {
    id: undefined,
    metricCode: undefined,
    metricName: undefined,
    metricType: undefined,
    incidentCode: undefined,
    incidentCodeList: [],
    attributeKey: [],
    windowSize: undefined,
    aggregationType: undefined,
    windowType: undefined,
    groovyScript: undefined,
    status: 0,
    description: undefined,
    operator: "SYSTEM"
  }, // 表单数据
  rules: {
    metricCode: [{ required: true, message: "指标编码不能为空", trigger: "blur" }],
    metricName: [{ required: true, message: "指标名称不能为空", trigger: "blur" }],
    metricType: [{ required: true, message: "指标类型不能为空", trigger: "change" }],
    incidentCode: [{ required: true, message: "事件不能为空", trigger: "change" }],
    incidentCodeList: [{ required: true, message: "应用事件不能为空", trigger: "change" }],
    attributeKey: [{ required: true, message: "属性指标Key不能为空", trigger: "change" }],
    windowSize: [{ required: true, message: "时间窗口不能为空", trigger: "change" }],
    aggregationType: [{ required: true, message: "聚合方式不能为空", trigger: "change" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }]
  } // 表单验证规则
})

const { queryParams, form, rules } = toRefs(data)

// 查询指标列表
function getList() {
  loading.value = true
  listMetric(queryParams.value).then(response => {
    metricList.value = response.data.list || []
    total.value = Number(response.data.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 加载动态字典（事件、属性指标）
async function fetchOptions() {
  try {
    const dictDb = {
      dictKeyList: ["incident", "metric"],
      queryCode: ""
    }
    const response = await getDictOptions(dictDb)
    incidentOptions.value = response.incident || []
    attributeKeyOptions.value = response.metric || []
  } catch (error) {
    proxy.$modal.msgError("加载字典失败")
  }
}

// 根据事件加载属性指标
async function fetchAttributes(incidentCode) {
  if (!incidentCode) {
    attributeKeyOptions.value = []
    return
  }
  try {
    const dictDb = {
      dictKeyList: ["metric"],
      queryCode: incidentCode
    }
    const response = await getDictOptions(dictDb)
    attributeKeyOptions.value = response.metric || []
  } catch (error) {
    proxy.$modal.msgError("加载属性指标失败")
    attributeKeyOptions.value = []
  }
}

// 事件选择变化
function handleIncidentChange(incidentCode) {
  form.value.attributeKey = []
  fetchAttributes(incidentCode)
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
  queryParams.value.metricCode = undefined
  queryParams.value.metricName = undefined
  queryParams.value.pageNum = 1
  handleQuery()
}

// 导出
function handleExport() {
  proxy.download("/system/metric/counter/export", { ...queryParams.value }, `metric_${new Date().getTime()}.xlsx`)
}

// 重置表单
function reset() {
  form.value = {
    id: undefined,
    metricCode: undefined,
    metricName: undefined,
    metricType: undefined,
    incidentCode: undefined,
    incidentCodeList: [],
    attributeKey: [],
    windowSize: undefined,
    aggregationType: undefined,
    windowType: undefined,
    groovyScript: undefined,
    status: 0,
    description: undefined,
    operator: "SYSTEM"
  }
  attributeKeyOptions.value = []
  proxy.resetForm("metricRef")
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
  title.value = "新增指标"
  fetchOptions()
}

// 编辑
async function handleUpdate(row) {
  reset()
  try {
    const response = await getMetric(row.id)
    form.value = {
      ...response.data,
      status: Number(response.data.status), // 确保字典类型匹配
      incidentCodeList: response.data.incidentCodeList || [],
      attributeKey: response.data.attributeKey || []
    }
    await fetchAttributes(row.incidentCode)
    open.value = true
    title.value = "编辑指标"
  } catch (error) {
    proxy.$modal.msgError("加载详情失败")
  }
}

// 删除
function handleDelete(row) {
  proxy.$modal.confirm(`确认删除指标 "${row.metricName}"？`).then(() => {
    return delMetric(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

// 提交表单
function submitForm() {
  proxy.$refs["metricRef"].validate(valid => {
    if (valid) {
      form.value.operator = "SYSTEM"
      const request = form.value.id ? updateMetric : addMetric
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
</style>