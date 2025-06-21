<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="事件编码" prop="incidentCode">
        <el-input
            v-model="queryParams.incidentCode"
            placeholder="请输入事件编码"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="事件名称" prop="incidentName">
        <el-input
            v-model="queryParams.incidentName"
            placeholder="请输入事件名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option
              v-for="dict in incident_status"
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
            v-hasPermi="['system:incident:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:incident:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="incidentList" border row-key="id">
      <el-table-column prop="incidentCode" label="事件编码" width="140" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="incidentName" label="事件名称" width="140" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="incident_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="responsiblePerson" label="负责人" width="100"></el-table-column>
      <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
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
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:incident:edit']"
          >编辑</el-button>
          <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:incident:remove']"
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
      <el-form ref="incidentRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事件编码" prop="incidentCode">
              <el-input v-model="form.incidentCode" placeholder="请输入事件编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="事件名称" prop="incidentName">
              <el-input v-model="form.incidentName" placeholder="请输入事件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option
                    v-for="dict in incident_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsiblePerson">
              <el-input v-model="form.responsiblePerson" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="决策结果" prop="decisionResult">
              <el-input v-model="form.decisionResult" placeholder="请输入决策结果" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求数据" prop="requestPayload">
              <el-input
                  type="textarea"
                  :rows="6"
                  v-model="formattedRequestPayload"
                  placeholder="请输入请求数据"
                  :disabled="isPayloadDisabled"
                  style="width: 100%"
              />
              <el-button
                  type="success"
                  @click="handleParsePayload"
                  style="margin-top: 10px"
              >解析指标</el-button>
            </el-form-item>
          </el-col>
          <!-- 指标表格 -->
          <el-col :span="24" v-if="metrics.length">
            <el-form-item label="指标列表">
              <el-table :data="metrics" border style="width: 100%">
                <el-table-column prop="metricCode" label="指标标识" width="120"></el-table-column>
                <el-table-column prop="metricName" label="指标名称" width="150">
                  <template #default="scope">
                    <el-input
                        v-model="scope.row.metricName"
                        placeholder="请输入指标名称"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="metricType" label="指标类型" width="120">
                  <template #default="scope">
                    <el-select v-model="scope.row.metricType" style="width: 100%">
                      <el-option
                          v-for="dict in metric_type"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column prop="sampleValue" label="指标样例值">
                  <template #default="scope">
                    <el-input
                        v-model="scope.row.sampleValue"
                        placeholder="请输入样例值"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="metricDesc" label="指标备注">
                  <template #default="scope">
                    <el-input
                        v-model="scope.row.metricDesc"
                        placeholder="请输入备注"
                    />
                  </template>
                </el-table-column>
              </el-table>
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

<script setup name="IncidentManage">
import { addIncident, delIncident, getIncident, listIncident, parsePayload, updateIncident } from "@/api/risk/incident.js"
import { getCurrentInstance, ref, reactive, toRefs, computed } from "vue"

// 获取当前实例
const { proxy } = getCurrentInstance()
// 加载字典数据
const { incident_status, metric_type } = proxy.useDict("incident_status", "metric_type")

// 响应式数据
const incidentList = ref([]) // 事件列表
const open = ref(false) // 对话框显示
const loading = ref(true) // 表格加载
const showSearch = ref(true) // 搜索表单显示
const title = ref("") // 对话框标题
const total = ref(0) // 总记录数
const isPayloadDisabled = ref(false) // 请求数据输入框禁用
const metrics = ref([]) // 解析的指标列表

const data = reactive({
  queryParams: {
    incidentCode: undefined,
    incidentName: undefined,
    status: undefined,
    pageNum: 1,
    pageSize: 10
  }, // 查询参数
  form: {
    id: undefined,
    incidentCode: undefined,
    incidentName: undefined,
    status: "0",
    responsiblePerson: undefined,
    operator: undefined,
    requestPayload: undefined,
    decisionResult: undefined,
    metrics: []
  }, // 表单数据
  rules: {
    incidentCode: [{ required: true, message: "事件编码不能为空", trigger: "blur" }],
    incidentName: [{ required: true, message: "事件名称不能为空", trigger: "blur" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }],
    responsiblePerson: [{ required: true, message: "负责人不能为空", trigger: "blur" }],
    requestPayload: [{ required: true, message: "请求数据不能为空", trigger: "blur" }]
  } // 表单验证规则
})

const { queryParams, form, rules } = toRefs(data)

// 格式化请求数据
const formattedRequestPayload = computed({
  get() {
    if (!form.value.requestPayload) return ""
    try {
      return JSON.stringify(JSON.parse(form.value.requestPayload), null, 2)
    } catch {
      return form.value.requestPayload
    }
  },
  set(value) {
    form.value.requestPayload = value
  }
})

// 查询事件列表
function getList() {
  loading.value = true
  listIncident(queryParams.value).then(response => {
    incidentList.value = response.data.list || []
    total.value = Number(response.data.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

async function handleParsePayload() {
  try {
    isPayloadDisabled.value = true
    const response = await parsePayload({
      requestPayload: form.value.requestPayload,
      incidentCode: form.value.incidentCode
    })
    metrics.value = response.data.map(item => ({
      metricCode: item.metricCode || "",
      metricName: item.metricName || "",
      metricType: String(item.metricType || ""),
      sampleValue: item.sampleValue || "",
      metricDesc: item.metricDesc || ""
    }))
    proxy.$modal.msgSuccess("解析成功")
  } catch (error) {
    proxy.$modal.msgError("解析失败")
  } finally {
    isPayloadDisabled.value = false
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
  queryParams.value.incidentName = undefined
  queryParams.value.status = undefined
  queryParams.value.pageNum = 1
  handleQuery()
}

// 导出
function handleExport() {
  proxy.download("/system/incident/export", { ...queryParams.value }, `incident_${new Date().getTime()}.xlsx`)
}

// 重置表单
function reset() {
  form.value = {
    id: undefined,
    incidentCode: undefined,
    incidentName: undefined,
    status: "0",
    responsiblePerson: undefined,
    operator: undefined,
    requestPayload: undefined,
    decisionResult: undefined,
    metrics: []
  }
  metrics.value = []
  isPayloadDisabled.value = false
  proxy.resetForm("incidentRef")
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
  title.value = "新增事件"
}

// 编辑
function handleUpdate(row) {
  reset()
  getIncident(row.id).then(response => {
    form.value = {
      ...response.data,
      status: String(response.data.status), // 确保字典类型匹配
      metrics: response.data.metrics || []
    }
    metrics.value = form.value.metrics
    open.value = true
    title.value = "编辑事件"
  })
}

// 删除
function handleDelete(row) {
  proxy.$modal.confirm(`确认删除事件 "${row.incidentName}"？`).then(() => {
    return delIncident(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

// 提交表单
function submitForm() {
  proxy.$refs["incidentRef"].validate(valid => {
    if (valid) {
      form.value.operator = "SYSTEM"
      if (metrics.value.length) {
        form.value.metrics = metrics.value
      }
      const request = form.value.id ? updateIncident : addIncident
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
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>