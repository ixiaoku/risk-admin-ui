<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="业务流水号" prop="flowNo">
        <el-input
            v-model="queryParams.flowNo"
            placeholder="请输入业务流水号"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="风控流水号" prop="riskFlowNo">
        <el-input
            v-model="queryParams.riskFlowNo"
            placeholder="请输入风控流水号"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
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
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="命中规则" prop="ruleCode">
        <el-select
            v-model="queryParams.ruleCode"
            placeholder="请选择规则"
            clearable
            filterable
            style="width: 240px"
        >
          <el-option
              v-for="item in ruleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围" prop="dateRange">
        <el-date-picker
            v-model="queryParams.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
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
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:engine:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 看板 -->
    <el-card class="dashboard-container">
      <template #header>
        <div class="card-header">
          <span>风控业务数据看板</span>
        </div>
      </template>
      <div class="dashboard-content">
        <div class="stat-item">
          <span class="label">上报总量:</span>
          <span class="value">{{ dashboardData.dailyVolume }}</span>
        </div>
        <div class="stat-item">
          <span class="label">通过率:</span>
          <span class="value">{{ dashboardData.approvalRate }}%</span>
        </div>
        <div class="stat-item">
          <span class="label">拒绝率:</span>
          <span class="value">{{ dashboardData.rejectionRate }}%</span>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="engineList" border row-key="riskFlowNo">
      <el-table-column prop="flowNo" label="业务流水号" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="riskFlowNo" label="系统流水号" width="250" :show-overflow-tooltip="true" />
      <el-table-column prop="incidentName" label="事件名称" width="120" :show-overflow-tooltip="true" />
      <el-table-column prop="decisionResult" label="风控结果" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="decisionResultOptions" :value="scope.row.decisionResult" />
        </template>
      </el-table-column>
      <el-table-column label="基本要素" width="80" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="showPrimaryElement(scope.row.primaryElement)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column label="命中规则" width="80" align="center">
        <template #default="scope">
          <el-button
              v-if="scope.row.primaryRule"
              link
              type="primary"
              @click="showPrimaryRule(scope.row.primaryRule)"
          >查看详情</el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="命中上线" width="80" align="center">
        <template #default="scope">
          <el-button
              v-if="scope.row.hitOnlineRules"
              link
              type="primary"
              @click="showRuleList(scope.row.hitOnlineRules, '上线策略')"
          >查看列表</el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="命中模拟" width="120" align="center">
        <template #default="scope">
          <el-button
              v-if="scope.row.hitMockRules"
              link
              type="primary"
              @click="showRuleList(scope.row.hitMockRules, '模拟策略')"
          >查看列表</el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              link
              type="primary"
              icon="Document"
              @click="showSnapshot(scope.row)"
              v-hasPermi="['system:engine:snapshot']"
          >快照</el-button>
          <el-button
              link
              type="primary"
              icon="Refresh"
              @click="replay(scope.row)"
              v-hasPermi="['system:engine:replay']"
          >复现</el-button>
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

    <!-- 基本要素对话框 -->
    <el-dialog title="基本要素详情" v-model="elementVisible" width="40%" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="IP">{{ currentElement.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备">{{ currentElement.device }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentElement.uid }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentElement.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentElement.telephone }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ currentElement.location }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="elementVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 命中规则对话框 -->
    <el-dialog title="命中规则" v-model="ruleVisible" width="40%" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="规则名称">{{ currentRule.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="规则编码">{{ currentRule.ruleCode }}</el-descriptions-item>
        <el-descriptions-item label="规则分数">{{ currentRule.ruleScore }}</el-descriptions-item>
        <el-descriptions-item label="规则状态">
          <dict-tag :options="ruleStatusOptions" :value="currentRule.ruleStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="规则标签">
          <dict-tag :options="ruleLabelOptions" :value="currentRule.ruleLabel" />
        </el-descriptions-item>
        <el-descriptions-item label="规则处置">{{ currentRule.penaltyAction }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="ruleVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 规则列表对话框 -->
    <el-dialog :title="ruleDialogTitle" v-model="ruleListVisible" width="60%" append-to-body>
      <el-table :data="currentRuleList" border>
        <el-table-column prop="ruleCode" label="规则编码" width="120" :show-overflow-tooltip="true" />
        <el-table-column prop="ruleName" label="规则名称" width="150" :show-overflow-tooltip="true" />
        <el-table-column prop="ruleScore" label="规则得分" width="100" />
        <el-table-column prop="ruleStatus" label="规则状态" width="100">
          <template #default="scope">
            <dict-tag :options="ruleStatusOptions" :value="scope.row.ruleStatus" />
          </template>
        </el-table-column>
        <el-table-column prop="ruleVersion" label="规则版本" :show-overflow-tooltip="true" />
      </el-table>
      <template #footer>
        <el-button @click="ruleListVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 快照对话框 -->
    <el-dialog title="快照" v-model="snapshotVisible" width="60%" append-to-body>
      <el-form :model="snapshotData" label-width="120px">
        <el-form-item label="业务流水号">
          <span>{{ snapshotData.flowNo }}</span>
        </el-form-item>
        <el-form-item label="事件编码">
          <span>{{ snapshotData.incidentCode }}</span>
        </el-form-item>
        <el-form-item label="请求数据">
          <el-descriptions :column="1" border>
            <el-descriptions-item v-for="(value, key) in snapshotData.requestPayload" :key="key" :label="key">
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item label="指标数据">
          <el-descriptions :column="1" border>
            <el-descriptions-item v-for="(value, key) in snapshotData.metric" :key="key" :label="key">
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="snapshotVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 复现对话框 -->
    <el-dialog title="复现" v-model="replayVisible" width="60%" append-to-body>
      <el-form :model="replayData" label-width="100px">
        <el-form-item label="规则名称">
          <span>{{ replayData.ruleName }}</span>
        </el-form-item>
        <el-form-item label="条件表达式">
          <el-row
              v-for="(item, index) in replayData.conditions"
              :key="index"
              class="condition-row"
          >
            <el-row :span="20">
              <span class="expr-label">{{ index + 1 }} :</span>
              <code class="expr-code">{{ item.ruleScript }}</code>
              <el-tag
                  :type="item.resultFlag ? 'success' : 'danger'"
                  size="small"
              >
                {{ item.resultFlag ? 'True' : 'False' }}
              </el-tag>
            </el-row>
          </el-row>
        </el-form-item>
        <el-form-item label="逻辑表达式">
          <code class="expr-code">{{ replayData.logicScript }}</code>
        </el-form-item>
        <el-form-item label="指标数据">
          <el-descriptions :column="1" border>
            <el-descriptions-item v-for="(value, key) in replayData.metric" :key="key" :label="key">
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item label="最终结果">
          <el-tag :type="replayData.resultFlag ? 'success' : 'danger'" size="medium">
            {{ replayData.resultFlag ? 'True' : 'False' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replayVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="EngineResult">
import { listEngineResult, getDashboard, getSnapshot, replayIncident } from "@/api/risk/result"
import { getDictOptions, getDictOptionsByDb } from "@/api/risk/dictionary"
import { getCurrentInstance, ref, reactive, toRefs } from "vue"

// 获取当前实例
const { proxy } = getCurrentInstance()

// 响应式数据
const engineList = ref([]) // 风控结果列表
const loading = ref(true) // 表格加载
const showSearch = ref(true) // 搜索表单显示
const total = ref(0) // 总记录数
const elementVisible = ref(false) // 基本要素对话框
const ruleVisible = ref(false) // 命中规则对话框
const ruleListVisible = ref(false) // 规则列表对话框
const snapshotVisible = ref(false) // 快照对话框
const replayVisible = ref(false) // 复现对话框
const incidentOptions = ref([]) // 事件选项
const ruleOptions = ref([]) // 规则选项

const decisionResultOptions = ref([]) // 规则选项
const ruleStatusOptions = ref([]) // 规则选项
const ruleLabelOptions = ref([]) // 规则选项

const currentElement = ref({}) // 当前基本要素
const currentRule = ref({}) // 当前命中规则
const currentRuleList = ref([]) // 当前规则列表
const ruleDialogTitle = ref("") // 规则列表标题
const snapshotData = ref({}) // 快照数据
const replayData = ref({}) // 复现数据

const data = reactive({
  queryParams: {
    flowNo: undefined,
    riskFlowNo: undefined,
    ruleCode: undefined,
    incidentCode: undefined,
    dateRange: getDefaultDateRange(),
    pageNum: 1,
    pageSize: 10
  }, // 查询参数
  dashboardData: {
    approvalRate: 0,
    rejectionRate: 0,
    dailyVolume: 0
  }, // 看板数据
  incidentOptions: [],
  ruleOptions: [],
  decisionResultOptions: [],
  ruleStatusOptions: [],
  ruleLabelOptions: [],

})

const { queryParams, dashboardData } = toRefs(data)

// 获取默认时间范围（最近7天）
function getDefaultDateRange() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  now.setHours(23, 59, 59, 0)
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return [formatDate(sevenDaysAgo), formatDate(now)]
}

// 查询风控结果列表
function getList() {
  loading.value = true
  const [startTime, endTime] = queryParams.value.dateRange || []
  listEngineResult({
    ...queryParams.value,
    startTime: startTime || '',
    endTime: endTime || ''
  }).then(response => {
    engineList.value = response.data.list || []
    total.value = Number(response.data.total) || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
    proxy.$modal.msgError("查询失败")
  })
}

// 查询看板数据
function getDashboardData() {
  const [startTime, endTime] = queryParams.value.dateRange || []
  getDashboard({
    ...queryParams.value,
    startTime: startTime || '',
    endTime: endTime || ''
  }).then(response => {
    dashboardData.value = {
      approvalRate: response.data.approvalRate || 0,
      rejectionRate: response.data.rejectionRate || 0,
      dailyVolume: response.data.dailyVolume || 0
    }
  }).catch(() => {
    proxy.$modal.msgError("看板数据获取失败")
  })
}

// 加载动态字典（事件、规则）
async function fetchOptions() {
  try {
    const dictDb = {
      dictKeyList: ["incident", "rule", "penaltyAction"]
    }
    const response = await getDictOptionsByDb(dictDb)
    incidentOptions.value = response.data.incident || []
    ruleOptions.value = response.data.rule || []

    const dictOptions = {
      dictKeyList: ["decisionResult", "ruleStatus", "ruleLabel"]
    }
    const result = await getDictOptions(dictOptions)
    decisionResultOptions.value = result.data.decisionResult || []
    ruleStatusOptions.value = result.data.ruleStatus || []
    ruleLabelOptions.value = result.data.ruleLabel || []
  } catch (error) {
    proxy.$modal.msgError("加载字典失败")
  }
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
  getDashboardData()
}

// 重置搜索
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.flowNo = undefined
  queryParams.value.riskFlowNo = undefined
  queryParams.value.ruleCode = undefined
  queryParams.value.incidentCode = undefined
  queryParams.value.dateRange = getDefaultDateRange()
  queryParams.value.pageNum = 1
  handleQuery()
}

// 导出
function handleExport() {
  const [startTime, endTime] = queryParams.value.dateRange || []
  proxy.download("/system/engine/result/export", {
    ...queryParams.value,
    startTime: startTime || '',
    endTime: endTime || ''
  }, `engine_result_${new Date().getTime()}.xlsx`)
}

// 显示基本要素
function showPrimaryElement(element) {
  currentElement.value = element || {}
  elementVisible.value = true
}

// 显示命中规则
function showPrimaryRule(rule) {
  currentRule.value = rule || {}
  ruleVisible.value = true
}

// 显示规则列表
function showRuleList(rules, type) {
  currentRuleList.value = rules || []
  ruleDialogTitle.value = `命中${type}列表`
  ruleListVisible.value = true
}

// 显示快照
async function showSnapshot(row) {
  try {
    const response = await getSnapshot({ riskFlowNo: row.riskFlowNo })
    snapshotData.value = response.data || {}
    snapshotVisible.value = true
  } catch (error) {
    proxy.$modal.msgError("获取快照失败")
  }
}

// 复现
async function replay(row) {
  try {
    const response = await replayIncident({ riskFlowNo: row.riskFlowNo })
    replayData.value = response.data || {}
    replayVisible.value = true
  } catch (error) {
    proxy.$modal.msgError("复现失败")
  }
}

// 初始化
getList()
getDashboardData()
fetchOptions()
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
.dashboard-container {
  margin: 20px 0;
}
.dashboard-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.stat-item {
  text-align: center;
  padding: 10px;
}
.stat-item .label {
  font-size: 16px;
  color: #606266;
}
.stat-item .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-top: 5px;
}
.condition-row {
  margin-bottom: 10px;
}
.condition-index {
  font-weight: bold;
  color: #409eff;
  line-height: 32px;
}
.expr-label {
  font-weight: bold;
  margin-right: 6px;
  color: #666;
}
.expr-code {
  background-color: #f8f8f8;
  padding: 2px 8px;
  border-radius: 4px;
  color: #555;
  font-family: monospace;
  margin-right: 10px;
  white-space: pre-wrap;
}
</style>