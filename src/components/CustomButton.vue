<template>
  <el-button
      :class="buttonClass"
      :size="size"
      @click="$emit('click')"
  >
    <i :class="iconClass"></i> {{ label }}
  </el-button>
</template>

<script>
export default {
  name: 'CustomButton',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['query', 'add', 'edit', 'delete', 'save', 'cancel'].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    }
  },
  computed: {
    buttonClass() {
      return `btn-${this.type}`;
    },
    iconClass() {
      const icons = {
        query: 'el-icon-search',
        add: 'el-icon-plus',
        edit: 'el-icon-edit',
        delete: 'el-icon-delete',
        save: 'el-icon-check',
        cancel: 'el-icon-close'
      };
      return icons[this.type] || '';
    }
  }
};
</script>

<style scoped>
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
</style>