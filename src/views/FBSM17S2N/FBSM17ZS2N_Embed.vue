<template>
  <div class="form-layout" @click="$emit('form-click', $event)">
    <div v-if="isChecked" class="audit-watermark">已审核</div>

    <!-- 区域2：脱磷配料单 -->
    <div class="area-6" v-if="hasDSMaterialData">
      <div class="formula-section">
        <div class="formula-content">
          <div class="vertical-title">
            <div class="vertical-text">三脱配料单</div>
          </div>
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="dsTableWrapper">
              <Spreadsheet ref="spreadsheetRefDS" :initial-rows="4" :initial-columns="24" :row-height="22"
                :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels" :column-width="columnWidths"
                :data="materialDataDS" :protected-rows="protectedRowsDS" :protected-columns="protectedColumnsDS"
                :auto-height="true" :showColumnHeaders="false" :active="activeSpreadsheet === 'DS'"
                @cell-update="(r: number, c: number, v: any, s?: any) => $emit('cell-update-ds', r, c, v, s)"
                @data-change="(d: any) => $emit('data-change-ds', d)"
                @height-change="(h: number) => $emit('height-change-ds', h)"
                @activated="() => $emit('activated', 'DS')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 区域2：IF配料单 -->
    <div class="area-2" v-if="hasIFMaterialData">
      <div class="formula-section">
        <div class="formula-content">
          <div class="vertical-title">
            <div class="vertical-text">IF配料单</div>
          </div>
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="ifTableWrapper">
              <Spreadsheet ref="spreadsheetRefIF" :initial-rows="4" :initial-columns="24" :row-height="22"
                :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels" :column-width="columnWidths"
                :data="materialDataIF" :protected-rows="protectedRowsIF" :protected-columns="protectedColumnsIF"
                :auto-height="true" :showColumnHeaders="false" :active="activeSpreadsheet === 'IF'"
                @cell-update="(r: number, c: number, v: any, s?: any) => $emit('cell-update-if', r, c, v, s)"
                @data-change="(d: any) => $emit('data-change-if', d)"
                @height-change="(h: number) => $emit('height-change-if', h)"
                @activated="() => $emit('activated', 'IF')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 区域3：EAF配料单 -->
    <div class="area-3" v-if="hasEAFMaterialData">
      <div class="formula-section">
        <div class="formula-content">
          <div class="vertical-title eaf-title">
            <div class="vertical-text">EAF配料单</div>
          </div>
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="eafTableWrapper">
              <Spreadsheet ref="spreadsheetRefEAF" :initial-rows="6" :initial-columns="24" :row-height="22"
                :column-width="columnWidths" :data="materialDataEAF" :protected-rows="protectedRowsEAF"
                :protected-columns="protectedColumnsEAF" :auto-height="true" :showColumnHeaders="false"
                :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels"
                :active="activeSpreadsheet === 'EAF'"
                @cell-update="(r: number, c: number, v: any, s?: any) => $emit('cell-update-eaf', r, c, v, s)"
                @data-change="(d: any) => $emit('data-change-eaf', d)"
                @height-change="(h: number) => $emit('height-change-eaf', h)"
                @activated="() => $emit('activated', 'EAF')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 区域5：BOF配料单 -->
    <div class="area-5" v-if="hasBOFMaterialData">
      <div class="formula-section">
        <div class="formula-content">
          <div class="vertical-title bof-title">
            <div class="vertical-text">BOF配料单</div>
          </div>
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="bofTableWrapper">
              <Spreadsheet ref="spreadsheetRefBOF" :initial-rows="6" :initial-columns="24" :row-height="22"
                :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels" :column-width="columnWidths"
                :data="materialDataBOF" :protected-rows="protectedRowsBOF" :protected-columns="protectedColumnsBOF"
                :auto-height="true" :showColumnHeaders="false" :active="activeSpreadsheet === 'BOF'"
                @cell-update="(r: number, c: number, v: any, s?: any) => $emit('cell-update-bof', r, c, v, s)"
                @data-change="(d: any) => $emit('data-change-bof', d)"
                @height-change="(h: number) => $emit('height-change-bof', h)"
                @activated="() => $emit('activated', 'BOF')" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 区域4：AOD配料单 -->
    <div class="area-4">
      <div class="formula-section">
        <div class="formula-content">
          <div class="vertical-title aod-title">
            <div class="vertical-text">AOD配料单</div>
          </div>
          <div class="table-container">
            <div class="spreadsheet-wrapper" ref="aodTableWrapper">
              <Spreadsheet ref="spreadsheetRefAOD" :initial-rows="10" :initial-columns="24" :row-height="22"
                :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels" :column-width="columnWidths"
                :data="materialDataAOD" :protected-rows="protectedRowsAOD" :protected-columns="protectedColumnsAOD"
                :auto-height="true" :showColumnHeaders="false" :active="activeSpreadsheet === 'AOD'"
                :highlight-row-condition="isHighlightRow"
                @cell-update="(r: number, c: number, v: any, s?: any) => $emit('cell-update-aod', r, c, v, s)"
                @data-change="(d: any) => $emit('data-change-aod', d)"
                @height-change="(h: number) => $emit('height-change-aod', h)"
                @activated="() => $emit('activated', 'AOD')" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Spreadsheet from './Spreadsheet.vue';
import type { CellData } from './Spreadsheet.vue';

const props = defineProps<{
  showToolbar?: boolean;
  form: Record<string, any>;
  processRouteDataSource: any[];
  middleCategoryDataSource: any[];
  hasDSMaterialData: boolean;
  hasIFMaterialData: boolean;
  hasEAFMaterialData: boolean;
  hasBOFMaterialData: boolean;
  hasAODMaterialData: boolean;
  materialDataDS: CellData[][];
  materialDataIF: CellData[][];
  materialDataEAF: CellData[][];
  materialDataBOF: CellData[][];
  materialDataAOD: CellData[][];
  columnWidths: number[];
  protectedRowsDS: number[];
  protectedRowsIF: number[];
  protectedRowsEAF: number[];
  protectedRowsBOF: number[];
  protectedRowsAOD: number[];
  protectedColumnsDS: number[];
  protectedColumnsIF: number[];
  protectedColumnsEAF: number[];
  protectedColumnsBOF: number[];
  protectedColumnsAOD: number[];
  activeSpreadsheet: string | null;
  specialRowLabels: string[];
  isChecked?: boolean;
}>();

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
  'toolbar-model-col',
  'cell-update-if',
  'data-change-if',
  'height-change-if',
  'height-change-ds',
  'data-change-ds',
  'cell-update-ds',
  'cell-update-eaf',
  'data-change-eaf',
  'height-change-eaf',
  'cell-update-bof',
  'data-change-bof',
  'height-change-bof',
  'cell-update-aod',
  'data-change-aod',
  'height-change-aod',
  'activated',
  'deactivated',
  'refs-ready',
  'form-click'
]);

// 高亮行判断：库区为"废钢料场"且物料属性为"渣钢", 出钢成分
const isHighlightRow = (row: CellData[]): boolean => {
  const matNAME = row[0]?.value;
  const storageArea = row[1]?.value;
  const back_c2 = row[22]?.value;
  const v_back_c2 = String(back_c2).slice(0, 1);
  // 
  return v_back_c2 === '1' || v_back_c2 === '5' || back_c2 === '26' || matNAME === '出钢成分'; //废钢料场和渣钢
};

const spreadsheetRefDS = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefIF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefEAF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefBOF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefAOD = ref<InstanceType<typeof Spreadsheet>>();

const dsTableWrapper = ref<HTMLElement>();
const ifTableWrapper = ref<HTMLElement>();
const eafTableWrapper = ref<HTMLElement>();
const bofTableWrapper = ref<HTMLElement>();
const aodTableWrapper = ref<HTMLElement>();

const emitRefsReady = () => {
  emit('refs-ready', {
    spreadsheetRefDS,
    spreadsheetRefIF,
    spreadsheetRefEAF,
    spreadsheetRefBOF,
    spreadsheetRefAOD
  });
};

onMounted(emitRefsReady);
watch(spreadsheetRefDS, emitRefsReady);
watch(spreadsheetRefIF, emitRefsReady);
watch(spreadsheetRefEAF, emitRefsReady);
watch(spreadsheetRefBOF, emitRefsReady);
watch(spreadsheetRefAOD, emitRefsReady);

defineExpose({
  spreadsheetRefDS,
  spreadsheetRefIF,
  spreadsheetRefEAF,
  spreadsheetRefBOF,
  spreadsheetRefAOD,
  dsTableWrapper,
  ifTableWrapper,
  eafTableWrapper,
  bofTableWrapper,
  aodTableWrapper
});
</script>

<style lang="scss" scoped>
.form-layout {
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: auto;
  display: flex;
  flex-direction: column;
  overflow-y: visible;
  overflow-x: hidden;
  position: relative;
}

.area-1 {
  height: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-2,
.area-3,
.area-4,
.area-5 {
  height: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.top-container {
  height: 100%;
  display: flex;
  gap: 15px;
  flex: 1;
}

.base-info-section {
  flex: 0 0 40%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-header {
  font-size: 15px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.info-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.info-row {
  display: flex;
  gap: 12px;
  flex: 1;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  max-height: 36px;
}

.info-label {
  font-weight: bold;
  color: #333;
  position: relative;
  flex-shrink: 0;

  &.required::after {
    content: '*';
    color: #ff4d4f;
    margin-left: 4px;
  }
}

.info-value {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  line-height: 18px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-panel {
  flex: 0 0 60%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.button-row {
  flex: 1;
  display: flex;
  gap: 8px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  overflow: hidden;

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
  overflow: visible;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: auto;
  position: relative;
}

.formula-content {
  flex: 1;
  display: flex;
  gap: 8px;
  overflow: visible;
  height: 100%;
}

.vertical-title {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.vertical-title.eaf-title {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.vertical-title.aod-title {
  background: linear-gradient(135deg, #20c997 0%, #12b886 100%);
}

.vertical-title.bof-title {
  background: linear-gradient(135deg, #4d96ff 0%, #3578e5 100%);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: white;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 3px;
  padding: 15px 8px;
  text-align: center;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: auto;
  min-width: 0;
}

.spreadsheet-wrapper {
  flex: 1;
  border-radius: 4px;
  overflow: visible;
  height: auto;
  width: 100%;
  min-width: 0;
}

.audit-watermark {
  position: absolute;
  top: 50%;
  left: 66%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 72px;
  font-weight: bold;
  color: rgba(255, 0, 0, 0.15);
  border: 4px solid rgba(255, 0, 0, 0.15);
  padding: 12px 36px;
  border-radius: 12px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
  user-select: none;
}

.form-select.readonly-field {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 13px;
  color: #333;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:disabled {
    background-color: transparent !important;
    color: #333 !important;
    opacity: 1 !important;
    cursor: default;
  }
}

@media (max-width: 768px) {
  .form-layout {
    padding: 8px;
  }

  .info-row {
    flex-direction: column;
    gap: 8px;
  }

  .info-item {
    flex: 1 1 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .info-label {
    margin-bottom: 4px;
  }

  .vertical-text {
    writing-mode: horizontal-tb;
    padding: 8px 15px;
  }

  .button-row {
    flex-direction: column;
  }

  .formula-content {
    flex-direction: column;
  }

  .form-select {
    width: 100%;
    padding: 5px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    font-size: 13px;
    height: 28px;
    line-height: 18px;
    color: #333;
  }
}
</style>
