<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="名单库名称" prop="listLibraryName">
        <el-input
            v-model="queryParams.listLibraryName"
            placeholder="请输入名单库名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 200px">
          <el-option
              v-for="dict in listLibraryStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名单库类别" prop="listCategory">
        <el-select v-model="queryParams.listCategory" placeholder="名单库类别" clearable style="width: 200px">
          <el-option
              v-for="dict in listLibraryCategoryOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
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
            v-hasPermi="['system:listLibrary:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
        v-loading="loading"
        :data="listLibraryList"
        row-key="id"
        class="custom-table"
    >
      <el-table-column prop="listLibraryCode" label="名单库编码" :show-overflow-tooltip="true" width="150"></el-table-column>
      <el-table-column prop="listLibraryName" label="名单库名称" :show-overflow-tooltip="true" width="200"></el-table-column>
      <el-table-column prop="listCategory" label="名单库类别" width="120">
        <template #default="scope">
          <dict-tag :options="listLibraryCategoryOptions" :value="scope.row.listCategory" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <dict-tag :options="listLibraryStatusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <CustomButton type="edit" label="修改" @click="handleUpdate(scope.row)" />
          <CustomButton type="delete" label="删除" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="listLibraryRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名单库编码" prop="listLibraryCode">
              <el-input v-model="form.listLibraryCode" placeholder="请输入名单库编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名单库名称" prop="listLibraryName">
              <el-input v-model="form.listLibraryName" placeholder="请输入名单库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名单库类别" prop="listCategory">
              <el-select v-model="form.listCategory" placeholder="请选择名单库类别">
                <el-option
                    v-for="dict in listLibraryCategoryOptions"
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
                <el-radio
                    v-for="dict in listLibraryStatusOptions"
                    :key="dict.value"
                    :value="dict.value"
                >{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="listLibraryDesc">
              <el-input v-model="form.listLibraryDesc" type="textarea" placeholder="请输入名单库描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ListLibrary">
import { addListLibrary, delListLibrary, detail, listListLibrary, updateListLibrary } from "@/api/list/library"
import { getCurrentInstance, ref, reactive, toRefs } from "vue"
import CustomButton from '@/components/CustomButton.vue'
import '@/assets/styles/table.scss'
import {getDictOptions} from "@/api/risk/dictionary.js";

// 获取当前实例
const { proxy } = getCurrentInstance()

// 响应式数据
const listLibraryList = ref([]) // 名单库列表
const open = ref(false) // 对话框是否显示
const loading = ref(true) // 表格加载状态
const showSearch = ref(true) // 搜索表单是否显示
const title = ref("") // 对话框标题
const total = ref(0) // 总记录数

const data = reactive({
  form: {}, // 表单数据
  queryParams: {
    listLibraryName: undefined,
    status: undefined,
    listCategory: undefined,
    pageNum: 1,
    pageSize: 10
  }, // 查询参数
  rules: {
    listLibraryCode: [{ required: true, message: "名单库编码不能为空", trigger: "blur" }],
    listLibraryName: [{ required: true, message: "名单库名称不能为空", trigger: "blur" }],
    listCategory: [{ required: true, message: "名单库类别不能为空", trigger: "change" }],
    status: [{ required: true, message: "状态不能为空", trigger: "change" }]
  }, // 表单验证规则
  listLibraryCategoryOptions: [], // 状态字典
  listLibraryStatusOptions: [], // 名单库类别字典
})

const { queryParams, form, rules, listLibraryStatusOptions, listLibraryCategoryOptions } = toRefs(data)

onMounted(() => {
  fetchOptions()
})

// 获取字典数据
async function fetchOptions() {
  try {
    const dictOptions = {
      dictKeyList: ["listLibraryStatus", "listLibraryCategory"]
    }
    const result = await getDictOptions(dictOptions)
    listLibraryStatusOptions.value = result.data.listLibraryStatus || []
    listLibraryCategoryOptions.value = result.data.listLibraryCategory || []
  } catch (error) {
    proxy.$modal.msgError("加载字典失败")
  }
}

// 查询名单库列表
function getList() {
  loading.value = true
  listListLibrary(queryParams.value).then(response => {
    listLibraryList.value = response.data.list || []
    total.value = response.data.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 重置表单
function reset() {
  form.value = {
    id: undefined,
    listLibraryCode: undefined,
    listLibraryName: undefined,
    listCategory: undefined,
    status: "0",
    listLibraryDesc: undefined
  }
  proxy.resetForm("listLibraryRef")
}

// 取消对话框
function cancel() {
  open.value = false
  reset()
}

// 搜索按钮
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置搜索
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.pageNum = 1
  queryParams.value.status = undefined
  queryParams.value.listCategory = undefined
  queryParams.value.listLibraryName = undefined
  handleQuery()
}

// 新增按钮
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加名单库"
}

// 修改按钮
function handleUpdate(row) {
  reset()
  detail(row.id).then(response => {
    form.value = {
      ...response.data,
      status: String(response.data.status), // 确保状态为字符串
      listCategory: String(response.data.listCategory) // 确保类别为字符串
    }
    open.value = true
    title.value = "修改名单库"
  })
}

// 提交表单
function submitForm() {
  proxy.$refs["listLibraryRef"].validate(valid => {
    if (valid) {
      const request = form.value.id ? updateListLibrary : addListLibrary
      request(form.value).then(() => {
        proxy.$modal.msgSuccess(form.value.id ? "修改成功" : "新增成功")
        open.value = false
        getList()
      })
    }
  })
}

// 删除按钮
function handleDelete(row) {
  proxy.$modal.confirm(`是否确认删除名单库 "${row.listLibraryName}"？`).then(() => {
    return delListLibrary(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

// 页面加载时查询列表
getList()
</script>

<style scoped>
/* 分页样式 */
.pagination {
  margin-top: 10px;
  text-align: right;
}
</style>