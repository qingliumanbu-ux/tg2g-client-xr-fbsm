<template>
  <xr-ef-form @ready="efFormReady" @closeDialog="closeEfDialog" :in-dialog-form-name="'FBSM15ZS2N'"
    :show-close-button="false">
    <template v-if="showContent">
      <!-- 配料单主区域，分为5个区域 -->
      <div class="form-layout" @click="handleFormClick">
        <!-- 区域1：基本信息 + 操作按钮 (15%) -->
        <div class="area-1" style="height:15%">
          <div class="top-container">
            <!-- 基本信息区域 (左侧50%) -->
            <div class="base-info-section" style="width:30%">

              <div class="info-grid">
                <!-- 第一行：三列 -->
                <div class="info-row">
                  <div class="info-item">
                    <div class="info-label required">配料单号</div>
                    <div class="info-value">{{ form.composeListNo }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label required">工艺路线</div>
                    <div class="info-value">
                      <select v-model="form.backlogEa" class="form-select readonly-field" disabled>
                        <option v-for="item in processRouteDataSource" :key="item.seq_id" :value="item.seq_id">
                          {{ item.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label required">出钢记号</div>
                    <div class="info-value">{{ form.stNo }}</div>
                  </div>
                </div>
                <!-- 第二行：三列 -->
                <div class="info-row">
                  <div class="info-item">
                    <div class="info-label required">中类代码</div>
                    <div class="info-value">
                      <select v-model="form.materialCode" class="form-select readonly-field" disabled>
                        <option v-for="item in middleCategoryDataSource" :key="item.seq_id" :value="item.seq_id">
                          {{ item.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label required">总炉数</div>
                    <div class="info-value">{{ form.furnaceCount || '0' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label required">配料日期</div>
                    <div class="info-value">{{ form.createDate || '2024-01-01' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮区域 (右侧50%) -->
            <div class="action-panel" style="width:70%">

              <div class="button-row">
                <button class="btn btn-info" @click="refreshFormula">
                  刷新<br>数据
                </button>
                <button class="btn btn-primary" @click="showProcessData">
                  过程<br>数据
                </button>
                <button class="btn btn-success" @click="showStock">
                  库存<br>查询
                </button>
                <button class="btn btn-warning" @click="showHistory">
                  导入<br>模板
                </button>
                <button class="btn btn-info" @click="saveToTemplate">
                  存为<br>模板
                </button>

                <button class="btn btn-primary" @click="saveFormula">
                  保存
                </button>
                <button class="btn btn-success" @click="checkFormula">
                  审核
                </button>
                <button class="btn btn-warning" @click="nocheckFormula">
                  取消<br>审核
                </button>
                <button class="btn btn-primary" @click="exportFormula">
                  导出
                </button>
                <button class="btn btn-info" @click="modelcol">
                  模型<br>计算
                </button>
                <!--button class="btn btn-secondary" @click="printFormula">
                  <span class="btn-icon">🖨️</span> 打印
                </button-->
              </div>
            </div>
          </div>
        </div>


        <!-- 区域2：IF配料单 (20%) -->
        <div class="area-2" v-if="hasIFMaterialData">
          <div class="formula-section">
            <!-- 左侧竖排标题 + 右侧表格 -->
            <div class="formula-content">
              <!-- 左侧竖排标题 -->
              <div class="vertical-title">
                <div class="vertical-text">IF配料单</div>
              </div>

              <!-- 右侧表格区域 -->
              <div class="table-container">
                <!-- Spreadsheet 组件 -->
                <div class="spreadsheet-wrapper" ref="ifTableWrapper">
                  <Spreadsheet ref="spreadsheetRefIF" :initial-rows="4" :initial-columns="24" :row-height="22"
                    :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels"
                    :column-width="columnWidths" :data="materialDataIF" :protected-rows="protectedRowsIF"
                    :protected-columns="protectedColumnsIF" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'IF'" @cell-update="handleCellUpdateIF"
                    @data-change="handleDataChangeIF" @height-change="handleHeightChangeIF"
                    @activated="() => activateSpreadsheet('IF')" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区域3：EAF配料单 (30%) -->
        <div class="area-3" v-if="hasEAFMaterialData">
          <div class="formula-section">
            <!-- 左侧竖排标题 + 右侧表格 -->
            <div class="formula-content">
              <!-- 左侧竖排标题 -->
              <div class="vertical-title eaf-title">
                <div class="vertical-text">EAF配料单</div>
              </div>

              <!-- 右侧表格区域 -->
              <div class="table-container">
                <!-- Spreadsheet 组件 -->
                <div class="spreadsheet-wrapper" ref="eafTableWrapper">
                  <Spreadsheet ref="spreadsheetRefEAF" :initial-rows="6" :initial-columns="24" :row-height="22"
                    :column-width="columnWidths" :data="materialDataEAF" :protected-rows="protectedRowsEAF"
                    :protected-columns="protectedColumnsEAF" :auto-height="true" :showColumnHeaders="false"
                    :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels"
                    :active="activeSpreadsheet === 'EAF'" @cell-update="handleCellUpdateEAF"
                    @data-change="handleDataChangeEAF" @height-change="handleHeightChangeEAF"
                    @activated="() => activateSpreadsheet('EAF')" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区域5：BOF配料单 (25%) -->
        <div class="area-5" v-if="hasBOFMaterialData">
          <div class="formula-section">
            <!-- 左侧竖排标题 + 右侧表格 -->
            <div class="formula-content">
              <!-- 左侧竖排标题 -->
              <div class="vertical-title bof-title">
                <div class="vertical-text">BOF配料单</div>
              </div>

              <!-- 右侧表格区域 -->
              <div class="table-container">
                <!-- Spreadsheet 组件 -->
                <div class="spreadsheet-wrapper" ref="bofTableWrapper">
                  <Spreadsheet ref="spreadsheetRefBOF" :initial-rows="6" :initial-columns="24" :row-height="22"
                    :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels"
                    :column-width="columnWidths" :data="materialDataBOF" :protected-rows="protectedRowsBOF"
                    :protected-columns="protectedColumnsBOF" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'BOF'" @cell-update="handleCellUpdateBOF"
                    @data-change="handleDataChangeBOF" @height-change="handleHeightChangeBOF"
                    @activated="() => activateSpreadsheet('BOF')" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区域4：AOD配料单 (35%) -->
        <div class="area-4" v-if="hasAODMaterialData">
          <div class="formula-section">
            <!-- 左侧竖排标题 + 右侧表格 -->
            <div class="formula-content">
              <!-- 左侧竖排标题 -->
              <div class="vertical-title aod-title">
                <div class="vertical-text">AOD配料单</div>
              </div>

              <!-- 右侧表格区域 -->
              <div class="table-container">
                <!-- Spreadsheet 组件 -->
                <div class="spreadsheet-wrapper" ref="aodTableWrapper">
                  <Spreadsheet ref="spreadsheetRefAOD" :initial-rows="10" :initial-columns="24" :row-height="22"
                    :show-row-checkboxes="true" :non-selectable-row-labels="specialRowLabels"
                    :column-width="columnWidths" :data="materialDataAOD" :protected-rows="protectedRowsAOD"
                    :protected-columns="protectedColumnsAOD" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'AOD'" @cell-update="handleCellUpdateAOD"
                    @data-change="handleDataChangeAOD" @height-change="handleHeightChangeAOD"
                    @activated="() => activateSpreadsheet('AOD')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </xr-ef-form>
  <!-- 库存按钮对应的FBSM13S2N弹窗 -->
  <xr-ef-dialog ref="stockDialogRef" title="原料总库存查询" v-model:visible="stockDialogVisible" width=80% height=95%>
    <FBSM13S2N :openInDialog="true" :parentInfo="stockParentInfo" @getChildInfo="handlestockChildInfo"
      :dialogFormName="stockDialogFormName">
    </FBSM13S2N>
  </xr-ef-dialog>
  <!-- 过程数据对应的FBSM15GS2N弹窗 -->
  <xr-ef-dialog ref="ProcessDataDialogRef" title="过程成分查看" v-model:visible="ProcessDataDialogVisible" width=80%
    height=95%>
    <FBSM15GS2N :openInDialog="true" :parentInfo="ProcessDataParentInfo" @getChildInfo="handleProcessDataChildInfo"
      :dialogFormName="ProcessDataDialogFormName">
    </FBSM15GS2N>
  </xr-ef-dialog>
  <!-- 模板配料单对应的FBSM15MS2N弹窗 -->
  <xr-ef-dialog ref="HistoryDialogRef" title="模板配料单" v-model:visible="HistoryDialogVisible" width=80% height=95%>
    <FBSM15MS2N :openInDialog="true" :parentInfo="HistoryParentInfo" @getChildInfo="handleHistoryChildInfo"
      :dialogFormName="HistoryDialogFormName">
    </FBSM15MS2N>
  </xr-ef-dialog>
</template>

<script setup lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  computed,
  nextTick,
  toRaw,
  watch,
  type Ref
} from "vue";
import {
  EI,
  EIManager
} from "EIX/ei";
import EFUtility from "EFX/EFUtility";
import useI18n from 'EFX/useI18n';
import {
  getAgLocaleText
} from "EFX/locale";
import {
  ER
} from 'ERX/Er';
import {
  SiUtils
} from 'ERX/SiUtils';
import {
  FiUtils
} from 'ERX/FiUtils';
import xrEfForm from "EFX/xrEfForm";
import xrEfFormBase from "EFX/xrEfFormBase";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';
import EFCallForm from 'EFX/EFCallForm';
import eBFR from "EBFR/eBFR";
import FBSM13S2N from "../FBSM13S2N/FBSM13S2N.vue";
import FBSM15GS2N from "../FBSM15GS2N/FBSM15GS2N.vue";
import FBSM15MS2N from "../FBSM15MS2N/FBSM15MS2N.vue";

// 导入 Spreadsheet 组件
import Spreadsheet from './Spreadsheet.vue';
import type { CellData, DataSourceItem, DataSourceConfig, TextAlign } from './Spreadsheet.vue';

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{
  [key: string]: any
}>({});
const efFormIsReady = ref(false);
const showContent = ref(false);

// Spreadsheet 引用 - 三个独立引用
const spreadsheetRefIF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefEAF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefAOD = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefBOF = ref<InstanceType<typeof Spreadsheet>>();

// 当前激活的spreadsheet组件
const activeSpreadsheet = ref<'IF' | 'EAF' | 'AOD' | 'BOF' | null>(null);

// 1. 接收父页面传递的Props参数（与父页面绑定的字段一致）
const props = defineProps({
  visible: { // 弹窗显隐
    type: Boolean,
    default: false
  },
  parentInfo: { // 父页面原始数据（核心）
    type: Object,
    default: () => ({}) // 默认为空对象，避免undefined
  },
  dialogFormName: { // 弹窗标识
    type: String,
    default: ''
  }
})

// 2. 子画面表单响应式数据（定义你需要的字段，驼峰命名符合Vue规范）
const form = reactive({
  composeListNo: '', // 配料单编号（对应父COMPOSE_LIST_NO）
  materialCode: '',  // 物料编码（对应父MATERIAL_CODE）
  commFmlyCode: '',  // 通用品类编码（对应父COMM_FMLY_CODE）
  seqNo: '',         // 序号（对应父SEQ_NO）
  createDate: '',    // 制单日期（父DATE_C+DATE_TIME拼接/转换）
  stNo: '',          // 工位号（对应父ST_NO）
  furnaceCount: 0,   // 炉数（父字符串转数字）
  backlogEa: 0,      // 待处理数量（父字符串转数字）
  parentPage: ''     // 父画面标识（对应父PARENT）
})
const formRef = ref(null) // 表单Ref

// 3. 核心：定义父页面数据转换函数（处理“死数据”，可按需修改规则）
/**
 * 转换父页面原始数据为子画面表单格式
 * @param {Object} rawData 父页面parentInfo原始数据
 * @returns {Object} 转换后的表单数据
 */
const transformParentData = (rawData: Record<string, any>) => {
  // 空值校验：如果父数据为空，直接返回空对象
  if (!rawData || Object.keys(rawData).length === 0) {
    return {}
  }
  // 自定义转换规则（根据你的业务需求修改，这是核心！）
  return {
    // 1. 直接映射（字段重命名/直接赋值）
    composeListNo: rawData.COMPOSE_LIST_NO || '',
    materialCode: rawData.MATERIAL_CODE || '',
    commFmlyCode: rawData.COMM_FMLY_CODE || '',
    seqNo: rawData.SEQ_NO || '',
    stNo: rawData.ST_NO || '',
    parentPage: rawData.PARENT || '',
    furnaceCount: rawData.FURNACE_COUNT || '',
    backlogEa: rawData.BACKLOG_EA || '',
    createDate: rawData.DATE_TIME || '',
    // 可添加更多转换规则：如时间戳转换、字符串截取、字典映射等
  }
}

// 4. 监听父页面parentInfo变化，实时转换并赋值到表单
// （父页面数据更新时，子画面自动同步，弹窗打开时触发）
watch(
  () => props.parentInfo, // 监听Props中的parentInfo
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      // 调用转换函数处理数据
      const transformedData = transformParentData(newVal)
      // 将转换后的数据赋值到表单（覆盖原有数据）
      Object.assign(form, transformedData)
    }
  },
  { deep: true, immediate: true } // 深度监听+立即执行
)

// 5. 向父页面传递弹窗关闭事件（可选，双向绑定用）
const emit = defineEmits(['update:visible'])
const closeEfDialog = () => {
  emit('update:visible', false)
  // 弹窗关闭时重置表单（避免下次打开残留数据）
  Object.assign(form, {
    composeListNo: '', materialCode: '', commFmlyCode: '',
    seqNo: '', createDate: '', stNo: '', furnaceCount: 0,
    backlogEa: 0, parentPage: ''
  })
}


// 激活spreadsheet组件
const activateSpreadsheet = (type: 'IF' | 'EAF' | 'AOD' | 'BOF') => {
  // console.log('激活spreadsheet组件:', type);
  activeSpreadsheet.value = type;

  // 先强制停止所有其他组件的编辑状态
  if (type !== 'IF' && spreadsheetRefIF.value) {
    spreadsheetRefIF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (type !== 'EAF' && spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (type !== 'AOD' && spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (type !== 'BOF' && spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }

  // 延迟设置焦点，确保DOM已更新
  nextTick(() => {
    // 根据类型设置对应的spreadsheet容器焦点
    // 注意：不直接设置容器焦点，避免不必要的滚动
    // Spreadsheet组件在编辑时会自己处理输入框焦点
    // console.log('激活spreadsheet组件完成:', type);
  });
};

// 取消所有spreadsheet的选中状态
const deactivateAllSpreadsheets = () => {
  // console.log('取消所有spreadsheet的选中状态');
  activeSpreadsheet.value = null;

  // 先强制停止所有组件的编辑状态
  if (spreadsheetRefIF.value) {
    spreadsheetRefIF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }

  // 移除所有spreadsheet容器的焦点
  nextTick(() => {
    const containers = document.querySelectorAll('.spreadsheet-container');
    containers.forEach(container => {
      (container as HTMLElement).blur();
    });
  });
};

// 处理表单点击事件
const handleFormClick = (event: MouseEvent) => {
  // 检查点击的是否是spreadsheet组件
  const target = event.target as HTMLElement;
  const isSpreadsheetClick = target.closest('.spreadsheet-container') !== null;

  if (!isSpreadsheetClick) {
    deactivateAllSpreadsheets();
  }
};

// 表格容器引用
const ifTableWrapper = ref<HTMLElement>();
const eafTableWrapper = ref<HTMLElement>();
const aodTableWrapper = ref<HTMLElement>();
const bofTableWrapper = ref<HTMLElement>();

// ========== IF配料单数据 ==========
const materialDataIF = ref<CellData[][]>([]);

// 特殊行标签，这些行不是物料数据行
const specialRowLabels = ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注', '预溶液成分'];

// 检查是否有物料数据（不包括表头和特殊行）
const hasIFMaterialData = computed(() => {
  if (materialDataIF.value.length <= 1) return false; // 只有表头或为空

  for (let row = 1; row < materialDataIF.value.length; row++) {
    const firstCellValue = materialDataIF.value[row][0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      continue; // 跳过特殊行
    }
    // 检查第一列是否有值（物料名称）
    if (firstCellValue && firstCellValue.trim() !== '') {
      return true; // 找到物料数据行
    }
  }
  return false;
});

// IF列配置（调整顺序，新增批次号列）
const columnWidths = ref<number[]>([
  200,  // 0: 物料名称
  80,  // 1: 库区
  60,   // 2: 重量(t)
  50,   // 3: C%
  50,   // 4: Si%
  50,   // 5: Mn%
  60,   // 6: P%
  60,   // 7: S%
  50,   // 8: Cr%
  50,   // 9: Ni%
  50,   // 10: Mo%
  50,   // 11: Cu%
  50,   // 12: Co%
  100,  // 13: 物料代码
  100,  // 14: 批次号
  45,   // 15: Al%
  45,  // 16: Nb%
  45,  // 16: V%
  45,  // 16: Ti%
  45,  // 16: B%
  45,  // 16: N%
  45,  // 16: Ca%
  0, //物料属性
  0 //物料收得率
]);

// IF物料名称数据源
const materialDataSourceIF: Ref<DataSourceItem[]> = ref([
  { seq_id: 'MAT001', name: '中镍生铁（印尼）', code: 'MAT001', category: '生铁', storageArea: '高位', batchNumber: 'BATCH-IF-001', c: 2.37, si: 0.1, mn: 0, p: 0.025, s: 0.33, cr: 0.27, ni: 11.17, mo: 0, cu: 0, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
  { seq_id: 'MAT002', name: '进口高铬', code: 'MAT002', category: '铬铁', storageArea: '低位', batchNumber: 'BATCH-IF-002', c: 7, si: 1.2, mn: 0, p: 0.025, s: 0.03, cr: 68.5, ni: 0, mo: 0, cu: 0, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);


// ========== EAF配料单数据 ==========
const materialDataEAF = ref<CellData[][]>([]);

// 检查是否有物料数据（不包括表头和特殊行）
const hasEAFMaterialData = computed(() => {
  if (materialDataEAF.value.length <= 1) return false; // 只有表头或为空

  for (let row = 1; row < materialDataEAF.value.length; row++) {
    const firstCellValue = materialDataEAF.value[row][0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      continue; // 跳过特殊行
    }
    // 检查第一列是否有值（物料名称）
    if (firstCellValue && firstCellValue.trim() !== '') {
      return true; // 找到物料数据行
    }
  }
  return false;
});


// EAF物料名称数据源
const materialDataSourceEAF: Ref<DataSourceItem[]> = ref([
  { seq_id: 'MAT101', name: '废钢', code: 'MAT101', category: '废钢', storageArea: '废钢区', batchNumber: 'BATCH-EAF-001', c: 0.15, si: 0.2, mn: 0.5, p: 0.02, s: 0.025, cr: 18.5, ni: 8.5, mo: 0.2, cu: 0.3, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
  { seq_id: 'MAT102', name: '高碳铬铁', code: 'MAT102', category: '铬铁', storageArea: '合金区', batchNumber: 'BATCH-EAF-002', c: 6.5, si: 1.5, mn: 0, p: 0.03, s: 0.02, cr: 65.0, ni: 0, mo: 0, cu: 0, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);

// ========== AOD配料单数据 ==========
const materialDataAOD = ref<CellData[][]>([]);

// 检查是否有物料数据（不包括表头和特殊行）
const hasAODMaterialData = computed(() => {
  if (materialDataAOD.value.length <= 1) return false; // 只有表头或为空

  for (let row = 1; row < materialDataAOD.value.length; row++) {
    const firstCellValue = materialDataAOD.value[row][0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      continue; // 跳过特殊行
    }
    // 检查第一列是否有值（物料名称）
    if (firstCellValue && firstCellValue.trim() !== '') {
      return true; // 找到物料数据行
    }
  }
  return false;
});



// ========== BOF配料单数据 ==========
const materialDataBOF = ref<CellData[][]>([]);

// 检查是否有物料数据（不包括表头和特殊行）
const hasBOFMaterialData = computed(() => {
  if (materialDataBOF.value.length <= 1) return false; // 只有表头或为空

  for (let row = 1; row < materialDataBOF.value.length; row++) {
    const firstCellValue = materialDataBOF.value[row][0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      continue; // 跳过特殊行
    }
    // 检查第一列是否有值（物料名称）
    if (firstCellValue && firstCellValue.trim() !== '') {
      return true; // 找到物料数据行
    }
  }
  return false;
});


// AOD物料名称数据源
const materialDataSourceAOD: Ref<DataSourceItem[]> = ref([
  { seq_id: 'MAT201', name: '高碳铬铁', code: 'MAT201', category: '铬铁', storageArea: '合金区', batchNumber: 'BATCH-AOD-001', c: 7.2, si: 1.8, mn: 0.5, p: 0.025, s: 0.02, cr: 62.0, ni: 0, mo: 0, cu: 0.1, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
  { seq_id: 'MAT202', name: '镍铁', code: 'MAT202', category: '镍铁', storageArea: '镍铁区', batchNumber: 'BATCH-AOD-002', c: 2.5, si: 1.2, mn: 0.8, p: 0.015, s: 0.01, cr: 1.5, ni: 20.5, mo: 0.1, cu: 0.2, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);


// ========== BOF配料单数据 ==========
// BOF物料名称数据源
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([
  { seq_id: 'MAT301', name: '废钢', code: 'MAT301', category: '废钢', storageArea: '废钢区', batchNumber: 'BATCH-BOF-001', c: 0.15, si: 0.2, mn: 0.5, p: 0.02, s: 0.025, cr: 18.5, ni: 8.5, mo: 0.2, cu: 0.3, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
  { seq_id: 'MAT302', name: '铁水', code: 'MAT302', category: '铁水', storageArea: '铁水区', batchNumber: 'BATCH-BOF-002', c: 4.2, si: 0.4, mn: 0.3, p: 0.12, s: 0.03, cr: 0.1, ni: 0.1, mo: 0, cu: 0.05, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);

// 备注信息
const remarkInfoIF = ref(' ');
const remarkInfoEAF = ref(' ');
const remarkInfoAOD = ref(' ');
const remarkInfoBOF = ref(' ');

// 收得率系数（初始化时加载）
// 数组结构：[重量收得率, C%收得率, Si%收得率, Mn%收得率, P%收得率, S%收得率, Cr%收得率, Ni%收得率, Mo%收得率, Cu%收得率, Co%收得率, Al%收得率, Nb%收得率, V%收得率, Ti%收得率, B%收得率, N%收得率, Ca%收得率]
const eafYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // EAF收得率系数数组
const aodYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // AOD收得率系数数组
const bofYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // BOF收得率系数数组
const ifYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // BOF收得率系数数组

const aodY = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

//配料重量到出钢重量的收得率
const weightYield = ref([1, 1, 1, 1]);

// AOD内控标准（初始化时加载）
const aodControlUpper = ref([3.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co% 上限
const aodControlTarget = ref([3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // 目标值
const aodControlLower = ref([2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // 下限

// 表格高度变化处理
const handleHeightChangeIF = (height: number) => {
  // console.log('IF表格高度变化:', height);
  // 可以在这里调整区域高度，或者直接让表格撑开区域
};

const handleHeightChangeEAF = (height: number) => {
  // console.log('EAF表格高度变化:', height);
};

const handleHeightChangeAOD = (height: number) => {
  // console.log('AOD表格高度变化:', height);
};

// 配料单类型
type FormulaType = 'IF' | 'EAF' | 'AOD' | 'BOF';

// 动态数据源定义
const storageAreaDataSourceIF = ref<DataSourceItem[]>([]);
const storageAreaDataSourceEAF = ref<DataSourceItem[]>([]);
const storageAreaDataSourceAOD = ref<DataSourceItem[]>([]);
const storageAreaDataSourceBOF = ref<DataSourceItem[]>([]);
const middleCategoryDataSource = ref<DataSourceItem[]>([]);// 中类代码数据源
const processRouteDataSource = ref<DataSourceItem[]>([]);// 工艺路线数据源

// 数据源配置映射
const dataSourceConfigs = {
  IF: {
    material: materialDataSourceIF,
    storageArea: storageAreaDataSourceIF
  },
  EAF: {
    material: materialDataSourceEAF,
    storageArea: storageAreaDataSourceEAF
  },
  AOD: {
    material: materialDataSourceAOD,
    storageArea: storageAreaDataSourceAOD
  },
  BOF: {
    material: materialDataSourceBOF,
    storageArea: storageAreaDataSourceBOF
  }
};

// 辅助函数：创建物料名称单元格（带数据源）
const createMaterialNameCell = (value: string = '', formulaType: FormulaType = 'IF'): CellData => {

  const dataSource = dataSourceConfigs[formulaType].material;
  return {
    value,
    format: 'text',
    alignment: 'left' as TextAlign,
    dataSource: {
      data: dataSource.value,
      displayField: 'name',
      valueField: 'name',
      searchable: true,
      columns: ['storageArea', 'name', 'code', 'batchNumber', 'c', 'si', 'mn', 'p', 's', 'cr', 'ni', 'mo', 'cu', 'co', 'al', 'nb', 'v', 'ti', 'b', 'n', 'ca', 'mat_yeild'],
      title: '选择物料'
    }
  };
};

// 辅助函数：创建库区单元格（带数据源）
const createStorageAreaCell = (value: string = '', formulaType: FormulaType = 'IF'): CellData => {
  const dataSource = dataSourceConfigs[formulaType].storageArea.value;
  return {
    value,
    format: 'text',
    alignment: 'center' as TextAlign,
    // dataSource: {
    //   data: dataSource,
    //   displayField: 'name',
    //   valueField: 'seq_id',
    //   searchable: true,
    //   columns: ['seq_id', 'name', 'description'],
    //   title: '选择库区'
    // }
  };
};

// 辅助函数：创建物料代码单元格（只读，根据物料名称自动填充）
const createMaterialCodeCell = (value: string = ''): CellData => {
  return {
    value,
    format: 'text',
    alignment: 'center' as TextAlign,
    isProtected: true // 设置为受保护，只能通过物料名称选择自动填充
  };
};

// 辅助函数：创建批次号单元格
const createBatchNumberCell = (value: string = ''): CellData => {
  return {
    value,
    format: 'text',
    alignment: 'center' as TextAlign
  };
};

// 辅助函数：创建数字单元格
const createNumberCell = (value: string | number = '', alignment: TextAlign = 'right'): CellData => {
  return {
    value: String(value),
    format: 'number',
    alignment
  };
};

// 辅助函数：根据物料名称查找物料代码
const findMaterialCodeByName = (materialName: string, formulaType: FormulaType = 'IF'): string => {
  const dataSource = dataSourceConfigs[formulaType].material;
  const material = dataSource.value.find(item => item.name === materialName);
  return material?.code || '';
};

// 辅助函数：根据物料名称查找物料完整信息
const findMaterialByName = (materialName: string, formulaType: FormulaType = 'IF'): DataSourceItem | null => {
  const dataSource = dataSourceConfigs[formulaType].material;
  const material = dataSource.value.find(item => item.name === materialName);
  return material || null;
};

/**
 * 将数据源数组添加到物料数据中
 * @param target 目标物料数据引用（如 materialDataIF）
 * @param data 数据源数组，格式为 [{Mat_name:'',StorageArea:'',Weight:'',C:'',Si:'',...}]
 * @param formulaType 配料单类型：'IF' | 'EAF' | 'AOD' | 'BOF'
 * @param clearExisting 是否清除现有数据行（默认true）
 * @param skipRecalculate 是否跳过重新计算特殊行（默认false）
 */
const addMaterialDataFromSource = (
  target: Ref<CellData[][]>,
  data: Array<{
    Mat_name: string;
    StorageArea: string;
    Weight: string;
    C: string;
    Si: string;
    Mn: string;
    P: string;
    S: string;
    Cr: string;
    Ni: string;
    Mo: string;
    Cu: string;
    Co: string;
    Mat_code: string;
    Batch_no: string;
    Al: string;
    Nb: string;
    V: string;
    Ti: string;
    B: string;
    N: string;
    Ca: string;
    back_c2: string;
    mat_yeild: number;
  }>,
  formulaType: FormulaType,
  clearExisting: boolean = true,
  skipRecalculate: boolean = false
) => {
  // console.log(`开始添加物料数据到${formulaType}配料单，数据行数：${data.length}`);

  // 创建固定表头行的辅助函数
  const createFixedHeaderRow = (): CellData[] => {
    return [
      { value: '物料名称', format: 'text', fontWeight: 'bold', alignment: 'left', isProtected: true },
      { value: '库区', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '重量(t)', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'C%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Si%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Mn%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'P%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'S%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Cr%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ni%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Mo%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Cu%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Co%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '物料代码', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '批次号', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Al%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Nb%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'V%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ti%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'B%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'N%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ca%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '物料属性', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '物料收得率', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true }
    ];
  };

  // 如果目标数据为空，自动创建表头行
  if (!target.value || target.value.length === 0) {
    // console.log(`目标物料数据为空，自动创建${formulaType}配料单固定表头`);
    target.value = [createFixedHeaderRow()];
  }

  // 获取当前数据副本
  const currentData = [...target.value];

  // 检查第一行是否是有效的表头行（第一个单元格值应为"物料名称"）
  let headerRow: CellData[];
  const firstRowFirstCellValue = currentData[0]?.[0]?.value;
  const isHeaderRow = typeof firstRowFirstCellValue === 'string' && firstRowFirstCellValue === '物料名称';

  if (isHeaderRow) {
    // 第一行是有效的表头行
    headerRow = currentData[0];
  } else {
    // 第一行不是表头行，创建新的表头行
    headerRow = createFixedHeaderRow();
    // 如果第一行存在且不是表头，需要将其作为数据行或特殊行处理
    // 这将在后续逻辑中处理
  }

  // 识别并保存特殊行（配料成分、出钢成分、备注等）
  const specialRows: CellData[][] = [];
  for (let i = 0; i < currentData.length; i++) {
    // 跳过表头行（如果是有效的表头行且i=0）
    if (i === 0 && isHeaderRow) {
      continue;
    }
    const firstCellValue = currentData[i][0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      specialRows.push(currentData[i]);
    }
  }

  // 构建新的数据行
  const newDataRows: CellData[][] = [];

  // 添加表头行
  newDataRows.push(headerRow);

  // 如果clearExisting为false，保留现有的非特殊数据行
  if (!clearExisting) {
    const startIndex = isHeaderRow ? 1 : 0; // 如果第一行是表头，从第1行开始；否则从第0行开始
    for (let i = startIndex; i < currentData.length; i++) {
      const firstCellValue = currentData[i][0]?.value;
      if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
        continue; // 跳过特殊行，后面会统一添加
      }
      // 保留现有数据行（非特殊行）
      newDataRows.push(currentData[i]);
    }
  }

  // 添加新的数据行
  data.forEach(item => {
    const row: CellData[] = [
      createMaterialNameCell(item.Mat_name, formulaType),        // 列0: 物料名称
      createStorageAreaCell(item.StorageArea, formulaType),     // 列1: 库区
      createNumberCell(item.Weight),                            // 列2: 重量(t)
      createNumberCell(item.C),                                 // 列3: C%
      createNumberCell(item.Si),                                // 列4: Si%
      createNumberCell(item.Mn),                                // 列5: Mn%
      createNumberCell(item.P),                                 // 列6: P%
      createNumberCell(item.S),                                 // 列7: S%
      createNumberCell(item.Cr),                                // 列8: Cr%
      createNumberCell(item.Ni),                                // 列9: Ni%
      createNumberCell(item.Mo),                                // 列10: Mo%
      createNumberCell(item.Cu),                                // 列11: Cu%
      createNumberCell(item.Co),                                // 列12: Co%
      createMaterialCodeCell(item.Mat_code),                    // 列13: 物料代码
      createBatchNumberCell(item.Batch_no),                      // 列14: 批次号
      createNumberCell(item.Al),
      createNumberCell(item.Nb),
      createNumberCell(item.V),
      createNumberCell(item.Ti),
      createNumberCell(item.B),
      createNumberCell(item.N),
      createNumberCell(item.Ca),
      createBatchNumberCell(item.back_c2),
      createNumberCell(item.mat_yeild)
    ];
    newDataRows.push(row);
  });

  // 添加特殊行（保持原有顺序）
  specialRows.forEach(row => {
    newDataRows.push(row);
  });

  // 更新目标数据
  target.value = newDataRows;

  console.log(`${formulaType}配料单数据更新完成，总行数：${newDataRows.length}`);

  // 触发重新计算特殊行（如果不需要跳过）
  if (!skipRecalculate) {
    switch (formulaType) {
      case 'IF':
        addWeightedAverageRowIF();
        break;
      case 'EAF':
        addWeightedAverageRowEAF();
        addSteelmakingRowEAF();
        break;
      case 'BOF':
        addWeightedAverageRowBOF();
        addSteelmakingRowBOF();
        break;
      case 'AOD':
        updatePreSolutionRowAOD();
        recalculateAndReorderAODRows();
        // addSteelmakingRowAOD();
        break;

    }
  }
};


// 初始化IF物料数据
const initMaterialDataIF = async () => {
  //console.log('初始化IF物料数据');

  // 清空现有数据
  materialDataIF.value = [];

  // 示例数据源，格式符合 addMaterialDataFromSource 要求
  const sourceDataIF = [
    {
      Mat_name: '中镍生铁（印尼）',
      StorageArea: '高位',
      Weight: '30',
      C: '2.37',
      Si: '0.1',
      Mn: '0',
      P: '0.025',
      S: '0.33',
      Cr: '0.27',
      Ni: '11.17',
      Mo: '0',
      Cu: '0',
      Co: '0',
      Mat_code: 'MAT02',
      Batch_no: 'BATCH-IF-001',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    },
    {
      Mat_name: '进口高铬',
      StorageArea: '低位',
      Weight: '15',
      C: '7',
      Si: '1.2',
      Mn: '0',
      P: '0.025',
      S: '0.03',
      Cr: '68.5',
      Ni: '0',
      Mo: '0',
      Cu: '0',
      Co: '0',
      Mat_code: 'MAT002',
      Batch_no: 'BATCH-IF-002',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    }
  ];
  addMaterialDataFromSource(materialDataIF, sourceDataIF, 'IF', true, false);
  materialDataIF.value.push(createRemarkRow('备注', remarkInfoIF));

};

// 初始化EAF物料数据
const initMaterialDataEAF = () => {
  // console.log('初始化EAF物料数据');

  // 清空现有数据
  materialDataEAF.value = [];

  // 示例数据源，格式符合 addMaterialDataFromSource 要求
  const sourceDataEAF = [
    {
      Mat_name: '废钢',
      StorageArea: '废钢区',
      Weight: '45',
      C: '0.15',
      Si: '0.02',
      Mn: '0.05',
      P: '0.02',
      S: '0.025',
      Cr: '18.5',
      Ni: '8.5',
      Mo: '0.2',
      Cu: '0.3',
      Co: '0',
      Mat_code: 'MAT101',
      Batch_no: 'BATCH-EAF-001',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    },
    {
      Mat_name: '高碳铬铁',
      StorageArea: '合金区',
      Weight: '25',
      C: '6.5',
      Si: '1.5',
      Mn: '0',
      P: '0.03',
      S: '0.02',
      Cr: '65.0',
      Ni: '0',
      Mo: '0',
      Cu: '0',
      Co: '0',
      Mat_code: 'MAT102',
      Batch_no: 'BATCH-EAF-002',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    },
    {
      Mat_name: '硅铁',
      StorageArea: '合金区',
      Weight: '5',
      C: '0.1',
      Si: '75.0',
      Mn: '0.3',
      P: '0.02',
      S: '0.01',
      Cr: '0.1',
      Ni: '0',
      Mo: '0',
      Cu: '0',
      Co: '0',
      Mat_code: 'MAT103',
      Batch_no: 'BATCH-EAF-003',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    }
  ];

  // 使用 addMaterialDataFromSource 添加数据（自动创建表头、添加数据行、计算配料成分和出钢成分）
  // clearExisting: true - 清除现有数据行（当前为空，不影响）
  // skipRecalculate: false - 触发重新计算配料成分行和出钢成分行
  addMaterialDataFromSource(materialDataEAF, sourceDataEAF, 'EAF', true, false);
  materialDataEAF.value.push(createRemarkRow('备注', remarkInfoEAF));
};

// 初始化AOD物料数据
const initMaterialDataAOD = () => {
  // console.log('初始化AOD物料数据');

  // 清空现有数据
  materialDataAOD.value = [];

  // 先手动创建表头行（确保表头存在）
  materialDataAOD.value.push([
    { value: '物料名称', format: 'text', fontWeight: 'bold', alignment: 'left', isProtected: true },
    { value: '库区', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '重量(t)', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'C%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Si%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Mn%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'P%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'S%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Cr%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Ni%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Mo%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Cu%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Co%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '物料代码', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '批次号', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Al%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Nb%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'V%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Ti%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'B%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'N%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: 'Ca%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '物料属性', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '物料收得率', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true }
  ]);

  // 添加预溶液成分行（作为特殊行参与计算，插入到表头行之后）
  updatePreSolutionRowAOD(true); // 跳过重新计算

  // 示例数据源，格式符合 addMaterialDataFromSource 要求
  const sourceDataAOD = [
    {
      Mat_name: '高碳铬铁',
      StorageArea: '合金区',
      Weight: '35',
      C: '7.2',
      Si: '1.8',
      Mn: '0.5',
      P: '0.025',
      S: '0.02',
      Cr: '62',
      Ni: '0',
      Mo: '0',
      Cu: '0.1',
      Co: '0',
      Mat_code: 'MAT201',
      Batch_no: 'BATCH-AOD-001',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    }
  ];

  // 使用 addMaterialDataFromSource 添加数据（保留现有表头和预溶液成分行）
  // clearExisting: false - 保留现有数据行（包括表头和预溶液成分行）
  // skipRecalculate: false - 触发重新计算配料成分行和出钢成分行
  addMaterialDataFromSource(materialDataAOD, sourceDataAOD, 'AOD', false, false);

  // 更新预溶液成分行（初始化时配料成分已计算完成）
  updatePreSolutionRowAOD(true);

  // console.log('AOD物料数据初始化完成');
};

// 初始化BOF物料数据
const initMaterialDataBOF = () => {
  // console.log('初始化BOF物料数据');

  // 清空现有数据
  materialDataBOF.value = [];

  // 示例数据源，格式符合 addMaterialDataFromSource 要求
  const sourceDataBOF = [
    {
      Mat_name: '废钢',
      StorageArea: '废钢区',
      Weight: '50',
      C: '0.15',
      Si: '0.2',
      Mn: '0.5',
      P: '0.02',
      S: '0.025',
      Cr: '18.5',
      Ni: '8.5',
      Mo: '0.2',
      Cu: '0.3',
      Co: '0',
      Mat_code: 'MAT301',
      Batch_no: 'BATCH-BOF-001',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    },
    {
      Mat_name: '铁水',
      StorageArea: '铁水区',
      Weight: '30',
      C: '4.2',
      Si: '0.4',
      Mn: '0.3',
      P: '0.12',
      S: '0.03',
      Cr: '0.1',
      Ni: '0.1',
      Mo: '0',
      Cu: '0.05',
      Co: '0',
      Mat_code: 'MAT302',
      Batch_no: 'BATCH-BOF-002',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    },
    {
      Mat_name: '高碳铬铁',
      StorageArea: '合金区',
      Weight: '20',
      C: '6.5',
      Si: '1.5',
      Mn: '0',
      P: '0.03',
      S: '0.02',
      Cr: '65.0',
      Ni: '0',
      Mo: '0',
      Cu: '0',
      Co: '0',
      Mat_code: 'MAT303',
      Batch_no: 'BATCH-BOF-003',
      Al: '0',
      Nb: '0',
      V: '0',
      Ti: '0',
      B: '0',
      N: '0',
      Ca: '0',
      back_c2: '8',
      mat_yeild: 100
    }
  ];

  // 使用 addMaterialDataFromSource 添加数据（自动创建表头、添加数据行、计算配料成分和出钢成分）
  // clearExisting: true - 清除现有数据行（当前为空，不影响）
  // skipRecalculate: false - 触发重新计算配料成分行和出钢成分行
  addMaterialDataFromSource(materialDataBOF, sourceDataBOF, 'BOF', true, false);
  materialDataBOF.value.push(createRemarkRow('备注', remarkInfoBOF));

  // BOF初始化完成后，需要更新AOD的预溶液成分行
  // 使用skipRecalculate=true避免循环调用，因为AOD配料成分可能还没有计算完成
  updatePreSolutionRowAOD(true);
};

// 计算加权平均值
const calculateWeightedAverage = (data: CellData[][]): number[] => {
  let totalWeight = 0;
  let totalWeight_cg = 0;
  const weightedSums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%

  // 特殊行标签，遇到这些标签时停止计算（这些是计算结果行，不是物料数据行）
  // 注意：预溶液成分不在此列表中，因为它需要作为物料参与AOD配料单的计算
  const specialRowLabels = ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注'];

  // 从第1行开始（跳过表头），找到第一个特殊行之前的所有行
  for (let row = 1; row < data.length; row++) {
    const firstCellValue = data[row][0]?.value;
    // 如果遇到特殊行标签，停止计算
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      break;
    }

    // 获取重量(t) - 列2
    const weightStr = data[row][2]?.value;
    const weight = parseFloat(weightStr) || 0;
    const mat_yeild = parseFloat(data[row][23]?.value || 100);
    if (weight > 0) {
      if (data[row][22]?.value != '9') //如果是还原硅的情况，重量不参与
      {
        totalWeight_cg += weight * 0.01 * mat_yeild;
        totalWeight += weight;
        // 计算各成分的加权和
        for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
          const componentStr = data[row][col]?.value;
          const component = parseFloat(componentStr) || 0;
          weightedSums[col - 3] += weight * component;
        }
        for (let col = 15; col <= 21; col++) { // 列15-21: al%到Ca%
          const componentStr = data[row][col]?.value;
          const component = parseFloat(componentStr) || 0;
          weightedSums[col - 5] += weight * component;
        }
      }
    }
  }

  // 计算加权平均值
  const averages = [totalWeight]; // 第一个值是总重量,最后一个是计算的重量
  for (let i = 0; i < weightedSums.length; i++) {
    const avg = totalWeight > 0 ? parseFloat((weightedSums[i] / totalWeight).toFixed(3)) : 0;
    averages.push(avg);
  }
  const Weight_cg = totalWeight_cg;
  averages.push(Weight_cg);

  //console.log('=== 开始计算预溶液成分111 ', averages);

  return averages;
};

const calculateWeightedAverageAOD = (data: CellData[][]): number[] => {
  let totalWeight = 0;
  let totalWeight_cg = 0;
  const weightedSums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%

  // 特殊行标签，遇到这些标签时停止计算（这些是计算结果行，不是物料数据行）
  // 注意：预溶液成分不在此列表中，因为它需要作为物料参与AOD配料单的计算
  const specialRowLabels = ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注'];

  // 从第1行开始（跳过表头），找到第一个特殊行之前的所有行
  for (let row = 1; row < data.length; row++) {
    const firstCellValue = data[row][0]?.value;
    // 如果遇到特殊行标签，停止计算
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      break;
    }

    // 获取重量(t) - 列2
    const weightStr = data[row][2]?.value;
    const weight = parseFloat(weightStr) || 0;
    const mat_yeild = parseFloat(data[row][23]?.value || 100);
    if (weight > 0) {
      if (data[row][22]?.value != '9') //如果是还原硅的情况，重量不参与
      {
        totalWeight_cg += weight * 0.01 * mat_yeild;
        totalWeight += weight;
        // 计算各成分的加权和
        for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
          const componentStr = data[row][col]?.value;
          const component = parseFloat(componentStr) || 0;
          if (col === 4) //
          {
            if (data[row][22]?.value == '7') {
              weightedSums[col - 3] += weight * component;
            }

          }
          else {
            weightedSums[col - 3] += weight * component;
          }

        }
        for (let col = 15; col <= 21; col++) { // 列15-21: al%到Ca%
          const componentStr = data[row][col]?.value;
          const component = parseFloat(componentStr) || 0;
          weightedSums[col - 5] += weight * component;
        }
      }
    }
  }

  // 计算加权平均值
  const averages = [totalWeight]; // 第一个值是总重量,最后一个是计算的重量
  for (let i = 0; i < weightedSums.length; i++) {
    const avg = totalWeight > 0 ? parseFloat((weightedSums[i] / totalWeight).toFixed(3)) : 0;
    averages.push(avg);
  }
  const Weight_cg = totalWeight_cg;
  averages.push(Weight_cg);

  //console.log('=== 开始计算预溶液成分111 ', averages);

  return averages;
};

// 计算预溶液成分（IF配料成分、EAF出钢成分和BOF出钢成分的加权平均）
const calculatePreSolutionComponent = (): number[] => {
  // console.log('=== 开始计算预溶液成分 ===');
  // 从IF数据中查找配料成分行
  const ifFormulaIndex = materialDataIF.value.findIndex(row => row[0]?.value === '配料成分');
  // 从EAF数据中查找出钢成分行
  const eafSteelmakingIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '出钢成分');
  // 从BOF数据中查找出钢成分行
  const bofSteelmakingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '出钢成分');

  let totalWeight = 0;
  const weightedSums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%

  // 处理IF配料成分行
  if (ifFormulaIndex !== -1) {
    const ifRow = materialDataIF.value[ifFormulaIndex];
    const weightStr = ifRow[2]?.value; // 列2: 总重量
    const weight = parseFloat(weightStr) || 0;
    if (weight > 0) {
      totalWeight += weight;
      // console.log('添加IF重量后totalWeight:', totalWeight);     
      for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
        const componentStr = ifRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        // 映射到收得率系数数组索引：C%→1
        weightedSums[col - 3] += weight * component * ifYieldRate.value[col - 2];
      }

      for (let col = 15; col <= 21; col++) { // 列15-21: al%到Ca%
        const componentStr = ifRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        weightedSums[col - 5] += (weight * component * ifYieldRate.value[col - 2 - 2]);
      }
    }

    totalWeight = parseFloat((totalWeight * weightYield.value[0] * ifYieldRate.value[0]).toFixed(3));
  }
  // 处理EAF出钢成分行
  if (eafSteelmakingIndex !== -1) {
    const eafRow = materialDataEAF.value[eafSteelmakingIndex];
    const weightStr = eafRow[2]?.value; // 列2: 总重量
    const weight = parseFloat(weightStr) || 0;
    if (weight > 0) {
      totalWeight += weight;
      for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
        const componentStr = eafRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        weightedSums[col - 3] += weight * component;
      }

      for (let col = 15; col <= 21; col++) { // 列15-21: al%到Ca%
        const componentStr = eafRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        weightedSums[col - 5] += weight * component;
      }
    }
  }
  // 处理BOF出钢成分行
  if (bofSteelmakingIndex !== -1) {
    const bofRow = materialDataBOF.value[bofSteelmakingIndex];
    const weightStr = bofRow[2]?.value; // 列2: 总重量
    const weight = parseFloat(weightStr) || 0;
    // console.log('BOF出钢成分重量:', weight, '重量字符串:', weightStr);
    if (weight > 0) {
      totalWeight += weight;
      // console.log('添加BOF重量后totalWeight:', totalWeight);
      for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
        const componentStr = bofRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        weightedSums[col - 3] += weight * component;
      }
      for (let col = 15; col <= 21; col++) { // 列15-21: al%到Ca%
        const componentStr = bofRow[col]?.value;
        const component = parseFloat(componentStr) || 0;
        weightedSums[col - 5] += weight * component;
      }
    }
  } else {
    // console.log('未找到BOF出钢成分行');
    // 调试：输出BOF数据以便检查
    // console.log('BOF数据行数:', materialDataBOF.value.length);
    if (materialDataBOF.value.length > 0) {
      // console.log('BOF第一行第一列:', materialDataBOF.value[0][0]?.value);
      for (let i = 0; i < materialDataBOF.value.length; i++) {
        const rowLabel = materialDataBOF.value[i][0]?.value;
        // console.log(`BOF行${i}标签:`, rowLabel);
      }
    }
  }

  // 计算加权平均值
  const averages = [totalWeight]; // 第一个值是总重量
  for (let i = 0; i < weightedSums.length; i++) {
    const avg = totalWeight > 0 ? weightedSums[i] / totalWeight : 0;
    averages.push(avg);
  }

  if (String(form.backlogEa) === '06' || String(form.backlogEa) === '08')//如果是全脱的直接取表里的预熔液成分
  {
    for (let i = 0; i < aodY.value.length; i++) {
      const avg2 = aodY.value[i];
      averages[i] = avg2;
    }
  }

  // console.log('预溶液计算结果 - 总重量:', totalWeight, '各成分平均值:', averages.slice(1).map(v => v.toFixed(3)));
  // console.log('=== 预溶液计算完成 ===');


  return averages;
};

// 更新AOD预溶液成分行
const updatePreSolutionRowAOD = (skipRecalculate = false) => {
  // console.log('=== 开始更新AOD预溶液行 ===');
  // console.log('skipRecalculate参数:', skipRecalculate);

  // 计算预溶液成分
  const averages = calculatePreSolutionComponent();

  //console.log('预溶液行计算的平均值:', averages);
  // console.log('预溶液总重量:', averages[0]);

  // 构建预溶液成分行（锁定、位于表头后第一行）
  const preSolutionRow: CellData[] = [
    { value: '预溶液成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[11], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[12], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[13], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[14], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[15], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[16], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[17], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%

  ];

  // 查找现有的预溶液成分行
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '预溶液成分');

  if (existingIndex !== -1) {
    // 更新现有行
    materialDataAOD.value[existingIndex] = preSolutionRow;
  } else {
    // 如果不存在，插入到表头行后第一行（行索引1）
    // 确保至少有表头行
    if (materialDataAOD.value.length > 0) {
      materialDataAOD.value.splice(1, 0, preSolutionRow);
    } else {
      materialDataAOD.value.push(preSolutionRow);
    }
  }

  // console.log('AOD预溶液成分行已更新');

  // 如果不需要跳过重新计算，则重新计算AOD配料成分和出钢成分
  if (!skipRecalculate) {
    recalculateAndReorderAODRows();

    // 更新表格数据
    if (spreadsheetRefAOD.value) {
      spreadsheetRefAOD.value.setData(materialDataAOD.value);
    }
  }
};

// IF配料单计算和添加加权平均行
const addWeightedAverageRowIF = () => {
  // 先移除现有的配料成分行（如果有）
  const existingIndex = materialDataIF.value.findIndex(row => row[0]?.value === '配料成分');
  if (existingIndex !== -1) {
    materialDataIF.value.splice(existingIndex, 1);
  }

  // 计算加权平均值
  const averages = calculateWeightedAverage(materialDataIF.value);
  if (averages[0] !== 0) {
    weightYield.value[0] = averages[19] / averages[0];
  }

  const weightAvgRow: CellData[] = [
    { value: '配料成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[11], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[12], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[13], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[14], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[15], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[16], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[17], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
  ];

  // 查找备注行的索引
  const remarkIndex = materialDataIF.value.findIndex(row => row[0]?.value === '备注');
  if (remarkIndex !== -1) {
    // 将配料成分行插入到备注行之前
    materialDataIF.value.splice(remarkIndex, 0, weightAvgRow);
  } else {
    // 如果没有备注行，则添加到末尾
    materialDataIF.value.push(weightAvgRow);
  }

  // 更新AOD预溶液成分行（IF配料成分变化）
  updatePreSolutionRowAOD(); // 默认skipRecalculate=false，会触发重新计算AOD配料成分和出钢成分
};

// EAF配料单计算和添加加权平均行
const addWeightedAverageRowEAF = () => {
  // 先移除现有的配料成分行（如果有）
  const existingIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '配料成分');
  if (existingIndex !== -1) {
    materialDataEAF.value.splice(existingIndex, 1);
  }

  // 计算加权平均值
  const averages = calculateWeightedAverage(materialDataEAF.value);
  if (averages[0] !== 0) {
    weightYield.value[1] = averages[19] / averages[0];
  }

  const weightAvgRow: CellData[] = [
    { value: '配料成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[11], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[12], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[13], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[14], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[15], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[16], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[17], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
  ];

  // 查找备注行的索引
  const remarkIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '备注');
  if (remarkIndex !== -1) {
    // 将配料成分行插入到备注行之前
    materialDataEAF.value.splice(remarkIndex, 0, weightAvgRow);
  } else {
    // 如果没有备注行，则添加到末尾
    materialDataEAF.value.push(weightAvgRow);
  }

  // 更新AOD预溶液成分行（EAF配料成分变化可能导致出钢成分变化）
  updatePreSolutionRowAOD(); // 默认skipRecalculate=false，会触发重新计算AOD配料成分和出钢成分
};

// EAF配料单计算和添加出钢成分行
const addSteelmakingRowEAF = () => {
  // 先移除现有的出钢成分行（如果有）
  const existingIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '出钢成分');
  if (existingIndex !== -1) {
    materialDataEAF.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法计算出钢成分');
    return;
  }

  const formulaRow = materialDataEAF.value[formulaIndex];

  // 出钢成分行：根据配料成分乘以收得率系数
  const steelmakingRow: CellData[] = [
    { value: '出钢成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: ((parseFloat(formulaRow[2]?.value) || 0) * weightYield.value[1] * eafYieldRate.value[0]).toFixed(3), format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量 × 重量收得率系数
  ];

  // 计算各成分的出钢成分（配料成分 × 收得率系数）
  for (let col = 3; col <= 12; col++) { // 列3-11: C%到Co%
    const formulaValue = parseFloat(formulaRow[col]?.value) || 0;
    const yieldRateIndex = col - 2; // 映射到收得率系数数组索引：C%→1, Si%→2, Mn%→3, P%→4, S%→5, Cr%→6, Ni%→7, Mo%→8, Cu%→9
    const steelmakingValue = (formulaValue * eafYieldRate.value[yieldRateIndex] / (weightYield.value[1] * eafYieldRate.value[0])).toFixed(3);

    if (col === 6 || col === 7) {
      steelmakingRow.push({ value: steelmakingValue, format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true });
    }
    else {
      steelmakingRow.push({ value: steelmakingValue, format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
    }
  }

  // 添加空列（库区列和批次号列）
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  for (let col = 15; col <= 21; col++) { // 列15-21: C%到Co%
    const formulaValue = parseFloat(formulaRow[col]?.value) || 0;
    const yieldRateIndex = col - 5; // 映射到收得率系数数组索引：C%→1, Si%→2, Mn%→3, P%→4, S%→5, Cr%→6, Ni%→7, Mo%→8, Cu%→9
    const steelmakingValue = (formulaValue * eafYieldRate.value[yieldRateIndex] / (weightYield.value[1] * eafYieldRate.value[0])).toFixed(3);
    steelmakingRow.push({ value: steelmakingValue, format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 插入到配料成分行之后
  materialDataEAF.value.splice(formulaIndex + 1, 0, steelmakingRow);

  // 更新AOD预溶液成分行（EAF出钢成分变化）
  updatePreSolutionRowAOD(); // 默认skipRecalculate=false，会触发重新计算AOD配料成分和出钢成分
};

// BOF配料单计算和添加加权平均行
const addWeightedAverageRowBOF = () => {
  // 先移除现有的配料成分行（如果有）
  const existingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '配料成分');
  if (existingIndex !== -1) {
    materialDataBOF.value.splice(existingIndex, 1);
  }

  // 计算加权平均值
  const averages = calculateWeightedAverage(materialDataBOF.value);
  if (averages[0] !== 0) {
    weightYield.value[2] = averages[19] / averages[0];
  }

  const weightAvgRow: CellData[] = [
    { value: '配料成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[11], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[12], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[13], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[14], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[15], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[16], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[17], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
  ];

  // 查找备注行的索引
  const remarkIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '备注');
  if (remarkIndex !== -1) {
    // 将配料成分行插入到备注行之前
    materialDataBOF.value.splice(remarkIndex, 0, weightAvgRow);
  } else {
    // 如果没有备注行，则添加到末尾
    materialDataBOF.value.push(weightAvgRow);
  }

  // 更新AOD预溶液成分行（BOF配料成分变化可能导致出钢成分变化）
  updatePreSolutionRowAOD(); // 默认skipRecalculate=false，会触发重新计算AOD配料成分和出钢成分
};

// BOF配料单计算和添加出钢成分行
const addSteelmakingRowBOF = () => {
  // 先移除现有的出钢成分行（如果有）
  const existingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '出钢成分');
  if (existingIndex !== -1) {
    materialDataBOF.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法计算出钢成分');
    return;
  }

  const formulaRow = materialDataBOF.value[formulaIndex];

  // 出钢成分行：根据配料成分乘以收得率系数
  const steelmakingRow: CellData[] = [
    { value: '出钢成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: (parseFloat(formulaRow[2]?.value) || 0) * weightYield.value[2] * bofYieldRate.value[0], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量 × 重量收得率系数
  ];

  // 计算各成分的出钢成分（配料成分 × 收得率系数）
  for (let col = 3; col <= 12; col++) { // 列3-11: C%到Co%
    const formulaValue = parseFloat(formulaRow[col]?.value) || 0;
    const yieldRateIndex = col - 2; // 映射到收得率系数数组索引：C%→1, Si%→2, Mn%→3, P%→4, S%→5, Cr%→6, Ni%→7, Mo%→8, Cu%→9
    const steelmakingValue = (formulaValue * bofYieldRate.value[yieldRateIndex] / (weightYield.value[2] * bofYieldRate.value[0])).toFixed(3);

    if (col === 6 || col === 7) {
      steelmakingRow.push({ value: steelmakingValue, format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true });
    }
    else {
      steelmakingRow.push({ value: steelmakingValue, format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
    }
  }

  // 添加空列（库区列和批次号列）
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  for (let col = 15; col <= 21; col++) { // 列15-21: C%到Co%
    const formulaValue = parseFloat(formulaRow[col]?.value) || 0;
    const yieldRateIndex = col - 5; // 映射到收得率系数数组索引：C%→1, Si%→2, Mn%→3, P%→4, S%→5, Cr%→6, Ni%→7, Mo%→8, Cu%→9
    const steelmakingValue = (formulaValue * eafYieldRate.value[yieldRateIndex] / (weightYield.value[2] * bofYieldRate.value[0])).toFixed(3);
    steelmakingRow.push({ value: steelmakingValue, format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 插入到配料成分行之后
  materialDataBOF.value.splice(formulaIndex + 1, 0, steelmakingRow);

  // 更新AOD预溶液成分行（BOF出钢成分变化）
  updatePreSolutionRowAOD(); // 默认skipRecalculate=false，会触发重新计算AOD配料成分和出钢成分
};

// AOD配料单重新计算和重新排序所有特殊行
const recalculateAndReorderAODRows = () => {
  // 保存备注信息
  const remarkRowIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '备注');
  let remarkValue = '';
  if (remarkRowIndex !== -1 && materialDataAOD.value[remarkRowIndex].length > 1) {
    remarkValue = materialDataAOD.value[remarkRowIndex][1]?.value || '';
  }

  // 确保表头行存在（第一行第一个单元格值应为"物料名称"）
  if (materialDataAOD.value.length === 0 || materialDataAOD.value[0]?.[0]?.value !== '物料名称') {
    // console.log('AOD表头行不存在或无效，自动创建表头行');
    const headerRow: CellData[] = [
      { value: '物料名称', format: 'text', fontWeight: 'bold', alignment: 'left', isProtected: true },
      { value: '库区', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '重量(t)', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'C%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Si%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Mn%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'P%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'S%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Cr%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ni%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Mo%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Cu%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Co%', format: 'number', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '物料代码', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: '批次号', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Al%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Nb%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'V%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ti%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'B%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'N%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
      { value: 'Ca%', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true }
    ];
    // 如果数组为空，添加表头行；如果第一行不是表头，将其插入到第一行
    if (materialDataAOD.value.length === 0) {
      materialDataAOD.value = [headerRow];
    } else {
      materialDataAOD.value.unshift(headerRow);
    }
  }

  // 计算加权平均值
  const averages = calculateWeightedAverageAOD(materialDataAOD.value);
  if (averages[0] !== 0) {
    weightYield.value[3] = averages[19] / averages[0];
  }

  // 构建配料成分行
  const weightAvgRow: CellData[] = [
    { value: '配料成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[11], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[12], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[13], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[14], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[15], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[16], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: averages[17], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
  ];

  // 计算出钢成分行
  const steelmakingRow: CellData[] = [
    { value: '出钢成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: (averages[0] * weightYield.value[3] * aodYieldRate.value[0]).toFixed(3), format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量 × 重量收得率系数
  ];

  // 计算各成分的出钢成分（配料成分 × 收得率系数）
  const baseWeight = averages[0] * weightYield.value[3] * aodYieldRate.value[0];
  const weight = Number(baseWeight.toFixed(3));
  for (let i = 1; i <= 10; i++) { // C%到Co%
    const formulaValue = averages[i] || 0;
    let steelmakingValue = Number(((formulaValue * averages[0] * aodYieldRate.value[i]) / weight).toFixed(3));
    if (i === 1) //C和P使用出钢成分
    {
      steelmakingValue = Number(aodControlTarget.value[0]);
    }
    if (i === 5) //C和P使用出钢成分
    {
      steelmakingValue = Number(aodControlTarget.value[4]);
    }
    const steelmakingNum = steelmakingValue;

    // 检查是否超出内控范围
    let cellStyle = {};
    const controlIndex = i - 1; // 映射到内控数组索引：C%→0, Si%→1, Mn%→2, P%→3, S%→4, Cr%→5, Ni%→6, Mo%→7, Cu%→8
    if (controlIndex >= 0 && controlIndex < aodControlUpper.value.length && controlIndex < aodControlLower.value.length) {
      const upper = aodControlUpper.value[controlIndex];
      const lower = aodControlLower.value[controlIndex];
      if (i === 4 || i === 5) {
        if ((Number(steelmakingNum.toFixed(3)) > Number(upper.toFixed(3)) || Number(steelmakingNum.toFixed(3)) < Number(lower.toFixed(3))) && upper > 0) {
          cellStyle = { color: 'red' };
        }

      }
      else {
        if ((Number(steelmakingNum.toFixed(2)) > Number(upper.toFixed(2)) || Number(steelmakingNum.toFixed(2)) < Number(lower.toFixed(2))) && upper > 0) {
          cellStyle = { color: 'red' };
        }
      }


    }

    if (i === 4 || i === 5) {
      steelmakingRow.push({
        value: steelmakingValue,
        format: 'number:3',
        fontWeight: 'bold',
        alignment: 'right' as TextAlign,
        isProtected: true,
        style: cellStyle
      });
    }
    else {
      steelmakingRow.push({
        value: steelmakingValue,
        format: 'number:2',
        fontWeight: 'bold',
        alignment: 'right' as TextAlign,
        isProtected: true,
        style: cellStyle
      });
    }

  }

  // 添加空列
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  // 计算各成分的出钢成分（配料成分 × 收得率系数）
  for (let i = 11; i <= 17; i++) { // C%到Co%
    const formulaValue = averages[i] || 0;
    const steelmakingValue = Number(((formulaValue * averages[0] * aodYieldRate.value[i]) / weight).toFixed(3));
    const steelmakingNum = steelmakingValue;

    // 检查是否超出内控范围
    let cellStyle = {};
    const controlIndex = i - 1; // 映射到内控数组索引：C%→0, Si%→1, Mn%→2, P%→3, S%→4, Cr%→5, Ni%→6, Mo%→7, Cu%→8
    if (controlIndex >= 0 && controlIndex < aodControlUpper.value.length && controlIndex < aodControlLower.value.length) {
      const upper = aodControlUpper.value[controlIndex];
      const lower = aodControlLower.value[controlIndex];
      if ((Number(steelmakingNum.toFixed(2)) > Number(upper.toFixed(2)) || Number(steelmakingNum.toFixed(2)) < Number(lower.toFixed(2))) && upper > 0) {
        cellStyle = { color: 'red' };
      }
    }

    steelmakingRow.push({
      value: steelmakingValue,
      format: 'number:2',
      fontWeight: 'bold',
      alignment: 'right' as TextAlign,
      isProtected: true,
      style: cellStyle
    });
  }

  // 构建内控行
  const controlUpperRow: CellData[] = [
    { value: '内控上限', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
  ];
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 4) {
      controlUpperRow.push({ value: aodControlUpper.value[i], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true });
    }
    else {
      controlUpperRow.push({ value: aodControlUpper.value[i], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });

    }
  }
  controlUpperRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlUpperRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  for (let i = 10; i < aodControlUpper.value.length; i++) {
    controlUpperRow.push({ value: aodControlUpper.value[i], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  const controlTargetRow: CellData[] = [
    { value: '内控目标', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
  ];
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 4) {
      controlTargetRow.push({ value: aodControlTarget.value[i], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true });

    }
    else {
      controlTargetRow.push({ value: aodControlTarget.value[i], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });

    }
  }
  controlTargetRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlTargetRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  for (let i = 10; i < aodControlTarget.value.length; i++) {
    controlTargetRow.push({ value: aodControlTarget.value[i], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  const controlLowerRow: CellData[] = [
    { value: '内控下限', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
  ];
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 4) {
      controlLowerRow.push({ value: aodControlLower.value[i], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true });

    }
    else {
      controlLowerRow.push({ value: aodControlLower.value[i], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });

    }
  }
  controlLowerRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlLowerRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  for (let i = 10; i < aodControlLower.value.length; i++) {
    controlLowerRow.push({ value: aodControlLower.value[i].toFixed(2), format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 构建备注行
  const remarkRow: CellData[] = [
    { value: '备注', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: remarkInfoAOD.value, format: 'text', alignment: 'left', colspan: 12 },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' },
    { value: '', format: 'text', alignment: 'center' }
  ];

  // 从数据中移除所有特殊行（包括预溶液成分）
  const specialRowLabels = ['预溶液成分', '配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注'];
  const dataRows: CellData[][] = [];

  for (const row of materialDataAOD.value) {
    const firstCellValue = row[0]?.value;
    if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
      continue; // 跳过特殊行
    }
    dataRows.push(row);
  }

  // 按正确顺序重建数组：数据行 + 特殊行
  materialDataAOD.value = [
    ...dataRows,
    weightAvgRow,
    steelmakingRow,
    controlUpperRow,
    controlTargetRow,
    controlLowerRow,
    // remarkRow
  ];

  // 更新预溶液成分行（插入到表头后第一行）
  updatePreSolutionRowAOD(true); // 传递true跳过重新计算，避免循环调用
};

// AOD配料单计算和添加加权平均行
const addWeightedAverageRowAOD = () => {
  // 先移除现有的配料成分行（如果有）
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '配料成分');
  if (existingIndex !== -1) {
    materialDataAOD.value.splice(existingIndex, 1);
  }

  // 计算加权平均值
  const averages = calculateWeightedAverageAOD(materialDataAOD.value);
  if (averages[0] !== 0) {
    weightYield.value[3] = averages[19] / averages[0];
  }

  const weightAvgRow: CellData[] = [
    { value: '配料成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: averages[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: averages[1], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: averages[2], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: averages[3], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: averages[4], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: averages[5], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: averages[6], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: averages[7], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: averages[8], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: averages[9], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: averages[10], format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '', format: 'text', alignment: 'left', isProtected: true }
  ];

  // 查找第一个特殊行的索引（从'出钢成分'开始搜索）
  const specialRowLabels = ['出钢成分', '内控上限', '内控目标', '内控下限', '备注'];
  let firstSpecialRowIndex = -1;

  for (const label of specialRowLabels) {
    const index = materialDataAOD.value.findIndex(row => row[0]?.value === label);
    if (index !== -1) {
      firstSpecialRowIndex = index;
      break;
    }
  }

  if (firstSpecialRowIndex !== -1) {
    // 将配料成分行插入到第一个特殊行之前
    materialDataAOD.value.splice(firstSpecialRowIndex, 0, weightAvgRow);
  } else {
    // 如果没有其他特殊行，则添加到数据行之后（即末尾）
    materialDataAOD.value.push(weightAvgRow);
  }
};

// AOD配料单计算和添加出钢成分行
const addSteelmakingRowAOD = () => {
  // 先移除现有的出钢成分行（如果有）
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '出钢成分');
  if (existingIndex !== -1) {
    materialDataAOD.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法计算出钢成分');
    return;
  }

  const formulaRow = materialDataAOD.value[formulaIndex];

  // 出钢成分行：根据配料成分乘以收得率系数
  const steelmakingRow: CellData[] = [
    { value: '出钢成分', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: (parseFloat(formulaRow[2]?.value) || 0) * weightYield.value[3] * aodYieldRate.value[0], format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量 × 重量收得率系数
  ];

  // 计算各成分的出钢成分（配料成分 × 收得率系数）
  for (let col = 3; col <= 12; col++) { // 列3-11: C%到Co%
    const weigt = parseFloat(formulaRow[col]?.value) || 0;
    const formulaValue = parseFloat(formulaRow[col]?.value) || 0;
    const yieldRateIndex = col - 2; // 映射到收得率系数数组索引：C%→1, Si%→2, Mn%→3, P%→4, S%→5, Cr%→6, Ni%→7, Mo%→8, Cu%→9
    const steelmakingValue = (formulaValue * aodYieldRate.value[yieldRateIndex] / (weightYield.value[3] * aodYieldRate.value[0])).toFixed(3);

    const steelmakingNum = parseFloat(steelmakingValue);

    // 检查是否超出内控范围（如果有内控数据）
    let cellStyle = {};
    const controlIndex = col - 3; // 映射到内控数组索引：C%→0, Si%→1, Mn%→2, P%→3, S%→4, Cr%→5, Ni%→6, Mo%→7, Cu%→8
    if (controlIndex >= 0 && controlIndex < aodControlUpper.value.length && controlIndex < aodControlLower.value.length) {
      const upper = aodControlUpper.value[controlIndex];
      const lower = aodControlLower.value[controlIndex];
      // 如果超出上限或低于下限，设置红色字体
      if (steelmakingNum > upper || steelmakingNum < lower) {
        cellStyle = { color: 'red' };
      }
    }

    if (col === 6 || col === 7) {
      steelmakingRow.push({
        value: steelmakingValue,
        format: 'number:3',
        fontWeight: 'bold',
        alignment: 'right' as TextAlign,
        isProtected: true,
        style: cellStyle

      });
    }
    else {
      steelmakingRow.push({
        value: steelmakingValue,
        format: 'number:2',
        fontWeight: 'bold',
        alignment: 'right' as TextAlign,
        isProtected: true,
        style: cellStyle

      });

    }
  }

  // 添加空列（库区列和批次号列）
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  steelmakingRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  // 插入到配料成分行之后
  materialDataAOD.value.splice(formulaIndex + 1, 0, steelmakingRow);
};

// AOD配料单添加内控上限行
const addControlUpperRowAOD = () => {
  // 先移除现有的内控上限行（如果有）
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控上限');
  if (existingIndex !== -1) {
    materialDataAOD.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法添加内控行');
    return;
  }

  // 内控上限行
  const controlUpperRow: CellData[] = [
    { value: '内控上限', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true }, // 总重量列空
  ];

  // 添加内控上限数值
  for (let i = 0; i < aodControlUpper.value.length; i++) {
    const precision = (i === 3 || i === 4) ? 3 : 2;
    controlUpperRow.push({ value: aodControlUpper.value[i], format: 'number:${precision}', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 添加空列
  controlUpperRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlUpperRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  // 插入到配料成分行之后（在出钢成分行之后）
  const steelmakingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '出钢成分');
  const insertIndex = steelmakingIndex !== -1 ? steelmakingIndex + 1 : formulaIndex + 1;
  materialDataAOD.value.splice(insertIndex, 0, controlUpperRow);
};

// AOD配料单添加内控目标行
const addControlTargetRowAOD = () => {
  // 先移除现有的内控目标行（如果有）
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控目标');
  if (existingIndex !== -1) {
    materialDataAOD.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法添加内控行');
    return;
  }

  // 内控目标行
  const controlTargetRow: CellData[] = [
    { value: '内控目标', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true }, // 总重量列空
  ];

  // 添加内控目标数值
  for (let i = 0; i < aodControlTarget.value.length; i++) {
    const precision = (i === 3 || i === 4) ? 3 : 2;
    controlTargetRow.push({ value: aodControlTarget.value[i], format: 'number:${precision}', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 添加空列
  controlTargetRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlTargetRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  // 插入到内控上限行之后
  const controlUpperIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控上限');
  const insertIndex = controlUpperIndex !== -1 ? controlUpperIndex + 1 : formulaIndex + 1;
  materialDataAOD.value.splice(insertIndex, 0, controlTargetRow);
};

// AOD配料单添加内控下限行
const addControlLowerRowAOD = () => {
  // 先移除现有的内控下限行（如果有）
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控下限');
  if (existingIndex !== -1) {
    materialDataAOD.value.splice(existingIndex, 1);
  }

  // 查找配料成分行的索引
  const formulaIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '配料成分');
  if (formulaIndex === -1) {
    console.warn('未找到配料成分行，无法添加内控行');
    return;
  }

  // 内控下限行
  const controlLowerRow: CellData[] = [
    { value: '内控下限', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true }, // 总重量列空
  ];

  // 添加内控下限数值
  for (let i = 0; i < aodControlLower.value.length; i++) {
    const precision = (i === 3 || i === 4) ? 3 : 2;
    controlLowerRow.push({ value: aodControlLower.value[i], format: 'number:${precision}', fontWeight: 'bold', alignment: 'right', isProtected: true });
  }

  // 添加空列
  controlLowerRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });
  controlLowerRow.push({ value: '', format: 'text', alignment: 'center', isProtected: true });

  // 插入到内控目标行之后
  const controlTargetIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控目标');
  const insertIndex = controlTargetIndex !== -1 ? controlTargetIndex + 1 : formulaIndex + 1;
  materialDataAOD.value.splice(insertIndex, 0, controlLowerRow);
};

// 受保护的行列配置（简化版）
const protectedRowsIF = computed(() => {
  const protectedRows: number[] = [0];
  for (let i = 0; i < materialDataIF.value.length; i++) {
    if (materialDataIF.value[i][0]?.value === '配料成分') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

const protectedRowsEAF = computed(() => {
  const protectedRows: number[] = [0];
  for (let i = 0; i < materialDataEAF.value.length; i++) {
    const rowLabel = materialDataEAF.value[i][0]?.value;
    if (rowLabel === '配料成分' || rowLabel === '出钢成分') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

const protectedRowsAOD = computed(() => {
  const protectedRows: number[] = [0];
  for (let i = 0; i < materialDataAOD.value.length; i++) {
    const rowLabel = materialDataAOD.value[i][0]?.value;
    if (rowLabel === '预溶液成分' || rowLabel === '配料成分' || rowLabel === '出钢成分' ||
      rowLabel === '内控上限' || rowLabel === '内控目标' || rowLabel === '内控下限') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

const protectedRowsBOF = computed(() => {
  const protectedRows: number[] = [0];
  for (let i = 0; i < materialDataBOF.value.length; i++) {
    const rowLabel = materialDataBOF.value[i][0]?.value;
    if (rowLabel === '配料成分' || rowLabel === '出钢成分') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

const protectedColumnsIF = computed(() => []);
const protectedColumnsEAF = computed(() => []);
const protectedColumnsAOD = computed(() => []);
const protectedColumnsBOF = computed(() => []);

// 单元格更新处理
// 标记单元格为已修改（红色样式）
const markCellAsModified = (row: number, col: number, data: CellData[][]) => {
  if (row >= 0 && row < data.length && col >= 0 && col < data[row].length) {
    // 确保单元格对象存在
    const cell = data[row][col];
    if (cell) {
      // 设置红色样式
      cell.style = { ...cell.style, backgroundColor: 'lightgreen' };
    }
  }
};
const handleCellUpdateIF = (row: number, col: number, value: any, selectedItem?: DataSourceItem) => {
  // console.log(`IF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataIF.value.length && col >= 0 && col < materialDataIF.value[row].length) {
    materialDataIF.value[row][col].value = value;
    // 标记修改的单元格为红色
    markCellAsModified(row, col, materialDataIF.value);

    // 如果更新的是物料名称列（列0），自动更新库区、物料代码、批次号和化学成分
    if (col === 0 && row > 0) { // row > 0 排除表头行
      // 优先使用弹窗直接传递的完整对象，避免同名物料二次查找匹配到错误行
      const material = selectedItem || findMaterialByName(value, 'IF');
      if (material && materialDataIF.value[row].length > 13) {
        // 自动填充库区（列1）
        if (material.storageArea && materialDataIF.value[row].length > 1) {
          materialDataIF.value[row][1].value = material.storageArea;
        }

        // 自动填充物料代码（列12）
        if (material.code) {
          materialDataIF.value[row][13].value = material.code;
        }

        // 自动填充批次号（列13）
        if (material.batchNumber) {
          materialDataIF.value[row][14].value = material.batchNumber;
        }

        // 自动填充化学成分（列3-11）
        if (material.c !== undefined && materialDataIF.value[row].length > 3) {
          materialDataIF.value[row][3].value = material.c; // C%
        }
        if (material.si !== undefined && materialDataIF.value[row].length > 4) {
          materialDataIF.value[row][4].value = material.si; // Si%
        }
        if (material.mn !== undefined && materialDataIF.value[row].length > 5) {
          materialDataIF.value[row][5].value = material.mn; // Mn%
        }
        if (material.p !== undefined && materialDataIF.value[row].length > 6) {
          materialDataIF.value[row][6].value = material.p; // P%
        }
        if (material.s !== undefined && materialDataIF.value[row].length > 7) {
          materialDataIF.value[row][7].value = material.s; // S%
        }
        if (material.cr !== undefined && materialDataIF.value[row].length > 8) {
          materialDataIF.value[row][8].value = material.cr; // Cr%
        }
        if (material.ni !== undefined && materialDataIF.value[row].length > 9) {
          materialDataIF.value[row][9].value = material.ni; // Ni%
        }
        if (material.mo !== undefined && materialDataIF.value[row].length > 10) {
          materialDataIF.value[row][10].value = material.mo; // Mo%
        }
        if (material.cu !== undefined && materialDataIF.value[row].length > 11) {
          materialDataIF.value[row][11].value = material.cu; // Cu%
        }
        if (material.co !== undefined && materialDataIF.value[row].length > 12) {
          materialDataIF.value[row][12].value = material.co; // Co%
        }

        // 触发表格数据更新
        if (spreadsheetRefIF.value) {
          spreadsheetRefIF.value.setData(materialDataIF.value);
        }
      }
    }

    if (row < materialDataIF.value.length && materialDataIF.value[row][0]?.value === '备注' && col === 1) {
      remarkInfoIF.value = value;
    }

    // 如果更新的是重量列（列2）或成分列（列3-11），重新计算配料成分
    if (row > 0 && (col === 2 || (col >= 3 && col <= 12) || (col >= 15 && col <= 21))) {
      // console.log('重量或成分列更新，重新计算配料成分');
      addWeightedAverageRowIF();
      // 更新表格数据
      if (spreadsheetRefIF.value) {
        spreadsheetRefIF.value.setData(materialDataIF.value);
      }
    }
  }
};

const handleCellUpdateEAF = (row: number, col: number, value: any, selectedItem?: DataSourceItem) => {
  // console.log(`EAF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataEAF.value.length && col >= 0 && col < materialDataEAF.value[row].length) {
    materialDataEAF.value[row][col].value = value;
    // 标记修改的单元格为红色
    markCellAsModified(row, col, materialDataEAF.value);

    // 如果更新的是物料名称列（列0），自动更新库区、物料代码、批次号和化学成分
    if (col === 0 && row > 0) { // row > 0 排除表头行
      // 优先使用弹窗直接传递的完整对象，避免同名物料二次查找匹配到错误行
      const material = selectedItem || findMaterialByName(value, 'EAF');
      if (material && materialDataEAF.value[row].length > 13) {
        // 自动填充库区（列1）
        if (material.storageArea && materialDataEAF.value[row].length > 1) {
          materialDataEAF.value[row][1].value = material.storageArea;
        }

        // 自动填充物料代码（列12）
        if (material.code) {
          materialDataEAF.value[row][13].value = material.code;
        }

        // 自动填充批次号（列13）
        if (material.batchNumber) {
          materialDataEAF.value[row][14].value = material.batchNumber;
        }

        // 自动填充化学成分（列3-11）
        if (material.c !== undefined && materialDataEAF.value[row].length > 3) {
          materialDataEAF.value[row][3].value = material.c; // C%
        }
        if (material.si !== undefined && materialDataEAF.value[row].length > 4) {
          materialDataEAF.value[row][4].value = material.si; // Si%
        }
        if (material.mn !== undefined && materialDataEAF.value[row].length > 5) {
          materialDataEAF.value[row][5].value = material.mn; // Mn%
        }
        if (material.p !== undefined && materialDataEAF.value[row].length > 6) {
          materialDataEAF.value[row][6].value = material.p; // P%
        }
        if (material.s !== undefined && materialDataEAF.value[row].length > 7) {
          materialDataEAF.value[row][7].value = material.s; // S%
        }
        if (material.cr !== undefined && materialDataEAF.value[row].length > 8) {
          materialDataEAF.value[row][8].value = material.cr; // Cr%
        }
        if (material.ni !== undefined && materialDataEAF.value[row].length > 9) {
          materialDataEAF.value[row][9].value = material.ni; // Ni%
        }
        if (material.mo !== undefined && materialDataEAF.value[row].length > 10) {
          materialDataEAF.value[row][10].value = material.mo; // Mo%
        }
        if (material.cu !== undefined && materialDataEAF.value[row].length > 11) {
          materialDataEAF.value[row][11].value = material.cu; // Cu%
        }
        if (material.co !== undefined && materialDataEAF.value[row].length > 12) {
          materialDataEAF.value[row][12].value = material.co; // Co%
        }

        // 触发表格数据更新
        if (spreadsheetRefEAF.value) {
          spreadsheetRefEAF.value.setData(materialDataEAF.value);
        }
      }
    }

    if (row < materialDataEAF.value.length && materialDataEAF.value[row][0]?.value === '备注' && col === 1) {
      remarkInfoEAF.value = value;
    }

    // 如果更新的是重量列（列2）或成分列（列3-11），重新计算配料成分和出钢成分
    if (row > 0 && (col === 2 || (col >= 3 && col <= 12))) {
      console.log('重量或成分列更新，重新计算配料成分和出钢成分');
      addWeightedAverageRowEAF();
      addSteelmakingRowEAF();
      // 更新表格数据
      if (spreadsheetRefEAF.value) {
        spreadsheetRefEAF.value.setData(materialDataEAF.value);
      }
    }
  }
};

const handleCellUpdateAOD = (row: number, col: number, value: any, selectedItem?: DataSourceItem) => {
  //console.log(`AOD单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataAOD.value.length && col >= 0 && col < materialDataAOD.value[row].length) {
    materialDataAOD.value[row][col].value = value;
    // 标记修改的单元格为红色
    markCellAsModified(row, col, materialDataAOD.value);

    // 如果更新的是物料名称列（列0），自动更新库区、物料代码、批次号和化学成分
    if (col === 0 && row > 0) { // row > 0 排除表头行
      // 优先使用弹窗直接传递的完整对象，避免同名物料二次查找匹配到错误行
      const material = selectedItem || findMaterialByName(value, 'AOD');
      if (material && materialDataAOD.value[row].length > 13) {
        // 自动填充库区（列1）
        if (material.storageArea && materialDataAOD.value[row].length > 1) {
          materialDataAOD.value[row][1].value = material.storageArea;
        }

        // 自动填充物料代码（列12）
        if (material.code && materialDataAOD.value[row].length > 12) {
          materialDataAOD.value[row][13].value = material.code;
        }

        // 自动填充批次号（列13）
        if (material.batchNumber && materialDataAOD.value[row].length > 13) {
          materialDataAOD.value[row][14].value = material.batchNumber;
        }

        // 自动填充化学成分（列3-11）
        if (material.c !== undefined && materialDataAOD.value[row].length > 3) {
          materialDataAOD.value[row][3].value = material.c; // C%
        }
        if (material.si !== undefined && materialDataAOD.value[row].length > 4) {
          materialDataAOD.value[row][4].value = material.si; // Si%
        }
        if (material.mn !== undefined && materialDataAOD.value[row].length > 5) {
          materialDataAOD.value[row][5].value = material.mn; // Mn%
        }
        if (material.p !== undefined && materialDataAOD.value[row].length > 6) {
          materialDataAOD.value[row][6].value = material.p; // P%
        }
        if (material.s !== undefined && materialDataAOD.value[row].length > 7) {
          materialDataAOD.value[row][7].value = material.s; // S%
        }
        if (material.cr !== undefined && materialDataAOD.value[row].length > 8) {
          materialDataAOD.value[row][8].value = material.cr; // Cr%
        }
        if (material.ni !== undefined && materialDataAOD.value[row].length > 9) {
          materialDataAOD.value[row][9].value = material.ni; // Ni%
        }
        if (material.mo !== undefined && materialDataAOD.value[row].length > 10) {
          materialDataAOD.value[row][10].value = material.mo; // Mo%
        }
        if (material.cu !== undefined && materialDataAOD.value[row].length > 11) {
          materialDataAOD.value[row][11].value = material.cu; // Cu%
        }
        if (material.co !== undefined && materialDataAOD.value[row].length > 12) {
          materialDataAOD.value[row][12].value = material.co; // Co%
        }

        // 触发表格数据更新
        if (spreadsheetRefAOD.value) {
          spreadsheetRefAOD.value.setData(materialDataAOD.value);
        }
      }
    }

    if (row < materialDataAOD.value.length && materialDataAOD.value[row][0]?.value === '备注' && col === 1) {
      remarkInfoAOD.value = value;
    }

    // 如果更新的是重量列（列2）或成分列（列3-11），重新计算配料成分和出钢成分
    if (row > 0 && (col === 2 || (col >= 3 && col <= 12))) {
      console.log('重量或成分列更新，重新计算配料成分和出钢成分');
      recalculateAndReorderAODRows();
      // 更新表格数据
      if (spreadsheetRefAOD.value) {
        spreadsheetRefAOD.value.setData(materialDataAOD.value);
      }
    }
  }
};

const handleCellUpdateBOF = (row: number, col: number, value: any, selectedItem?: DataSourceItem) => {
  //console.log(`BOF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataBOF.value.length && col >= 0 && col < materialDataBOF.value[row].length) {
    materialDataBOF.value[row][col].value = value;
    // 标记修改的单元格为红色
    markCellAsModified(row, col, materialDataBOF.value);

    // 如果更新的是物料名称列（列0），自动更新库区、物料代码、批次号和化学成分
    if (col === 0 && row > 0) { // row > 0 排除表头行
      // 优先使用弹窗直接传递的完整对象，避免同名物料二次查找匹配到错误行
      const material = selectedItem || findMaterialByName(value, 'BOF');
      if (material && materialDataBOF.value[row].length > 13) {
        // 自动填充库区（列1）
        if (material.storageArea && materialDataBOF.value[row].length > 1) {
          materialDataBOF.value[row][1].value = material.storageArea;
        }

        // 自动填充物料代码（列12）
        if (material.code) {
          materialDataBOF.value[row][13].value = material.code;
        }

        // 自动填充批次号（列13）
        if (material.batchNumber) {
          materialDataBOF.value[row][14].value = material.batchNumber;
        }

        // 自动填充化学成分（列3-11）
        if (material.c !== undefined && materialDataBOF.value[row].length > 3) {
          materialDataBOF.value[row][3].value = material.c; // C%
        }
        if (material.si !== undefined && materialDataBOF.value[row].length > 4) {
          materialDataBOF.value[row][4].value = material.si; // Si%
        }
        if (material.mn !== undefined && materialDataBOF.value[row].length > 5) {
          materialDataBOF.value[row][5].value = material.mn; // Mn%
        }
        if (material.p !== undefined && materialDataBOF.value[row].length > 6) {
          materialDataBOF.value[row][6].value = material.p; // P%
        }
        if (material.s !== undefined && materialDataBOF.value[row].length > 7) {
          materialDataBOF.value[row][7].value = material.s; // S%
        }
        if (material.cr !== undefined && materialDataBOF.value[row].length > 8) {
          materialDataBOF.value[row][8].value = material.cr; // Cr%
        }
        if (material.ni !== undefined && materialDataBOF.value[row].length > 9) {
          materialDataBOF.value[row][9].value = material.ni; // Ni%
        }
        if (material.mo !== undefined && materialDataBOF.value[row].length > 10) {
          materialDataBOF.value[row][10].value = material.mo; // Mo%
        }
        if (material.cu !== undefined && materialDataBOF.value[row].length > 11) {
          materialDataBOF.value[row][11].value = material.cu; // Cu%
        }
        if (material.co !== undefined && materialDataBOF.value[row].length > 12) {
          materialDataBOF.value[row][12].value = material.co; // Co%
        }

        // 触发表格数据更新
        if (spreadsheetRefBOF.value) {
          spreadsheetRefBOF.value.setData(materialDataBOF.value);
        }
      }
    }

    if (row < materialDataBOF.value.length && materialDataBOF.value[row][0]?.value === '备注' && col === 1) {
      remarkInfoBOF.value = value;
    }

    // 如果更新的是重量列（列2）或成分列（列3-11），重新计算配料成分和出钢成分
    if (row > 0 && (col === 2 || (col >= 3 && col <= 12))) {
      //console.log('重量或成分列更新，重新计算配料成分和出钢成分');
      addWeightedAverageRowBOF();
      addSteelmakingRowBOF();
      // 更新表格数据
      if (spreadsheetRefBOF.value) {
        spreadsheetRefBOF.value.setData(materialDataBOF.value);
      }
    }
  }
};

// 辅助函数：确保数据行有正确的数据源配置
const ensureDataSourceConfig = (data: CellData[][], formulaType: FormulaType) => {
  if (!data || data.length === 0) return data;

  // 特殊行标签，这些行不需要数据源配置
  const specialRowLabels = ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注', '预溶液成分'];

  // 从第1行开始（跳过表头）
  for (let row = 1; row < data.length; row++) {
    // 确保行存在
    if (!data[row]) {
      data[row] = [];
    }

    // 检查是否是特殊行
    const firstCellValue = data[row][0]?.value;
    const isSpecialRow = typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue);

    // 如果是特殊行，跳过数据源配置
    if (isSpecialRow) {
      continue;
    }

    // 确保行有足够的列（至少14列）
    while (data[row].length < 21) {
      data[row].push({ value: '', format: 'text', alignment: 'center' as TextAlign });
    }
    // 确保所有列都有基本的单元格对象
    for (let col = 0; col < data[row].length; col++) {
      if (!data[row][col]) {
        data[row][col] = { value: '', format: 'text', alignment: 'center' as TextAlign };
      }
    }

    // 物料名称列（列0）- 确保有数据源配置
    if (!data[row][0].dataSource) {
      // 保留原有值，添加数据源
      const existingValue = data[row][0]?.value || '';
      data[row][0] = createMaterialNameCell(existingValue, formulaType);
    }

    // 库区列（列1）- 确保有数据源配置
    if (!data[row][1].dataSource) {
      const existingValue = data[row][1]?.value || '';
      data[row][1] = createStorageAreaCell(existingValue, formulaType);
    }

    // 物料代码列（列12）- 确保是受保护的
    if (!data[row][12].isProtected) {
      data[row][12].isProtected = true;
    }
    // 确保对齐方式正确
    if (!data[row][12].alignment) {
      data[row][12].alignment = 'center' as TextAlign;
    }

    // 批次号列（列13）- 确保对齐方式正确
    if (data[row][13] && !data[row][13].alignment) {
      data[row][13].alignment = 'center' as TextAlign;
    }
  }

  return data;
};

// 数据变化处理
const handleDataChangeIF = (data: CellData[][]) => {
  //console.log('IF表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'IF');
  materialDataIF.value = processedData;
  // 重新计算配料成分（当新增或删除行时）
  addWeightedAverageRowIF();
  // 更新表格数据
  if (spreadsheetRefIF.value) {
    spreadsheetRefIF.value.setData(materialDataIF.value);
  }
};

const handleDataChangeEAF = (data: CellData[][]) => {
  //console.log('EAF表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'EAF');
  materialDataEAF.value = processedData;
  // 重新计算配料成分和出钢成分（当新增或删除行时）
  addWeightedAverageRowEAF();
  addSteelmakingRowEAF();
  // 更新表格数据
  if (spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.setData(materialDataEAF.value);
  }
};

const handleDataChangeAOD = (data: CellData[][]) => {
  //console.log('AOD表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'AOD');
  materialDataAOD.value = processedData;
  // 重新计算所有特殊行（当新增或删除行时）
  recalculateAndReorderAODRows();
  // 更新表格数据
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.setData(materialDataAOD.value);
  }
};

const handleDataChangeBOF = (data: CellData[][]) => {
  //console.log('BOF表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'BOF');
  materialDataBOF.value = processedData;
  // 重新计算配料成分和出钢成分（当新增或删除行时）
  addWeightedAverageRowBOF();
  addSteelmakingRowBOF();
  // 更新表格数据
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.setData(materialDataBOF.value);
  }
};

const handleHeightChangeBOF = (height: number) => {
  //console.log('BOF表格高度变化:', height);
};

// 初始化
const formName = ref('FBSM15ZS2N');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";

// xr-ef-form ready事件
const efFormReady = (e: any) => {
  //console.log('efFormReady called', e);
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition || 'default';
  initializePage();
};

// 画面相关数据初始化
const flag_souce = ref('0');
// 按严格顺序执行计算，每次更新后同步到 Spreadsheet
const executeCalculationSequence = async () => {

  // 步骤 1: IF 配料成分计算
  console.log('步骤 1: 计算 IF 配料成分');
  addWeightedAverageRowIF();
  // 强制同步到 Spreadsheet 组件
  if (spreadsheetRefIF.value) {
    spreadsheetRefIF.value.setData(materialDataIF.value);
  }
  await nextTick();

  // 步骤 2: EAF 配料成分和出钢成分
  console.log('步骤 2: 计算 EAF 配料成分和出钢成分');
  addWeightedAverageRowEAF();
  addSteelmakingRowEAF();
  if (spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.setData(materialDataEAF.value);
  }
  await nextTick();

  // 步骤 3: BOF 配料成分和出钢成分
  console.log('步骤 3: 计算 BOF 配料成分和出钢成分');
  addWeightedAverageRowBOF();
  addSteelmakingRowBOF();
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.setData(materialDataBOF.value);
  }
  await nextTick();

  // 步骤 4: AOD 预溶液成分（依赖 IF/EAF/BOF 的出钢成分）
  console.log('步骤 4: 更新 AOD 预溶液成分');
  updatePreSolutionRowAOD(); // true = 跳过重新计算，避免循环
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.setData(materialDataAOD.value);
  }
  await nextTick();

  // 步骤 5: AOD 重新计算所有行（配料成分、出钢成分、内控等）
  console.log('步骤 5: 重新计算 AOD 所有行');
  recalculateAndReorderAODRows();
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.setData(materialDataAOD.value);
  }
  await nextTick();

  console.log('计算序列执行完成');
};
const initializePage = async () => {
  console.log('initializePage called');

  try {
    const initialResult = await erFormHelper.Initialize(
      formPartition.value,
      formName.value,
      '',
      initializeService
    );

    if (initialResult.flag >= 0) {
      initializeFlag.value = 1;
      showContent.value = true;

      // 关键：先等待 p_query 完成基础数据加载（此时还没有计算行）
      await p_query();

      // 再按严格顺序执行计算（此时所有基础数据已就绪）
      await executeCalculationSequence();




      // 延迟加载表格数据
      // nextTick(() => {
      //   setTimeout(() => {
      //     loadAllSpreadsheetData();
      //   }, 100);
      // });

    } else {
      console.error('Initialize failed:', initialResult.msg);
      erFormHelper.messageError('ErFormHelper initialize failed, error msg is [' + initialResult.msg + ']!');
      showContent.value = true;
      // setTimeout(() => {
      //   loadAllSpreadsheetData();
      // }, 500);
    }

    //query_material();
    // 获取画面上的主要控件信息  

  } catch (error) {
    console.error('Initialize error:', error);
    showContent.value = true;
    setTimeout(() => {
      loadAllSpreadsheetData();
    }, 500);
  }
};

// 加载所有表格数据
const loadAllSpreadsheetData = async () => {
  //console.log('加载所有表格数据');

  // 加载IF配料单数据
  if (spreadsheetRefIF.value) {
    spreadsheetRefIF.value.setData(materialDataIF.value);
  }
  // 加载EAF配料单数据
  if (spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.setData(materialDataEAF.value);
  }
  // 加载BOF配料单数据
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.setData(materialDataBOF.value);
  }
  // 加载AOD配料单数据
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.setData(materialDataAOD.value);
  }
  await nextTick();
  erFormHelper.messageInfo('所有配料数据已加载');
};

// 显示过程数据
const ProcessDataDialogFormName = ref(''); // 弹出画面的画面名
const ProcessDataParentInfo = ref({});
const ProcessDataDialogVisible = ref(false);
const showProcessData = async (e: any) => {
  try {
    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    ProcessDataParentInfo.value = {
      PARENT: 'FBSM15ZS2N', // 标识父画面
      COMPOSE_LIST_NO: form.composeListNo, // 传递物料编码
      BACKLOG_EA: form.backlogEa,
      ST_NO: form.stNo,
      DATE_TIME: form.createDate,
    };

    // 3. 设置弹窗画面名
    ProcessDataDialogFormName.value = 'FBSM15GS2N';
    // 4. 显示F3弹窗
    ProcessDataDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError('打开模型过程数据(FBSM15GS2N)画面失败：' + (error as Error).message);
  }
};

const handleProcessDataChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    ProcessDataDialogVisible.value = false;
  }
};

//显示原料库存信息
const stockDialogFormName = ref(''); // 弹出画面的画面名
const stockParentInfo = ref({});
const stockDialogVisible = ref(false);
const showStock = async (e: any) => {
  try {
    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    stockParentInfo.value = {
      PARENT: 'FBSM15ZS2N', // 标识父画面
      COMPOSE_LIST_NO: form.composeListNo, // 传递物料编码
      BACKLOG_EA: form.backlogEa,
    };

    // 3. 设置弹窗画面名
    stockDialogFormName.value = 'FBSM13S2N';
    // 4. 显示F3弹窗
    stockDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError('打开原料总库存查询(FBSM13S2N)画面失败：' + (error as Error).message);
  }
};
const handlestockChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    stockDialogVisible.value = false;
  }
};

//显示历史配料单
const HistoryDialogFormName = ref(''); // 弹出画面的画面名
const HistoryParentInfo = ref({});
const HistoryDialogVisible = ref(false);
const showHistory = async (e: any) => {
  try {
    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    HistoryParentInfo.value = {
      PARENT: 'FBSM15ZS2N', // 标识父画面
      COMPOSE_LIST_NO: form.composeListNo, // 传递物料编码
      BACKLOG_EA: form.backlogEa,
      ST_NO: form.stNo,
      DATE_TIME: form.createDate,
    };

    // 3. 设置弹窗画面名
    HistoryDialogFormName.value = 'FBSM15MS2N';
    // 4. 显示F3弹窗
    HistoryDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError('打开模板配料单(FBSM15MS2N)画面失败：' + (error as Error).message);
  }
};

// 获取弹窗画面传递过来的数据
const handleHistoryChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    HistoryDialogVisible.value = false;
    form.composeListNo = info.COMPOSE_LIST_NO;
    form.createDate = info.DATE_TIME;
    //form.backlogEa = form.composeListNo.substring(4, 2);
    //form.materialCode = form.composeListNo.substring(1, 3);
    p_query();
  }
};




const saveToTemplate = async () => {

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
  block.addRow({
    COMPOSE_LIST_NO: form.composeListNo,
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
    MATERIAL_CODE: form.materialCode,
    DATE_TIME: form.createDate,
  });
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认设定为模板？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {

    const outInfo = await erFormHelper.callService('fbsm15_mb_upd', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    erFormHelper.messageSuccess('保存到模板库');
  }

};

// ============== 修改3：在saveFormula方法中触发emit事件（核心） ==============
const saveFormula = async () => {
  // 提取物料数据的辅助函数（只排除表头行）
  const extractMaterialData = (materialData: CellData[][]) => {
    const result: Array<{
      Mat_name: string;
      STOCK_NAME: string;
      Weight: string;
      C_VALUE: string;
      Si_VALUE: string;
      Mn_VALUE: string;
      P_VALUE: string;
      S_VALUE: string;
      Cr_VALUE: string;
      Ni_VALUE: string;
      Mo_VALUE: string;
      Cu_VALUE: string;
      Co_VALUE: string;
      Mat_code: string;
      LOT_NO: string;
      Al_VALUE: string;
      Nb_VALUE: string;
      V_VALUE: string;
      Ti_VALUE: string;
      B_VALUE: string;
      N_VALUE: string;
      Ca_VALUE: string;
      back_c2: string;
    }> = [];

    if (!materialData || materialData.length <= 1) return result; // 只有表头或为空

    for (let row = 1; row < materialData.length; row++) {
      // 提取各列数据，如果没有数据就导出空字符串
      const getCellValue = (col: number): string => {
        if (materialData[row] && materialData[row][col] && materialData[row][col].value !== undefined && materialData[row][col].value !== null) {
          return String(materialData[row][col].value);
        }
        return '';
      };

      const rowData = {
        Mat_name: getCellValue(0),
        STOCK_NAME: getCellValue(1),
        Weight: getCellValue(2),
        C_VALUE: getCellValue(3),
        Si_VALUE: getCellValue(4),
        Mn_VALUE: getCellValue(5),
        P_VALUE: getCellValue(6),
        S_VALUE: getCellValue(7),
        Cr_VALUE: getCellValue(8),
        Ni_VALUE: getCellValue(9),
        Mo_VALUE: getCellValue(10),
        Cu_VALUE: getCellValue(11),
        Co_VALUE: getCellValue(12),
        Mat_code: getCellValue(13),
        LOT_NO: getCellValue(14),
        Al_VALUE: getCellValue(15),
        Nb_VALUE: getCellValue(16),
        V_VALUE: getCellValue(17),
        Ti_VALUE: getCellValue(18),
        B_VALUE: getCellValue(19),
        N_VALUE: getCellValue(20),
        Ca_VALUE: getCellValue(21),
        back_c2: getCellValue(22),
      };
      result.push(rowData);
    }
    return result;
  };

  // 提取所有可见配料单的数据
  console.log('开始提取配料单数据...');

  const inInfo = new EI.EIInfo();


  const block = inInfo.addBlock(new EI.EiBlock('query'));
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
  block.addRow({
    COMPOSE_LIST_NO: form.composeListNo,
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
    MATERIAL_CODE: form.materialCode,
    DATE_TIME: form.createDate,
  });

  if (hasIFMaterialData.value) {
    const ifData = extractMaterialData(materialDataIF.value);
    //console.log('IF配料单数据:', ifData);
    const block = inInfo.addBlock(new EI.EiBlock('IF'));
    block.pushData(ifData, true);
  }

  if (hasEAFMaterialData.value) {
    const eafData = extractMaterialData(materialDataEAF.value);
    //console.log('EAF配料单数据:', eafData);
    const block = inInfo.addBlock(new EI.EiBlock('EAF'));
    block.pushData(eafData, true);
  }

  if (hasAODMaterialData.value) {
    const aodData = extractMaterialData(materialDataAOD.value);
    //console.log('AOD配料单数据:', aodData);
    const block = inInfo.addBlock(new EI.EiBlock('AOD'));
    block.pushData(aodData, true);
  }

  if (hasBOFMaterialData.value) {
    const bofData = extractMaterialData(materialDataBOF.value);
    //console.log('BOF配料单数据:', bofData);
    const block = inInfo.addBlock(new EI.EiBlock('BOF'));
    block.pushData(bofData, true);
  }

  //console.log('BOF配料单数据:', inInfo);
  const mes_res = await erFormHelper.messageConfirm(
    "配料单是否确认保存？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService('fbsm15z_save', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }

    const dataArray = outInfo.getBlock(0).data || []; // 加||[]防止data为undefined 
    if (dataArray.length > 0) {
      form.composeListNo = String(dataArray[0]["COMPOSE_LIST_NO"]);
      p_query();
    }

    erFormHelper.messageSuccess('配料单保存成功');
  }

};

const modelcol = async () => {
  // 提取物料数据的辅助函数（只提取选中行）
  const extractSelectedMaterialData = (materialData: CellData[][], selectedRows: number[]) => {
    const result: Array<{
      Mat_name: string;
      STOCK_NAME: string;
      Weight: string;
      C_VALUE: string;
      Si_VALUE: string;
      Mn_VALUE: string;
      P_VALUE: string;
      S_VALUE: string;
      Cr_VALUE: string;
      Ni_VALUE: string;
      Mo_VALUE: string;
      Cu_VALUE: string;
      Co_VALUE: string;
      Mat_code: string;
      LOT_NO: string;
      Al_VALUE: string;
      Nb_VALUE: string;
      V_VALUE: string;
      Ti_VALUE: string;
      B_VALUE: string;
      N_VALUE: string;
      Ca_VALUE: string;
      back_c2: string;
    }> = [];

    if (!materialData || materialData.length <= 1) return result; // 只有表头或为空

    // 按行索引排序
    const sortedRows = selectedRows.sort((a, b) => a - b);

    for (const row of sortedRows) {
      // 确保行索引有效
      if (row < 1 || row >= materialData.length) continue;

      // 提取各列数据，如果没有数据就导出空字符串
      const getCellValue = (col: number): string => {
        if (materialData[row] && materialData[row][col] && materialData[row][col].value !== undefined && materialData[row][col].value !== null) {
          return String(materialData[row][col].value);
        }
        return '';
      };

      const rowData = {
        Mat_name: getCellValue(0),
        STOCK_NAME: getCellValue(1),
        Weight: getCellValue(2),
        C_VALUE: getCellValue(3),
        Si_VALUE: getCellValue(4),
        Mn_VALUE: getCellValue(5),
        P_VALUE: getCellValue(6),
        S_VALUE: getCellValue(7),
        Cr_VALUE: getCellValue(8),
        Ni_VALUE: getCellValue(9),
        Mo_VALUE: getCellValue(10),
        Cu_VALUE: getCellValue(11),
        Co_VALUE: getCellValue(12),
        Mat_code: getCellValue(13),
        LOT_NO: getCellValue(14),
        Al_VALUE: getCellValue(15),
        Nb_VALUE: getCellValue(16),
        V_VALUE: getCellValue(17),
        Ti_VALUE: getCellValue(18),
        B_VALUE: getCellValue(19),
        N_VALUE: getCellValue(20),
        Ca_VALUE: getCellValue(21),
        back_c2: getCellValue(22),
      };
      result.push(rowData);
    }
    return result;
  };

  console.log('开始导出选中行数据...');

  const inInfo = new EI.EIInfo();
  let hasSelectedData = false;

  const block = inInfo.addBlock(new EI.EiBlock('query'));
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
  block.addRow({
    COMPOSE_LIST_NO: form.composeListNo,
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
    MATERIAL_CODE: form.materialCode,
    DATE_TIME: form.createDate,
  });


  // 检查IF配料单是否有选中行
  if (hasIFMaterialData.value && spreadsheetRefIF.value) {
    const selectedRows = spreadsheetRefIF.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataIF.value, selectedRows);
      if (selectedData.length > 0) {
        const blockif = inInfo.addBlock(new EI.EiBlock('IF'));
        blockif.pushData(selectedData, true);
        hasSelectedData = true;
        console.log('IF配料单选中行数据:', selectedData);
      }
    }
  }

  // 检查EAF配料单是否有选中行
  if (hasEAFMaterialData.value && spreadsheetRefEAF.value) {
    const selectedRows = spreadsheetRefEAF.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataEAF.value, selectedRows);
      if (selectedData.length > 0) {
        const blockeaf = inInfo.addBlock(new EI.EiBlock('EAF'));
        blockeaf.pushData(selectedData, true);
        //inInfo.addBlock(blockeaf, "EAF");
        hasSelectedData = true;
        console.log('EAF配料单选中行数据:', selectedData);
      }
    }
  }

  // 检查AOD配料单是否有选中行
  if (hasAODMaterialData.value && spreadsheetRefAOD.value) {
    const selectedRows = spreadsheetRefAOD.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataAOD.value, selectedRows);
      if (selectedData.length > 0) {
        const blockaod = inInfo.addBlock(new EI.EiBlock('AOD'));
        blockaod.pushData(selectedData, true);
        //inInfo.addBlock(blockaod, "AOD");
        hasSelectedData = true;
        console.log('AOD配料单选中行数据:', selectedData);
      }
    }
  }

  // 检查BOF配料单是否有选中行
  if (hasBOFMaterialData.value && spreadsheetRefBOF.value) {
    const selectedRows = spreadsheetRefBOF.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataBOF.value, selectedRows);
      if (selectedData.length > 0) {
        const blockbof = inInfo.addBlock(new EI.EiBlock('BOF'));
        blockbof.pushData(selectedData, true);
        //inInfo.addBlock(blockbof, "BOF");
        hasSelectedData = true;
        console.log('BOF配料单选中行数据:', selectedData);
      }
    }
  }

  if (hasSelectedData) {
    erFormHelper.messageSuccess('选中行数据导出成功');
    // 这里可以添加实际导出逻辑，比如调用后端接口等
  } else {
    erFormHelper.messageInfo('没有选中任何行，无需导出');
  }

  const mes_res = await erFormHelper.messageConfirm(
    "配料单是否确认重新调用模型？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService('fbsm15z_col', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }

    const dataArray = outInfo.getBlock(0).data || []; // 加||[]防止data为undefined 
    if (dataArray.length > 0) {
      form.composeListNo = String(dataArray[0]["COMPOSE_LIST_NO"]);
      p_query();
    }

    erFormHelper.messageSuccess('配料单保存成功');
  }

};


// 审核配料单时触发
const checkFormula = async () => {

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
  block.addRow({
    COMPOSE_LIST_NO: form.composeListNo,
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
    MATERIAL_CODE: form.materialCode,
    DATE_TIME: form.createDate,
  });

  //console.log('审核单据信息:', inInfo);
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认审核？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {

    const outInfo = await erFormHelper.callService('fbsm15_sh_upd', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    erFormHelper.messageSuccess('配料单审核通过');
  }

};

const nocheckFormula = async () => {

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
  block.addRow({
    COMPOSE_LIST_NO: form.composeListNo,
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
    MATERIAL_CODE: form.materialCode,
    DATE_TIME: form.createDate,
  });
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认取消审核？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {

    const outInfo = await erFormHelper.callService('fbsm15_sh_del', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    erFormHelper.messageSuccess('配料单取消审核');
  }

};


// 导出功能触发
const exportFormula = async (e: any) => {
  // 这里可以分别导出三个配料单的数据
  // erFormHelper.messageSuccess('配料单已导出');

  // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）
  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: Number(form.backlogEa) || 0
  };

  const composeListNo = queryParams.composeListNo;
  const stNo = queryParams.stNo;

  if (!composeListNo || !stNo) {
    erFormHelper.messageError('未获取到必要的导出参数（配料单号或出钢记号）!');
    return;
  }

  // 4. 构建报表参数
  // 文档中示例的格式为：`@PARAM1@$$value1;;@PARAM2@$$value2`
  const reportParam = `@COMPOSE_LIST_NO@$$${composeListNo};;@ST_NO@$$${stNo}`;

  try {
    // 构建导出信息
    const exportData = {
      "REPORT_ID": "", // 通常可为空，或按需填写
      "REPORT_ENAME": "FBSM15ZS2N", // 您的报表模板名称
      "REPORT_CNAME": "", // 可为空
      "REPORT_TYPE": "", // 可为空
      "REPORT_STATUS": "", // 可为空
      "REPORT_PARAM": reportParam, // 拼接好的参数字符串
      "RETURN_FILE_TYPE": "xlsx", // 导出文件类型：xlsx, pdf 等
      // "PRINT_NAME": "" // 打印相关，导出时可省略
    };
    // 方案一：使用 ExportReportFile，导出并获取文件URL（常见于直接下载或打开）
    // const fileUrl = await eBFR.ExportReportFile(exportData, formPartition.value);
    // console.log('导出文件URL:', fileUrl);

    // // 可选：自动在新窗口打开或触发下载
    // if (fileUrl) {
    //   window.open(fileUrl);
    // }

    // 方案二：使用 ExportReportSpecifyNameFile，并可指定导出文件名

    const exportDataWithName = {
      ...exportData, // 包含上述所有字段
      "FILE_NAME": `配料单_${composeListNo}_${stNo}` // 指定自定义文件名（不含扩展名）
    };
    const fileUrl = await eBFR.ExportReportSpecifyNameFile(exportDataWithName, formPartition.value);
    window.open(fileUrl);


    erFormHelper.messageSuccess('报表导出请求已发送，文件正在生成！');

  } catch (error) {
    console.error('导出报表时发生错误:', error);
    erFormHelper.messageError('报表导出失败，请检查参数或模板配置！');
  }
};

// 打印功能触发
const printFormula = async (e: any) => {
  // window.print();
  erFormHelper.messageInfo('打印功能调用');

  // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）
  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: Number(form.backlogEa) || 0
  };

  const composeListNo = queryParams.composeListNo;
  const stNo = queryParams.stNo;

  if (!composeListNo || !stNo) {
    erFormHelper.messageError('未获取到必要的导出参数（配料单号或出钢记号）!');
    return;
  }


  // 4. 构建报表参数
  // 文档中示例的格式为：`@PARAM1@$$value1;;@PARAM2@$$value2`
  const reportParam = `@COMPOSE_LIST_NO@$$${composeListNo};;@ST_NO@$$${stNo}`;

  // 6. 触发标签预览/打印（有预览打一份）
  await eBFR.ViewReportByReportName(
    "FBSM15ZS2N", // 替换为你的实际标签模板名称
    reportParam, // 传递参数
    "xlsx", // 文件类型
    formPartition.value // 分区参数（替换为你的实际变量）
  );

  // 可选：添加打印成功提示
  erFormHelper.messageSuccess('标签打印请求已发送！');
};

// 后台查询入参：传递配料单核心查询条件（从form中取）
interface QueryFormulaParams {
  composeListNo: string; // 配料单号
  materialCode: string;  // 大类代码
  stNo: string;          // 出钢记号
  backlogEa: number;     // 工艺路线
}

// 后台查询出参：单个配料单的物料数据（和addMaterialDataFromSource入参格式一致）
interface FormulaMaterialData {
  Mat_name: string;
  StorageArea: string;
  Weight: string;
  C: string;
  Si: string;
  Mn: string;
  P: string;
  S: string;
  Cr: string;
  Ni: string;
  Mo: string;
  Cu: string;
  Co: string;
  Mat_code: string;
  Batch_no: string;
}

// 后台查询整体响应格式
interface QueryFormulaResponse {
  code: number;          // 接口状态码 0-成功 其他-失败
  msg: string;           // 提示信息
  data: {
    IF?: FormulaMaterialData[];  // IF配料单数据（可选，无数据则不返回）
    EAF?: FormulaMaterialData[]; // EAF配料单数据
    AOD?: FormulaMaterialData[]; // AOD配料单数据
    BOF?: FormulaMaterialData[]; // BOF配料单数据
  };
}

// 在现有接口定义后添加
// AOD内控标准查询入参
interface QueryAODControlParams {
  composeListNo: string; // 配料单号
  materialCode: string;  // 大类代码
  stNo: string;          // 出钢记号
}

// AOD内控标准响应格式
interface AODControlStandard {
  upper: number[];       // 内控上限 [C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%, Al%, Nb%, V%, Ti%, B%, N%, Ca%]
  target: number[];      // 内控目标
  lower: number[];       // 内控下限
}

// AOD内控标准查询响应
interface QueryAODControlResponse {
  code: number;
  msg: string;
  data: AODControlStandard;
}

// 封装【统一添加备注行方法】：列数和EAF保持一致（14列：备注标题1列 + 内容跨12列 + 补1列 = 14列）
const createRemarkRow = (title: string, remarkInfo: any) => {
  return [
    { value: title, format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: remarkInfo.value, format: 'text', alignment: 'left', colspan: 12 },
    { value: '', format: 'text', alignment: 'center' }
  ] as CellData[];
};

// 封装【统一类型转换方法】：避免重复代码，所有字段转字符串（兜底空值）
const convertDataToString = (list: any[]) => {
  return list.map(item => ({
    ...item,
    Mat_name: String(item.Mat_name || ''),
    StorageArea: String(item.StorageArea || ''),
    Weight: String(item.Weight || ''),
    C: String(item.C || ''),
    Si: String(item.Si || ''),
    Mn: String(item.Mn || ''),
    P: String(item.P || ''),
    S: String(item.S || ''),
    Cr: String(item.Cr || ''),
    Ni: String(item.Ni || ''),
    Mo: String(item.Mo || ''),
    Cu: String(item.Cu || ''),
    Co: String(item.Co || ''),
    Mat_code: String(item.Mat_code || ''),
    Batch_no: String(item.Batch_no || ''),
    Al: String(item.Al || ''),
    Nb: String(item.Nb || ''),
    V: String(item.V || ''),
    Ti: String(item.Ti || ''),
    B: String(item.B || ''),
    N: String(item.N || ''),
    Ca: String(item.Ca || ''),
    back_c2: String(item.back_c2 || ''),
    mat_yeild: Number(item.mat_yeild || 100)
  }));
};

const p_query = async () => {
  // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）
  if (flag_souce.value != "1") {
    await query_souce();
    await query_material();
  }

  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: Number(form.backlogEa) || 0
  };

  // 基础校验：核心查询条件不能为空（根据业务调整）
  if (!queryParams.composeListNo) {
    erFormHelper.messageWarning("请先选择/输入配料单号，再执行查询");
    return;
  }
  // 2. 显示加载中提示（提升用户体验）
  // erFormHelper.messageLoading("正在查询配料单数据...", 0); // 0-手动关闭提示
  const inInfo = new EI.EIInfo();
  // const outInfo = await erFormHelper.callService('fbsm12_inq', inInfo);
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE');
  block.addRow({
    COMPOSE_LIST_NO: queryParams.composeListNo,
    ST_NO: queryParams.stNo,
    BACKLOG_EA: queryParams.backlogEa,
    MATERIAL_CODE: queryParams.materialCode,
  });
  // 3. 调用后台查询接口
  const response = await erFormHelper.callService('fbsm15z_inq', inInfo);
  // 4. 关闭加载中提示
  // erFormHelper.closeMessageLoading();

  // 5. 核心：获取后台返回的完整数据数组（直接用，无需取[0]）
  //console.log('后台返回原始数据：', response.getBlock(0).data);
  const dataArray = response.getBlock(0).data || []; // 加||[]防止data为undefined
  // 初始化表格数据（清空原有数据）
  materialDataIF.value = [];
  materialDataEAF.value = [];
  materialDataAOD.value = [];
  materialDataBOF.value = [];

  // 6. 关键校验：确保dataArray是数组（兜底，防止后台返回非数组）
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    erFormHelper.messageInfo('暂无配料单明细数据');
    loadAllSpreadsheetData(); // 即使无数据也刷新计算，避免表格异常
    return;
  }

  // 7. 按STATION_ID分组过滤+数据结构映射（统一字段名，修复原代码空格问题）
  // IF炉（Z）
  const IF_LIST = dataArray
    .filter(item => item.STATION_ID === "Z")
    .map(item => ({
      Mat_name: item.MAT_NAME || '',
      StorageArea: item.STOCK_NAME || '',
      Weight: item.WEIGHT || '',
      C: item.C_VALUE || '',
      Si: item.SI_VALUE || '',
      Mn: item.MN_VALUE || '',
      P: item.P_VALUE || '', // 修复原代码多的空格
      S: item.S_VALUE || '',
      Cr: item.CR_VALUE || '',
      Ni: item.NI_VALUE || '',
      Mo: item.MO_VALUE || '',
      Cu: item.CU_VALUE || '',
      Co: item.CO_VALUE || '',
      Mat_code: item.MAT_CODE || '',
      Batch_no: item.LOT_NO || '',
      Al: item.AL_VALUE || '',
      Nb: item.NB_VALUE || '',
      V: item.V_VALUE || '',
      Ti: item.TI_VALUE || '',
      B: item.B_VALUE || '',
      N: item.N_VALUE || '',
      Ca: item.CA_VALUE || '',
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));
  // EAF炉（E）
  const EAF_LIST = dataArray
    .filter(item => item.STATION_ID === "E")
    .map(item => ({
      Mat_name: item.MAT_NAME || '',
      StorageArea: item.STOCK_NAME || '',
      Weight: item.WEIGHT || '',
      C: item.C_VALUE || '',
      Si: item.SI_VALUE || '',
      Mn: item.MN_VALUE || '',
      P: item.P_VALUE || '',
      S: item.S_VALUE || '',
      Cr: item.CR_VALUE || '',
      Ni: item.NI_VALUE || '',
      Mo: item.MO_VALUE || '',
      Cu: item.CU_VALUE || '',
      Co: item.CO_VALUE || '',
      Mat_code: item.MAT_CODE || '',
      Batch_no: item.LOT_NO || '',
      Al: item.AL_VALUE || '',
      Nb: item.NB_VALUE || '',
      V: item.V_VALUE || '',
      Ti: item.TI_VALUE || '',
      B: item.B_VALUE || '',
      N: item.N_VALUE || '',
      Ca: item.CA_VALUE || '',
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));

  // BOF炉（B）
  const BOF_LIST = dataArray
    .filter(item => item.STATION_ID === "B")
    .map(item => ({
      Mat_name: item.MAT_NAME || '',
      StorageArea: item.STOCK_NAME || '',
      Weight: item.WEIGHT || '',
      C: item.C_VALUE || '',
      Si: item.SI_VALUE || '',
      Mn: item.MN_VALUE || '',
      P: item.P_VALUE || '',
      S: item.S_VALUE || '',
      Cr: item.CR_VALUE || '',
      Ni: item.NI_VALUE || '',
      Mo: item.MO_VALUE || '',
      Cu: item.CU_VALUE || '',
      Co: item.CO_VALUE || '',
      Mat_code: item.MAT_CODE || '',
      Batch_no: item.LOT_NO || '',
      Al: item.AL_VALUE || '',
      Nb: item.NB_VALUE || '',
      V: item.V_VALUE || '',
      Ti: item.TI_VALUE || '',
      B: item.B_VALUE || '',
      N: item.N_VALUE || '',
      Ca: item.CA_VALUE || '',
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));

  // AOD炉（A）
  const AOD_LIST = dataArray
    .filter(item => item.STATION_ID === "A")
    .map(item => ({
      Mat_name: item.MAT_NAME || '',
      StorageArea: item.STOCK_NAME || '',
      Weight: item.WEIGHT || '',
      C: item.C_VALUE || '',
      Si: item.SI_VALUE || '',
      Mn: item.MN_VALUE || '',
      P: item.P_VALUE || '',
      S: item.S_VALUE || '',
      Cr: item.CR_VALUE || '',
      Ni: item.NI_VALUE || '',
      Mo: item.MO_VALUE || '',
      Cu: item.CU_VALUE || '',
      Co: item.CO_VALUE || '',
      Mat_code: item.MAT_CODE || '',
      Batch_no: item.LOT_NO || '',
      Al: item.AL_VALUE || '',
      Nb: item.NB_VALUE || '',
      V: item.V_VALUE || '',
      Ti: item.TI_VALUE || '',
      B: item.B_VALUE || '',
      N: item.N_VALUE || '',
      Ca: item.CA_VALUE || '',
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));



  // 各炉型数据统一转字符串
  const convertedIF_LIST = convertDataToString(IF_LIST);
  const convertedEAF_LIST = convertDataToString(EAF_LIST);
  const convertedBOF_LIST = convertDataToString(BOF_LIST);
  const convertedAOD_LIST = convertDataToString(AOD_LIST);

  //备注信息赋值
  const dataArray2 = response.getBlock('REMARK').data || []; // 加||[]防止data为undefined
  //console.log('备注信息：', dataArray2);
  if (dataArray2.length > 0) {
    remarkInfoIF.value = String(dataArray2[0]["BACK_IF"]) || '';
    remarkInfoBOF.value = String(dataArray2[0]["BACK_BOF"]) || '';
    remarkInfoEAF.value = String(dataArray2[0]["BACK_EAF"]) || '';
    remarkInfoAOD.value = String(dataArray2[0]["BACK_AOD"]) || '';
  }

  //控制成分赋值
  const dataArray3 = response.getBlock('CONTROL').data || []; // 加||[]防止data为undefined
  if (dataArray3.length > 0) {
    aodControlUpper.value = [Number(dataArray3[0]["C_MAX"]), Number(dataArray3[0]["SI_MAX"]), Number(dataArray3[0]["MN_MAX"]), Number(dataArray3[0]["P_MAX"]), Number(dataArray3[0]["S_MAX"])
      , Number(dataArray3[0]["CR_MAX"]), Number(dataArray3[0]["NI_MAX"]), Number(dataArray3[0]["MO_MAX"]), Number(dataArray3[0]["CU_MAX"]), Number(dataArray3[0]["CO_MAX"])
      , Number(dataArray3[0]["AL_MAX"]), Number(dataArray3[0]["NB_MAX"]), Number(dataArray3[0]["V_MAX"]), Number(dataArray3[0]["TI_MAX"]), Number(dataArray3[0]["B_MAX"])
      , Number(dataArray3[0]["N_MAX"]), Number(dataArray3[0]["CA_MAX"])
    ];
    aodControlLower.value = [Number(dataArray3[0]["C_MIN"]), Number(dataArray3[0]["SI_MIN"]), Number(dataArray3[0]["MN_MIN"]), Number(dataArray3[0]["P_MIN"]), Number(dataArray3[0]["S_MIN"])
      , Number(dataArray3[0]["CR_MIN"]), Number(dataArray3[0]["NI_MIN"]), Number(dataArray3[0]["MO_MIN"]), Number(dataArray3[0]["CU_MIN"]), Number(dataArray3[0]["CO_MIN"])
      , Number(dataArray3[0]["AL_MIN"]), Number(dataArray3[0]["NB_MIN"]), Number(dataArray3[0]["V_MIN"]), Number(dataArray3[0]["TI_MIN"]), Number(dataArray3[0]["B_MIN"])
      , Number(dataArray3[0]["N_MIN"]), Number(dataArray3[0]["CA_MIN"])
    ];
    aodControlTarget.value = [Number(dataArray3[0]["C_AIM"]), Number(dataArray3[0]["SI_AIM"]), Number(dataArray3[0]["MN_AIM"]), Number(dataArray3[0]["P_AIM"]), Number(dataArray3[0]["S_AIM"])
      , Number(dataArray3[0]["CR_AIM"]), Number(dataArray3[0]["NI_AIM"]), Number(dataArray3[0]["MO_AIM"]), Number(dataArray3[0]["CU_AIM"]), Number(dataArray3[0]["CO_AIM"])
      , Number(dataArray3[0]["AL_AIM"]), Number(dataArray3[0]["NB_AIM"]), Number(dataArray3[0]["V_AIM"]), Number(dataArray3[0]["TI_AIM"]), Number(dataArray3[0]["B_AIM"])
      , Number(dataArray3[0]["N_AIM"]), Number(dataArray3[0]["CA_AIM"])
    ];
  }

  const dataArray4 = response.getBlock('Y').data || []; // 加||[]防止data为undefined
  if (dataArray4.length > 0) {
    aodY.value = [Number(dataArray4[0]["WEIGHT"]), Number(dataArray4[0]["C_VALUE"]), Number(dataArray4[0]["SI_VALUE"]), Number(dataArray4[0]["MN_VALUE"]), Number(dataArray4[0]["P_VALUE"]), Number(dataArray4[0]["S_VALUE"])
      , Number(dataArray4[0]["CR_VALUE"]), Number(dataArray4[0]["NI_VALUE"]), Number(dataArray4[0]["MO_VALUE"]), Number(dataArray4[0]["CU_VALUE"]), Number(dataArray4[0]["CO_VALUE"])
      , Number(dataArray4[0]["AL_VALUE"]), Number(dataArray4[0]["NB_VALUE"]), Number(dataArray4[0]["V_VALUE"]), Number(dataArray4[0]["TI_VALUE"]), Number(dataArray4[0]["B_VALUE"])
      , Number(dataArray4[0]["N_VALUE"]), Number(dataArray4[0]["CA_VALUE"])
    ];
  }

  // 8. 各炉型数据处理：清空→统一方法处理→加备注行（和IF逻辑完全一致，链路统一）
  // IF炉（Z）
  materialDataIF.value = [];
  addMaterialDataFromSource(materialDataIF, convertedIF_LIST, 'IF', true, false);
  materialDataIF.value.push(createRemarkRow('备注', remarkInfoIF));

  // EAF炉（E）
  materialDataEAF.value = [];
  addMaterialDataFromSource(materialDataEAF, convertedEAF_LIST, 'EAF', true, false);
  materialDataEAF.value.push(createRemarkRow('备注', remarkInfoEAF));
  // BOF炉（B）
  materialDataBOF.value = [];
  addMaterialDataFromSource(materialDataBOF, convertedBOF_LIST, 'BOF', true, false);
  materialDataBOF.value.push(createRemarkRow('备注', remarkInfoBOF));

  // AOD炉（A）
  materialDataAOD.value = [];
  addMaterialDataFromSource(materialDataAOD, convertedAOD_LIST, 'AOD', true, false);
  materialDataAOD.value.push(createRemarkRow('备注', remarkInfoAOD));

  // 延迟加载表格数据
  nextTick(() => {
    setTimeout(() => {
      loadAllSpreadsheetData();
    }, 100);
  });
  // await nextTick();
  // await loadAllSpreadsheetData();
  // // 再等待一次确保子组件已接收数据
  // await nextTick();
}

const query_material = async () => {

  // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）
  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: Number(form.backlogEa) || 0
  };
  // 2. 显示加载中提示（提升用户体验）
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA');
  block.addRow({
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
  });
  // 3. 调用后台查询接口
  const response = await erFormHelper.callService('fbsm15z_material_inq', inInfo);
  const dataArray = response.getBlock(0).data || []; // 加||[]防止data为undefined

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    // erFormHelper.messageInfo('暂无配料单明细数据');   
    return;
  }
  // 初始化表格数据（清空原有数据）
  // console.log('物料代码加载查询：', dataArray);
  materialDataSourceIF.value = [];
  materialDataSourceAOD.value = [];
  materialDataSourceBOF.value = [];
  materialDataSourceEAF.value = [];

  //console.log('物料代码加载查询：', dataArray);
  materialDataSourceIF.value = dataArray
    .filter(item => item.STATION_ID === "Z")
    .map(item => ({
      seq_id: item.SEQ_ID || '',
      name: item.MAT_NAME || '',
      code: item.MAT_CODE || '',
      category: item.CATEGORY || '',
      storageArea: item.STOCK_NAME || '',
      batchNumber: item.LOT_NO || '',
      c: item.C_VALUE || 0,
      si: item.SI_VALUE || 0,
      mn: item.MN_VALUE || 0,
      p: item.P_VALUE || 0, // 修复原代码多的空格
      s: item.S_VALUE || 0,
      cr: item.CR_VALUE || 0,
      ni: item.NI_VALUE || 0,
      mo: item.MO_VALUE || 0,
      cu: item.CU_VALUE || 0,
      co: item.CO_VALUE || 0,
      al: item.AL_VALUE || 0,
      nb: item.NB_VALUE || 0,
      v: item.V_VALUE || 0,
      ti: item.TI_VALUE || 0,
      b: item.B_VALUE || 0,
      n: item.N_VALUE || 0,
      ca: item.CA_VALUE || 0,
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));
  //console.log('物料代码加载查询11111111：', materialDataSourceIF.value);
  materialDataSourceBOF.value = dataArray
    .filter(item => item.STATION_ID === "B")
    .map(item => ({
      seq_id: item.SEQ_ID || '',
      name: item.MAT_NAME || '',
      code: item.MAT_CODE || '',
      category: item.CATEGORY || '',
      storageArea: item.STOCK_NAME || '',
      batchNumber: item.LOT_NO || '',
      c: item.C_VALUE || 0,
      si: item.SI_VALUE || 0,
      mn: item.MN_VALUE || 0,
      p: item.P_VALUE || 0, // 修复原代码多的空格
      s: item.S_VALUE || 0,
      cr: item.CR_VALUE || 0,
      ni: item.NI_VALUE || 0,
      mo: item.MO_VALUE || 0,
      cu: item.CU_VALUE || 0,
      co: item.CO_VALUE || 0,
      al: item.AL_VALUE || 0,
      nb: item.NB_VALUE || 0,
      v: item.V_VALUE || 0,
      ti: item.TI_VALUE || 0,
      b: item.B_VALUE || 0,
      n: item.N_VALUE || 0,
      ca: item.CA_VALUE || 0,
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));

  materialDataSourceAOD.value = dataArray
    .filter(item => item.STATION_ID === "A")
    .map(item => ({
      seq_id: item.SEQ_ID || '',
      name: item.MAT_NAME || '',
      code: item.MAT_CODE || '',
      category: item.CATEGORY || '',
      storageArea: item.STOCK_NAME || '',
      batchNumber: item.LOT_NO || '',
      c: item.C_VALUE || 0,
      si: item.SI_VALUE || 0,
      mn: item.MN_VALUE || 0,
      p: item.P_VALUE || 0, // 修复原代码多的空格
      s: item.S_VALUE || 0,
      cr: item.CR_VALUE || 0,
      ni: item.NI_VALUE || 0,
      mo: item.MO_VALUE || 0,
      cu: item.CU_VALUE || 0,
      co: item.CO_VALUE || 0,
      al: item.AL_VALUE || 0,
      nb: item.NB_VALUE || 0,
      v: item.V_VALUE || 0,
      ti: item.TI_VALUE || 0,
      b: item.B_VALUE || 0,
      n: item.N_VALUE || 0,
      ca: item.CA_VALUE || 0,
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));

  materialDataSourceEAF.value = dataArray
    .filter(item => item.STATION_ID === "E")
    .map(item => ({
      seq_id: item.SEQ_ID || '',
      name: item.MAT_NAME || '',
      code: item.MAT_CODE || '',
      category: item.CATEGORY || '',
      storageArea: item.STOCK_NAME || '',
      batchNumber: item.LOT_NO || '',
      c: item.C_VALUE || 0,
      si: item.SI_VALUE || 0,
      mn: item.MN_VALUE || 0,
      p: item.P_VALUE || 0, // 修复原代码多的空格
      s: item.S_VALUE || 0,
      cr: item.CR_VALUE || 0,
      ni: item.NI_VALUE || 0,
      mo: item.MO_VALUE || 0,
      cu: item.CU_VALUE || 0,
      co: item.CO_VALUE || 0,
      al: item.AL_VALUE || 0,
      nb: item.NB_VALUE || 0,
      v: item.V_VALUE || 0,
      ti: item.TI_VALUE || 0,
      b: item.B_VALUE || 0,
      n: item.N_VALUE || 0,
      ca: item.CA_VALUE || 0,
      back_c2: item.BACK_C2 || '',
      mat_yeild: item.MAT_YEILD || 100
    }));
};

const query_souce = async () => {

  // 2. 显示加载中提示（提升用户体验）
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA');
  block.addRow({
    ST_NO: form.stNo,
    BACKLOG_EA: form.backlogEa,
  });
  // 3. 调用后台查询接口
  const response = await erFormHelper.callService('fbsm15z_inq2', inInfo);

  // const dataArray2 = response.getBlock("STOCK").data || []; // 加||[]防止data为undefined

  // storageAreaDataSourceIF.value = dataArray2.map((item: any) => ({
  //   seq_id: item['CODE']?.toString() || '',
  //   name: item['CODE_DESC']?.toString() || '',
  //   description: item['CODE_DESC']?.toString() || ''
  // }));
  // // console.log('库区信息storageAreaDataSourceIF', storageAreaDataSourceIF);
  // storageAreaDataSourceBOF.value = dataArray2.map((item: any) => ({
  //   seq_id: item['CODE']?.toString() || '',
  //   name: item['CODE_DESC']?.toString() || '',
  //   description: item['CODE_DESC']?.toString() || ''
  // }));

  // storageAreaDataSourceAOD.value = dataArray2.map((item: any) => ({
  //   seq_id: item['CODE']?.toString() || '',
  //   name: item['CODE_DESC']?.toString() || '',
  //   description: item['CODE_DESC']?.toString() || ''
  // }));

  // storageAreaDataSourceEAF.value = dataArray2.map((item: any) => ({
  //   seq_id: item['CODE']?.toString() || '',
  //   name: item['CODE_DESC']?.toString() || '',
  //   description: item['CODE_DESC']?.toString() || ''
  // }));

  //中类信息：
  const dataArray3 = response.getBlock("MIDDLECATEGORY").data || []; // 加||[]防止data为undefined
  middleCategoryDataSource.value = dataArray3.map((item: any) => ({
    seq_id: item['CODE']?.toString() || '',
    name: item['CODE_DESC']?.toString() || '',
    description: item['CODE_DESC']?.toString() || ''
  }));

  //工艺路径
  const dataArray4 = response.getBlock("BACKLOGEA").data || []; // 加||[]防止data为undefined
  processRouteDataSource.value = dataArray4.map((item: any) => ({
    seq_id: item['CODE']?.toString() || '',
    name: item['CODE_DESC']?.toString() || '',
    description: item['CODE_DESC']?.toString() || ''
  }));

  // console.log('工艺路径');

  const dataArray5 = response.getBlock("EAFYIELDRATE").data || []; // 加||[]防止data为undefined
  //数组结构：[重量收得率, C % 收得率, Si % 收得率, Mn % 收得率, P % 收得率, S % 收得率, Cr % 收得率, Ni % 收得率, Mo % 收得率, Cu % 收得率, Co % 收得率, Al % 收得率, Nb % 收得率, V % 收得率, Ti % 收得率, B % 收得率, N % 收得率, Ca % 收得率]
  eafYieldRate.value[0] = Number(dataArray5[0]["YIELD_CONS"]);
  eafYieldRate.value[6] = Number(dataArray5[0]["YIELD_CR"]);
  eafYieldRate.value[7] = Number(dataArray5[0]["YIELD_NI"]);
  eafYieldRate.value[8] = Number(dataArray5[0]["YIELD_MO"]);

  const dataArray6 = response.getBlock("AODYIELDRATE").data || []; // 加||[]防止data为undefined
  //数组结构：[重量收得率, C % 收得率, Si % 收得率, Mn % 收得率, P % 收得率, S % 收得率, Cr % 收得率, Ni % 收得率, Mo % 收得率, Cu % 收得率, Co % 收得率, Al % 收得率, Nb % 收得率, V % 收得率, Ti % 收得率, B % 收得率, N % 收得率, Ca % 收得率]
  aodYieldRate.value[0] = Number(dataArray6[0]["YIELD_CONS"]);
  aodYieldRate.value[6] = Number(dataArray6[0]["YIELD_CR"]);
  aodYieldRate.value[7] = Number(dataArray6[0]["YIELD_NI"]);
  aodYieldRate.value[8] = Number(dataArray6[0]["YIELD_MO"]);

  const dataArray7 = response.getBlock("BOFYIELDRATE").data || []; // 加||[]防止data为undefined
  //数组结构：[重量收得率, C % 收得率, Si % 收得率, Mn % 收得率, P % 收得率, S % 收得率, Cr % 收得率, Ni % 收得率, Mo % 收得率, Cu % 收得率, Co % 收得率, Al % 收得率, Nb % 收得率, V % 收得率, Ti % 收得率, B % 收得率, N % 收得率, Ca % 收得率]
  bofYieldRate.value[0] = Number(dataArray7[0]["YIELD_CONS"]);
  bofYieldRate.value[6] = Number(dataArray7[0]["YIELD_CR"]);
  bofYieldRate.value[7] = Number(dataArray7[0]["YIELD_NI"]);
  bofYieldRate.value[8] = Number(dataArray7[0]["YIELD_MO"]);

  const dataArray8 = response.getBlock("IFYIELDRATE").data || []; // 加||[]防止data为undefined
  //数组结构：[重量收得率, C % 收得率, Si % 收得率, Mn % 收得率, P % 收得率, S % 收得率, Cr % 收得率, Ni % 收得率, Mo % 收得率, Cu % 收得率, Co % 收得率, Al % 收得率, Nb % 收得率, V % 收得率, Ti % 收得率, B % 收得率, N % 收得率, Ca % 收得率]
  ifYieldRate.value[0] = Number(dataArray8[0]["YIELD_CONS"]);
  ifYieldRate.value[6] = Number(dataArray8[0]["YIELD_CR"]);
  ifYieldRate.value[7] = Number(dataArray8[0]["YIELD_NI"]);
  ifYieldRate.value[8] = Number(dataArray8[0]["YIELD_MO"]);

  //console.log('收得率的值eafYieldRate', eafYieldRate);
  flag_souce.value = "1";

};

const refreshFormula = async (e: any) => {
  p_query();
};

// 组件挂载时初始化
onMounted(() => {
  setTimeout(() => {
    query_souce();
    if (!efFormIsReady.value) {
      showContent.value = true;
      setTimeout(() => {
        p_query();
      }, 500);
    }
  }, 1000);
});

</script>

<style lang="scss" scoped>
.form-layout {
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* 添加垂直滚动 */
  overflow-x: hidden;
  /* 隐藏水平滚动 */
}

/* 五个区域的高度分配 - 改为自动高度 */
.area-1 {
  height: auto;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-2 {
  height: auto;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-3 {
  height: auto;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-4 {
  height: auto;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-5 {
  height: auto;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

/* 区域1：基本信息 + 操作按钮 */
.top-container {
  height: 100%;
  display: flex;
  gap: 15px;
  flex: 1;
}

.base-info-section {
  flex: 0 0 40%;
  /* 固定30%宽度 */
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 确保最小高度 */
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

/* 操作按钮区域 */
.action-panel {
  flex: 0 0 60%;
  /* 固定70%宽度 */
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

.button-row:first-child {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.button-row:last-child {
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
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

  &-icon {
    font-size: 14px;
    flex-shrink: 0;
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

/* 表格区域通用样式 */
.formula-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  /* 改为可见 */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: auto;
  /* 高度自适应 */
}

.formula-content {
  flex: 1;
  display: flex;
  gap: 8px;
  overflow: visible;
  /* 改为可见 */
  height: 100%;
  /* 确保高度填充 */
}

/* 左侧竖排标题 - 不同区域不同颜色 */
.vertical-title {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* IF默认颜色 */
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.vertical-title.eaf-title {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  /* EAF红色系 */
}

.vertical-title.aod-title {
  background: linear-gradient(135deg, #20c997 0%, #12b886 100%);
  /* AOD绿色系 */
}

.vertical-title.bof-title {
  background: linear-gradient(135deg, #4d96ff 0%, #3578e5 100%);
  /* BOF蓝色系 */
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

/* 右侧表格容器 */
.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: auto;
  min-width: 0; // 关键：允许收缩
}

.spreadsheet-wrapper {
  flex: 1;
  border-radius: 4px;
  overflow: visible;
  /* 改为可见 */
  /* 最小高度 */
  height: auto;
  /* 高度自适应 */
  width: 100%;
  min-width: 0; // 关键 [^5^]
}

/* 自定义滚动条样式 */
.form-layout::-webkit-scrollbar {
  width: 10px;
  /* 滚动条宽度 */
}

.form-layout::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 轨道背景 */
  border-radius: 5px;
}

.form-layout::-webkit-scrollbar-thumb {
  background: #888;
  /* 滑块颜色 */
  border-radius: 5px;
}

.form-layout::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 滑块悬停颜色 */
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .top-container {
    flex-direction: column;
    height: auto;
  }

  .button-row {
    flex-wrap: wrap;
  }


  .info-row {
    flex-wrap: wrap;
    gap: 10px;
  }

  .info-item {
    flex: 0 0 calc(50% - 5px);
  }



  .vertical-text {
    font-size: 14px;
    padding: 10px 5px;
    letter-spacing: 2px;
  }


}

/* 将这个样式块从 @media (max-width: 768px) 内部移动到全局区域 */
.form-select.readonly-field {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  /* 外层.info-value已有padding，内层设为0避免双重padding */
  border: none;
  /* 关键：去掉自身边框，只保留外层.info-value的边框 */
  border-radius: 4px;
  background: transparent;
  /* 背景透明，显示外层白色背景 */
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

  .area-1,
  .area-2,
  .area-3,
  .area-4,
  .area-5 {
    height: auto;
    margin-bottom: 10px;
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

  .info-grid {
    gap: 8px;
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