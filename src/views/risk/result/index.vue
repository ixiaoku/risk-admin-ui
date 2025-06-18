<template>
  <div class="risk-engine-container">
    <!-- 查询条件 -->
    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="业务流水号">
        <el-input v-model="queryForm.flowNo" placeholder="请输入业务流水号" clearable class="input-style"></el-input>
      </el-form-item>
      <el-form-item label="风控流水号">
        <el-input v-model="queryForm.riskFlowNo" placeholder="请输入风控流水号" clearable class="input-style"></el-input>
      </el-form-item>
      <el-form-item label="事件">
        <el-select v-model="queryForm.incidentCode" placeholder="请选择事件" clearable filterable class="input-style">
          <el-option v-for="item in incidentOptions" :key="item.code" :label="item.msg" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="命中规则">
        <el-select v-model="queryForm.ruleCode" placeholder="请选择规则" clearable filterable class="input-style">
          <el-option v-for="item in ruleOptions" :key="item.code" :label="item.msg" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
            v-model="queryForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="custom-date-picker"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button class="btn-query" @click="fetchAllData">
          <i class="el-icon-search"></i> 查询
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 风控业务数据看板 -->
    <div class="dashboard-container">
      <h3>风控业务数据看板</h3>
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
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="tableData"
        border
        class="custom-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="flowNo" label="业务流水号" width="200"></el-table-column>
      <el-table-column prop="riskFlowNo" label="系统流水号" width="250"></el-table-column>
      <el-table-column prop="incidentName" label="事件名称" width="120"></el-table-column>
      <el-table-column prop="decisionResult" label="风控结果" width="80">
        <template v-slot="scope">
          <el-tag :type="getTagType(scope.row.decisionResult)" effect="dark" size="small">
            {{ getLabel(scope.row.decisionResult) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="基本要素" width="80">
        <template v-slot="scope">
          <el-button type="text" @click="showPrimaryElement(scope.row.primaryElement)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column label="命中规则" width="80">
        <template v-slot="scope">
          <el-button
              v-if="scope.row.primaryRule"
              type="text"
              @click="showPrimaryRule(scope.row.primaryRule)"
          >查看详情
          </el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="命中上线" width="80">
        <template v-slot="scope">
          <el-button v-if="scope.row.hitOnlineRules"
                     type="text"
                     @click="showRuleList(scope.row.hitOnlineRules, '上线策略')">
            查看列表
          </el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="命中模拟" width="120">
        <template v-slot="scope">
          <el-button type="text"
                     v-if="scope.row.hitMockRules"
                     @click="showRuleList(scope.row.hitMockRules, '模拟策略')">
            查看列表
          </el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button size="mini" class="btn-snapshot" @click="showSnapshot(scope.row)">
            <i class="el-icon-document"></i> 快照
          </el-button>
          <el-button size="mini" class="btn-replay" @click="replayIncident(scope.row)">
            <i class="el-icon-refresh"></i> 复现
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 基本要素对话框 -->
    <el-dialog title="基本要素详情" :visible.sync="elementVisible" width="40%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="IP">{{ currentElement.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备">{{ currentElement.device }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentElement.uid }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentElement.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentElement.telephone }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ currentElement.location }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="elementVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 命中规则对话框 -->
    <el-dialog title="命中规则" :visible.sync="ruleVisible" width="40%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="规则名称">{{ currentRule.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="规则编码">{{ currentRule.ruleCode }}</el-descriptions-item>
        <el-descriptions-item label="规则分数">{{ currentRule.ruleScore }}</el-descriptions-item>
        <el-descriptions-item label="规则状态">{{ currentRule.ruleStatus }}</el-descriptions-item>
        <el-descriptions-item label="规则标签">{{ currentRule.ruleLabel }}</el-descriptions-item>
        <el-descriptions-item label="规则处置">{{ currentRule.penaltyAction }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="ruleVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 规则列表对话框 -->
    <el-dialog :title="ruleDialogTitle" :visible.sync="ruleListVisible" width="60%">
      <el-table :data="currentRuleList" border>
        <el-table-column prop="ruleCode" label="规则编码" width="120"></el-table-column>
        <el-table-column prop="ruleName" label="规则名称" width="150"></el-table-column>
        <el-table-column prop="ruleScore" label="规则得分" width="100"></el-table-column>
        <el-table-column prop="ruleStatus" label="规则状态" width="100"></el-table-column>
        <el-table-column prop="ruleVersion" label="规则版本"></el-table-column>
      </el-table>
      <span slot="footer">
        <el-button @click="ruleListVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 快照对话框 -->
    <el-dialog title="快照" :visible.sync="snapshotVisible" width="60%">
      <el-form :model="snapshotData" label-width="120px">
        <el-form-item label="业务流水号">
          <span>{{ snapshotData.flowNo }}</span>
        </el-form-item>
        <el-form-item label="事件编码">
          <span>{{ snapshotData.incidentCode }}</span>
        </el-form-item>
        <el-form-item label="请求数据">
          <template>
            <div>
              <el-row v-for="(value, key) in snapshotData.requestPayload" :key="key" class="json-line">
                <el-col :span="6" class="json-key">{{ key }}</el-col>
                <el-col :span="18" class="json-value">{{ value }}</el-col>
              </el-row>
            </div>
          </template>
        </el-form-item>
        <el-form-item label="指标数据">
          <template>
            <div>
              <el-row v-for="(value, key) in snapshotData.metric" :key="key" class="json-line">
                <el-col :span="6" class="json-key">{{ key }}</el-col>
                <el-col :span="18" class="json-value">{{ value }}</el-col>
              </el-row>
            </div>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="snapshotVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 复现对话框 -->
    <!-- 快照对话框 -->
    <el-dialog title="复现" :visible.sync="replayVisible" width="60%" class="risk-dialog">
      <el-form :model="replayData" label-width="100px" class="risk-form">

        <el-form-item label="规则名称">
          <span class="risk-label">{{ replayData.ruleName }}</span>
        </el-form-item>

        <el-form-item label="条件表达式">
          <el-row
              v-for="(item, index) in replayData.conditions"
              :key="index"
              class="risk-condition-row"
          >
            <el-col :span="4" class="risk-index">条件 {{ index + 1 }}</el-col>
            <el-col :span="20" class="risk-expression">
              <span class="expr-label">表达式:</span>
              <code class="expr-code">{{ item.ruleScript }}</code>
              <el-tag
                  :type="item.resultFlag ? 'success' : 'danger'"
                  size="mini"
                  class="expr-tag"
              >
                {{ item.resultFlag ? 'True' : 'False' }}
              </el-tag>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="逻辑表达式">
          <code class="expr-code">{{ replayData.logicScript }}</code>
        </el-form-item>

        <el-form-item label="最终结果">
          <el-tag :type="replayData.resultFlag ? 'success' : 'danger'" size="medium">
            {{ replayData.resultFlag ? 'True' : 'False' }}
          </el-tag>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
      <el-button @click="replayVisible = false">关闭</el-button>
    </span>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        class="pagination"
    ></el-pagination>
  </div>
</template>

<script>
import { get } from '@/api/request';

export default {
  name: 'EngineResult',
  data() {
    return {
      queryForm: {
        flowNo: '',
        riskFlowNo: '',
        ruleCode: '',
        incidentCode: '',
        dateRange: this.getDefaultDateRange()
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      dashboardData: {
        approvalRate: 0,
        rejectionRate: 0,
        dailyVolume: 0
      },
      snapshotVisible: false,
      snapshotData: {},

      replayVisible: false,
      replayData: {},

      elementVisible: false,
      currentElement: {},

      ruleVisible: false,
      currentRule: {},

      ruleListVisible: false,
      currentRuleList: [],
      ruleDialogTitle: '',
      ruleOptions: [],
      incidentOptions: [],
      decisionResultOptions: [],
      dictDb: {
        dictKeyList: ['incident', 'rule', 'penaltyAction'],
      },
      dict: {
        dictKeyList: ['decisionResult'],
      },
    };
  },
  computed: {
  },
  mounted() {
    this.fetchAllData();
    this.fetchOptions();
  },
  methods: {
    getDefaultDateRange() {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      now.setHours(23, 59, 59, 0);
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      return [formatDate(sevenDaysAgo), formatDate(now)];
    },

    async fetchAllData() {
      await Promise.all([this.fetchData(), this.fetchDashboardData()]);
    },

    async fetchData() {
      try {
        const [startTime, endTime] = this.queryForm.dateRange || [];
        const response = await get('/engine/result/list', {
          flowNo: this.queryForm.flowNo,
          riskFlowNo: this.queryForm.riskFlowNo,
          ruleCode: this.queryForm.ruleCode,
          incidentCode: this.queryForm.incidentCode,
          startTime: startTime || '',
          endTime: endTime || '',
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        });
        this.tableData = response.list || [];
        this.pagination.total = response.total || 0;
      } catch (error) {
        console.log(`查询失败: ${error.message || error.error}`);
      }
    },

    async fetchDashboardData() {
      try {
        const [startTime, endTime] = this.queryForm.dateRange || [];
        const response = await get('/engine/result/dashboard', {
          flowNo: this.queryForm.flowNo,
          riskFlowNo: this.queryForm.riskFlowNo,
          ruleCode: this.queryForm.ruleCode,
          incidentCode: this.queryForm.incidentCode,
          startTime: startTime || '',
          endTime: endTime || ''
        });
        this.dashboardData = {
          approvalRate: response.approvalRate || 0,
          rejectionRate: response.rejectionRate || 0,
          dailyVolume: response.dailyVolume || 0
        };
      } catch (error) {
        console.log(`看板数据获取失败: ${error.message || error.error}`);
      }
    },

    async fetchOptions() {
      try {
        const dictResultDb = await get('/dict/options/db', this.dictDb);
        this.incidentOptions = dictResultDb.incident;
        this.ruleOptions = dictResultDb.rule;
        const dictResult = await get('/dict/options', this.dict);
        this.decisionResultOptions = dictResult.decisionResult;
      } catch (error) {
        console.log('获取字典失败: ' + error.message);
      }
    },

    showPrimaryElement(element) {
      this.currentElement = element || {};
      console.log(this.currentElement)
      this.elementVisible = true;
    },

    showPrimaryRule(rule) {
      this.currentRule = rule || {};
      this.ruleVisible = true;
    },

    showRuleList(rules, type) {
      this.currentRuleList = rules || [];
      this.ruleDialogTitle = `命中${type}列表`;
      this.ruleListVisible = true;
    },

    async showSnapshot(row) {
      try {
        const response = await get('/engine/result/snapshot', {
          riskFlowNo: row.riskFlowNo
        });
        this.snapshotData = response || {};
        this.snapshotVisible = true;
      } catch (error) {
        console.log(`获取快照失败: ${error.message || error.error}`);
      }
    },

    async replayIncident(row) {
      try {
        const response = await get('/engine/result/replay', { riskFlowNo: row.riskFlowNo });
        this.replayData = response || {};
        this.replayVisible = true;
      } catch (error) {
        console.log(`复现失败: ${error.message || error.error}`);
      }
    },

    getLabel(value) {
      const option = this.decisionResultOptions.find(opt => opt.code === value) || {};
      return option.msg || '未知';
    },

    getTagType(value) {
      const statusMap = {
        1: 'success',
        0: 'warning'
      };
      return statusMap[value] || 'info';
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchData();
    }
  }
};
</script>

<style scoped>
.risk-engine-container {
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

.input-style {
  width: 200px;
}

.custom-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.custom-date-picker {
  width: 360px; /* 增加长度 */
  height: 40px; /* 稍微增加高度 */
}

.custom-date-picker {
  background: #fff;
  border-radius: 4px;
  font-size: 14px; /* 增大字体 */
  color: #606266;
}

.custom-date-picker {
  color: #909399;
  font-size: 14px;
}

.custom-date-picker {
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
  transition: all 0.3s;
}

.custom-date-picker {
  border-color: #409eff; /* 鼠标悬停时边框变蓝 */
}

.custom-date-picker :focus {
  border-color: #409eff;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.5); /* 聚焦时添加蓝色光晕 */
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

.btn-snapshot {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border: none;
  color: #fff;
  border-radius: 15px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.btn-snapshot:hover {
  background: linear-gradient(90deg, #85ce61, #67c23a);
}

.btn-replay {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
  border: none;
  color: #fff;
  border-radius: 15px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.btn-replay:hover {
  background: linear-gradient(90deg, #ebb563, #e6a23c);
}

.dashboard-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.json-line {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.json-key {
  font-weight: bold;
  color: #666;
}

.json-value {
  color: #333;
}

.risk-form {
  font-size: 14px;
  color: #333;
}

.risk-condition-row {
  margin-bottom: 10px;
}

.risk-index {
  font-weight: bold;
  color: #409EFF;
  line-height: 32px;
}

.risk-expression {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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

.expr-tag {
  margin-top: 4px;
}
</style>