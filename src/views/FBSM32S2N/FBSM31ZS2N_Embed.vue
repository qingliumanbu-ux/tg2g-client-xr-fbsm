<template>
  <div class="embed-layout" @click="handleFormClick">
    <!--
      【傻瓜式开关】控制按钮区显示/隐藏。
      如果后续不需要这批按钮：
      1) 把下面这行 v-if="showToolbar" 删掉，或改成 v-if="false"
      2) 按钮区会消失，表格自动 flex:1 顶上来占满空间
    -->
    <div v-if="false" class="toolbar-area">
      <div class="button-row">
        <button class="btn btn-info" @click="$emit('toolbar-refresh')">
          刷新<br>数据
        </button>
        <button class="btn btn-primary" @click="$emit('toolbar-show-process-data')">
          过程<br>数据
        </button>
        <button class="btn btn-success" @click="$emit('toolbar-show-stock')">
          库存<br>查询
        </button>
        <button class="btn btn-warning" @click="$emit('toolbar-show-history')">
          导入<br>模板
        </button>
        <button class="btn btn-info" @click="$emit('toolbar-save-to-template')">
          存为<br>模板
        </button>
        <button class="btn btn-primary" @click="$emit('toolbar-save-formula')">
          保存
        </button>
        <button class="btn btn-success" @click="$emit('toolbar-check-formula')">
          审核
        </button>
        <button class="btn btn-warning" @click="$emit('toolbar-nocheck-formula')">
          取消<br>审核
        </button>
        <button class="btn btn-primary" @click="$emit('toolbar-export-formula')">
          导出
        </button>
      </div>
    </div>

    <!-- 表格区域：始终显示 -->
    <div class="table-area">
      <div class="formula-section">
        <div class="formula-content no-title">
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="bofTableWrapper">
              <Spreadsheet ref="spreadsheetRefBOF"
                :initial-rows="6"
                :initial-columns="6"
                :row-height="22"
                :show-row-checkboxes="true"
                :non-selectable-row-labels="specialRowLabels"
                :column-width="columnWidthsBOF"
                :data="materialDataBOF"
                :protected-rows="protectedRowsBOF"
                :protected-columns="protectedColumnsBOF"
                :auto-height="true"
                :showColumnHeaders="false"
                :active="activeSpreadsheet === 'BOF'"
                @cell-update="(r: number, c: number, v: any) => $emit('cell-update', r, c, v)"
                @data-change="(d: CellData[][]) => $emit('data-change', d)"
                @height-change="(h: number) => $emit('height-change', h)"
                @activated="() => $emit('activated', 'BOF')" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Spreadsheet from '../FBSM32S2N/Spreadsheet.vue';
import type { CellData } from '../FBSM32S2N/Spreadsheet.vue';

// ====================  Props  ====================
const props = defineProps<{
  // 按钮区显隐
  showToolbar?: boolean;
  // Spreadsheet 数据
  materialDataBOF: CellData[][];
  // 列宽
  columnWidthsBOF?: number[];
  // 受保护行
  protectedRowsBOF?: number[];
  // 受保护列
  protectedColumnsBOF?: number[];
  // 当前激活的表格
  activeSpreadsheet?: string | null;
}>();

// ====================  Emits  ====================
const emit = defineEmits([
  'toolbar-refresh',
  'toolbar-show-process-data',
  'toolbar-show-stock',
  'toolbar-show-history',
  'toolbar-save-to-template',
  'toolbar-save-formula',
  'toolbar-check-formula',
  'toolbar-nocheck-formula',
  'toolbar-export-formula',
  'cell-update',
  'data-change',
  'height-change',
  'activated',
  'deactivated'
]);

// ====================  常量  ====================
const specialRowLabels = ['配料重量', '出钢重量', '备注'];

// ====================  Refs  ====================
const spreadsheetRefBOF = ref<InstanceType<typeof Spreadsheet>>();
const bofTableWrapper = ref<HTMLElement>();

// ====================  事件处理（纯转发/本地交互） ====================
const handleFormClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const isSpreadsheetClick = target.closest('.spreadsheet-container') !== null;
  if (!isSpreadsheetClick) {
    deactivateAllSpreadsheets();
  }
};

const deactivateAllSpreadsheets = () => {
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.forceStopEditing();
  }
  emit('deactivated');
};

// ====================  暴露给父组件的方法  ====================
const setBOFData = (data: CellData[][]) => {
  spreadsheetRefBOF.value?.setData(data);
};

const forceStopBOFEditing = () => {
  spreadsheetRefBOF.value?.forceStopEditing();
};

defineExpose({
  spreadsheetRefBOF,
  bofTableWrapper,
  setBOFData,
  forceStopBOFEditing
});
</script>

<style lang="scss" scoped>
.embed-layout {
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.toolbar-area {
  flex-shrink: 0;
  margin-bottom: 8px;
}

.table-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.button-row {
  display: flex;
  gap: 8px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  min-width: 60px;

  &-icon {
    font-size: 14px;
  }

  &-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6b4090 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }

  &-secondary {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #d9d9d9;

    &:hover {
      background: #e8e8e8;
      transform: translateY(-1px);
    }
  }

  &-success {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #4bb018 0%, #338d0c 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
    }
  }

  &-warning {
    background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #e89c12 0%, #c47a05 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
    }
  }

  &-info {
    background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #11b0b0 0%, #077f83 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(19, 194, 194, 0.3);
    }
  }
}

.formula-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.formula-content {
  flex: 1;
  display: flex;
  gap: 8px;
  overflow: hidden;
  height: 100%;
}

.formula-content.no-title {
  gap: 0;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  height: 100%;
}

.spreadsheet-wrapper {
  flex: 1;
  border-radius: 4px;
  overflow: auto;
  height: 100%;
  width: 100%;
  min-width: 0;
}
</style>
