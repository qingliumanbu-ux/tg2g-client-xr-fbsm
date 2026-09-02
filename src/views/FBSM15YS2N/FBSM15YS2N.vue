<template>
  <xr-ef-form @ready="efFormReady" @closeDialog="closeEfDialog"
    :in-dialog-form-name="openInDialog ? dialogFormName : 'null'" :show-close-button="false">
    <template v-if="showContent">
      <!-- 配料单主区域，分为5个区域 -->
      <div class="form-layout" @click="handleFormClick">
        <!-- 区域1：基本信息 + 操作按钮 (15%) -->
        <div class="area-1" style="height:15%">
          <div class="top-container" style="display: flex; width: 100% !important;">
            <!-- 基本信息区域：强制占满整行，内部内容均匀分布 -->
            <div class="base-info-section"
              style="width: 90% !important; display: flex; flex-direction: column; flex: 1; box-sizing: border-box; padding: 0 10px;">
              <div class="info-grid"
                style="width: 100%; display: flex; flex-direction: row; gap: 8px; flex-wrap: nowrap; align-items: center;">
                <!-- 合并为一行六列 -->
                <div class="info-item" style="flex: 1; padding: 0 8px; min-width: 100px;">
                  <div class="info-label required"
                    style="text-align: left; font-weight: bold; margin-bottom: 4px; font-size: 12px;">配料单号</div>
                  <div class="info-value" style="text-align: left; font-size: 12px;">{{ form.composeListNo || ' ' }}
                  </div>
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
                <div class="info-item" style="flex: 1; padding: 0 8px; min-width: 100px;">
                  <div class="info-label required"
                    style="text-align: left; font-weight: bold; margin-bottom: 4px; font-size: 12px;">出钢记号</div>
                  <div class="info-value" style="text-align: left; font-size: 12px;">{{ form.stNo || ' ' }}</div>
                </div>
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
                <div class="info-item" style="flex: 1; padding: 0 8px; min-width: 100px;">
                  <div class="info-label required"
                    style="text-align: left; font-weight: bold; margin-bottom: 4px; font-size: 12px;">总炉数</div>
                  <div class="info-value" style="text-align: left; font-size: 12px;">{{ form.furnaceCount || '0' }}
                  </div>
                </div>
                <div class="info-item" style="flex: 1; padding: 0 8px; min-width: 100px;">
                  <div class="info-label required"
                    style="text-align: left; font-weight: bold; margin-bottom: 4px; font-size: 12px;">配料日期</div>
                  <div class="info-value" style="text-align: left; font-size: 12px;">{{ form.createDate || '2024-01-01'
                    }}</div>
                </div>
              </div>
            </div>





            <!-- 操作按钮区域 -->
            <div class="action-panel" style="width:10% !important; flex: 0 0 10% !important;">
              <div class="button-row" style="justify-content: flex-end;">
                <button class="btn btn-info" @click="exportFormula">
                  <span class="btn-icon">📤</span> 导出
                </button>
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
                  <Spreadsheet ref="spreadsheetRefIF" :initial-rows="4" :initial-columns="13" :row-height="22"
                    :column-width="columnWidthsIF" :data="materialDataIF" :protected-rows="protectedRowsIF"
                    :protected-columns="protectedColumnsIF" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'IF'" :readonly="true" @cell-update="handleCellUpdateIF"
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
                  <Spreadsheet ref="spreadsheetRefEAF" :initial-rows="6" :initial-columns="13" :row-height="22"
                    :column-width="columnWidthsEAF" :data="materialDataEAF" :protected-rows="protectedRowsEAF"
                    :protected-columns="protectedColumnsEAF" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'EAF'" :readonly="true" @cell-update="handleCellUpdateEAF"
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
                  <Spreadsheet ref="spreadsheetRefBOF" :initial-rows="6" :initial-columns="13" :row-height="22"
                    :column-width="columnWidthsBOF" :data="materialDataBOF" :protected-rows="protectedRowsBOF"
                    :protected-columns="protectedColumnsBOF" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'BOF'" :readonly="true" @cell-update="handleCellUpdateBOF"
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
                  <Spreadsheet ref="spreadsheetRefAOD" :initial-rows="10" :initial-columns="13" :row-height="22"
                    :column-width="columnWidthsAOD" :data="materialDataAOD" :protected-rows="protectedRowsAOD"
                    :protected-columns="protectedColumnsAOD" :auto-height="true" :showColumnHeaders="false"
                    :active="activeSpreadsheet === 'AOD'" :readonly="true" @cell-update="handleCellUpdateAOD"
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
  <!-- <xr-ef-dialog ref="dialogRef" title="导入模板" v-model:visible="HistoryVisible" width=100% height=100%>
    <FBSM15MS2N :openInDialog="true" :parentInfo="HistoryInfo" @getChildInfo="getChildHistory"
      :dialogFormName="dialogFormName">
    </FBSM15MS2N>
  </xr-ef-dialog> -->
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
import HistoryDialog from './FBSM15MS2N.vue'

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

const openInDialog = ref("FBSM15YS2N");

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

// 通用小代码查询功能，初始化数据源时使用
const queryCodeClass = async (codeClass: string): Promise<DataSourceItem[]> => {
  const sql = `SELECT CODE, 
                      CODE_DESC_1_CONTENT 
               FROM TEP0002 
               WHERE CODE_CLASS = '${codeClass}' 
               ORDER BY CODE`;

  const outInfo = await erFormHelper.querySql('', sql);

  // 判断查询异常
  if (outInfo.sys.status < 0) {
    console.error(`代码组[${codeClass}]查询失败:`, outInfo.msg);
    return [];
  }

  // 检查是否有数据
  if (outInfo.getBlock(0).data.length === 0) {
    console.warn(`TEP0002表中未找到代码组[${codeClass}]配置`);
    return [];
  }

  // 转换为DataSourceItem格式
  return outInfo.getBlock(0).data.map((item: any) => ({
    seq_id: item['CODE']?.toString() || '',
    name: item['CODE_DESC_1_CONTENT']?.toString() || '',
    description: item['CODE_DESC_1_CONTENT']?.toString() || ''
  }));
};

// ========== 加载库区数据源（使用通用查询）==========
const loadStorageAreaDataSource = async () => {
  // 调用通用查询，传入代码组名称 'FBSM13'
  const dbData = await queryCodeClass('FBSM13');

  if (dbData.length === 0) {
    erFormHelper.messageWarning('库区配置加载失败，使用默认配置');
    return;
  }

  // 更新到所有炉型的数据源配置中
  storageAreaDataSourceIF.value = dbData;
  storageAreaDataSourceEAF.value = dbData;
  storageAreaDataSourceAOD.value = dbData;
  storageAreaDataSourceBOF.value = dbData;

  console.log('库区数据源加载成功:', dbData);
};
// ========== 加载中类代码数据源（FBSM09）==========
const loadMiddleCategoryDataSource = async () => {
  const dbData = await queryCodeClass('FBSM09');

  if (dbData.length > 0) {
    middleCategoryDataSource.value = dbData;
    console.log('中类代码数据源加载成功:', dbData);
  } else {
    console.warn('中类代码配置加载失败');
    // 失败时不设置默认值，保持空数组，模板中会显示原值兜底
  }
};
// ========== 动态查询工艺路线数据源（TFBSM02表）==========
const loadProcessRouteDataSource = async () => {
  // 配料单号格式校验：至少需要6位才能解析出工艺路线代码（第5-6位）
  if (!form.composeListNo || form.composeListNo.length < 6) {
    console.warn('配料单号长度不足，无法解析工艺路线代码');
    processRouteDataSource.value = [];
    return;
  }

  // 解析工艺路线代码（第5-6位，索引4-5）
  // 配料单号格式：[出钢记号第2位][中类代码3位][工艺路线代码2位][日期6位][流水号2位]
  const processRouteCode = form.composeListNo.substring(4, 6);
  console.log('解析到的工艺路线代码:', processRouteCode);

  // 查询TFBSM02表获取工艺路线中文描述
  const sql = `SELECT CODE, DESCRIP 
               FROM TFBSM02 
               WHERE CODE = '${processRouteCode}'`;

  const outInfo = await erFormHelper.querySql('', sql);

  // 判断查询异常（仿照示例写法）
  if (outInfo.sys.status < 0) {
    console.error(`工艺路线代码[${processRouteCode}]查询失败:`, outInfo.msg);
    erFormHelper.messageWarning('工艺路线配置加载失败');
    return;
  }

  // 检查是否有数据（仿照示例写法）
  if (outInfo.getBlock(0).data.length === 0) {
    console.warn(`TFBSM02表中未找到工艺路线代码[${processRouteCode}]配置`);
    // 未找到配置时，使用代码本身作为显示文本兜底
    processRouteDataSource.value = [{
      seq_id: processRouteCode,
      name: processRouteCode,
      description: processRouteCode
    }];
    return;
  }

  // 转换为DataSourceItem格式（仿照示例的字段访问方式）
  const dbData = outInfo.getBlock(0).data.map((item: any) => ({
    seq_id: item['CODE']?.toString() || '',
    name: item['DESCRIP']?.toString() || '',
    description: item['DESCRIP']?.toString() || ''
  }));

  // 更新工艺路线数据源
  processRouteDataSource.value = dbData;
  console.log('工艺路线数据源加载成功:', dbData);

};


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
const columnWidthsIF = ref<number[]>([
  180,  // 0: 物料名称
  60,   // 1: 重量(t)
  50,   // 2: C%
  50,   // 3: Si%
  50,   // 4: Mn%
  60,   // 5: P%
  60,   // 6: S%
  50,   // 7: Cr%
  50,   // 8: Ni%
  50,   // 9: Mo%
  50,   // 10: Cu%
  50,   // 11: Co%
  80,   // 12: 库区
  100,  // 13: 物料代码
  100,  // 14: 批次号
  45,   // 15: Al%
  45,   // 16: Nb%
  45,   // 17: V%
  45,   // 18: Ti%
  45,   // 19: B%
  45,   // 20: N%
  45    // 21: Ca%
]);

// IF物料名称数据源
const materialDataSourceIF: Ref<DataSourceItem[]> = ref([]);


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

// EAF列配置（调整顺序，新增批次号列）
const columnWidthsEAF = ref<number[]>([
  180,  // 0: 物料名称
  60,   // 1: 重量(t)
  50,   // 2: C%
  50,   // 3: Si%
  50,   // 4: Mn%
  60,   // 5: P%
  60,   // 6: S%
  50,   // 7: Cr%
  50,   // 8: Ni%
  50,   // 9: Mo%
  50,   // 10: Cu%
  50,   // 11: Co%
  80,   // 12: 库区
  100,  // 13: 物料代码
  100,  // 14: 批次号
  45,   // 15: Al%
  45,   // 16: Nb%
  45,   // 17: V%
  45,   // 18: Ti%
  45,   // 19: B%
  45,   // 20: N%
  45    // 21: Ca%
]);

// EAF物料名称数据源
const materialDataSourceEAF: Ref<DataSourceItem[]> = ref([]);

// // EAF库区数据源
// const storageAreaDataSourceEAF: DataSourceItem[] = [
//   { seq_id: '废钢区', name: '废钢库区', description: '废钢专用存储区' },
//   { seq_id: '合金区', name: '合金库区', description: '合金材料存储区' },
//   { seq_id: '镍铁区', name: '镍铁库区', description: '镍铁专用存储区' },
//   { seq_id: '辅料区', name: '辅料库区', description: '辅助材料存储区' },
//   { seq_id: '电极区', name: '电极库区', description: '电极专用存储区' },
//   { seq_id: '渣料区', name: '渣料库区', description: '渣料处理区域' }
// ];

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

// AOD列配置（调整顺序，新增批次号列）
const columnWidthsAOD = ref<number[]>([
  180,  // 0: 物料名称
  60,   // 1: 重量(t)
  50,   // 2: C%
  50,   // 3: Si%
  50,   // 4: Mn%
  60,   // 5: P%
  60,   // 6: S%
  50,   // 7: Cr%
  50,   // 8: Ni%
  50,   // 9: Mo%
  50,   // 10: Cu%
  50,   // 11: Co%
  80,   // 12: 库区
  100,  // 13: 物料代码
  100,  // 14: 批次号
  45,   // 15: Al%
  45,   // 16: Nb%
  45,   // 17: V%
  45,   // 18: Ti%
  45,   // 19: B%
  45,   // 20: N%
  45    // 21: Ca%
]);

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

// BOF列配置（调整顺序，新增批次号列）
const columnWidthsBOF = ref<number[]>([
  180,  // 0: 物料名称
  60,   // 1: 重量(t)
  50,   // 2: C%
  50,   // 3: Si%
  50,   // 4: Mn%
  60,   // 5: P%
  60,   // 6: S%
  50,   // 7: Cr%
  50,   // 8: Ni%
  50,   // 9: Mo%
  50,   // 10: Cu%
  50,   // 11: Co%
  80,   // 12: 库区
  100,  // 13: 物料代码
  100,  // 14: 批次号
  45,   // 15: Al%
  45,   // 16: Nb%
  45,   // 17: V%
  45,   // 18: Ti%
  45,   // 19: B%
  45,   // 20: N%
  45    // 21: Ca%
]);

// AOD物料名称数据源
const materialDataSourceAOD: Ref<DataSourceItem[]> = ref([]);

// // AOD库区数据源
// const storageAreaDataSourceAOD: DataSourceItem[] = [
//   { seq_id: '合金区', name: '合金库区', description: '合金材料存储区' },
//   { seq_id: '镍铁区', name: '镍铁库区', description: '镍铁专用存储区' },
//   { seq_id: '辅料区', name: '辅料库区', description: '辅助材料存储区' },
//   { seq_id: '气体区', name: '气体库区', description: '气体供应区域' },
//   { seq_id: '渣料区', name: '渣料库区', description: '渣料处理区域' },
//   { seq_id: '成品区', name: '成品库区', description: '成品钢水区域' }
// ];

// ========== BOF配料单数据 ==========
// BOF物料名称数据源
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([]);


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
      columns: ['storageArea', 'name', 'code', 'batchNumber', 'c', 'si', 'mn', 'p', 's', 'cr', 'ni', 'mo', 'cu', 'co', 'al', 'nb', 'v', 'ti', 'b', 'n', 'ca'],
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
    dataSource: {
      data: dataSource,
      displayField: 'name',
      valueField: 'seq_id',
      searchable: true,
      columns: ['seq_id', 'name', 'description'],
      title: '选择库区'
    }
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


/**
 * 将数据源数组添加到物料数据中
 * @param target 目标物料数据引用（如 materialDataIF）
 * @param data 数据源数组，格式为 [{Mat_name:'',StorageArea:'',Weight:'',C:'',Si:'',...}]
 * @param formulaType 配料单类型：'IF' | 'EAF' | 'AOD' | 'BOF'
 * @param clearExisting 是否清除现有数据行（默认true）
 * @param skipRecalculate 是否跳过重新计算特殊行（默认false）
 */

/**
 * 示例用法：
 *
 * // 数据源格式：从外部读取的数据
 * const sourceData = [
 *   {
 *     Mat_name: '中镍生铁（印尼）',
 *     StorageArea: '高位',
 *     Weight: '30',
 *     C: '2.37',
 *     Si: '0.1',
 *     Mn: '0',
 *     P: '0.025',
 *     S: '0.33',
 *     Cr: '0.27',
 *     Ni: '11.17',
 *     Mo: '0',
 *     Cu: '0',
 *     Co: '0',
 *     Mat_code: 'MAT001',
 *     Batch_no: 'BATCH-IF-001'
 *   },
 *   // ... 更多数据行
 * ];
 *
 * // 用法1：添加到空IF配料单（自动创建表头，清除现有数据，触发重新计算）
 * // 即使materialDataIF为空，方法也会自动创建固定表头行
 * addMaterialDataFromSource(materialDataIF, sourceData, 'IF', true, false);
 *
 * // 用法2：添加到已有数据的EAF配料单（保留现有数据，跳过重新计算）
 * addMaterialDataFromSource(materialDataEAF, sourceData, 'EAF', false, true);
 *
 * // 用法3：完全替换AOD配料单数据（自动创建表头）
 * addMaterialDataFromSource(materialDataAOD, sourceData, 'AOD', true, false);
 *
 * // 注意：表头行使用固定结构，不依赖外部数据源
 */



// 初始化IF物料数据
const initMaterialDataIF = async () => {
  console.log('初始化IF物料数据');
  // 清空现有数据
  materialDataIF.value = [];
  console.log('IF物料数据初始化完成');
};

// 初始化EAF物料数据
const initMaterialDataEAF = () => {
  console.log('初始化EAF物料数据');
  // 清空现有数据
  materialDataEAF.value = [];
  console.log('EAF物料数据初始化完成');
};

// 初始化AOD物料数据
const initMaterialDataAOD = () => {
  // console.log('初始化AOD物料数据');

  // 清空现有数据
  materialDataAOD.value = [];
  // console.log('AOD物料数据初始化完成');
};

// 初始化BOF物料数据
const initMaterialDataBOF = () => {
  // console.log('初始化BOF物料数据');

  // 清空现有数据
  materialDataBOF.value = [];

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
const handleCellUpdateIF = (row: number, col: number, value: any) => {
  // console.log(`IF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataIF.value.length && col >= 0 && col < materialDataIF.value[row].length) {
    materialDataIF.value[row][col].value = value;
  }
};

const handleCellUpdateEAF = (row: number, col: number, value: any) => {
  // console.log(`EAF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataEAF.value.length && col >= 0 && col < materialDataEAF.value[row].length) {
    materialDataEAF.value[row][col].value = value;
  }
};

const handleCellUpdateAOD = (row: number, col: number, value: any) => {
  console.log(`AOD单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataAOD.value.length && col >= 0 && col < materialDataAOD.value[row].length) {
    materialDataAOD.value[row][col].value = value;
  }
};

const handleCellUpdateBOF = (row: number, col: number, value: any) => {
  console.log(`BOF单元格更新: [${row}, ${col}] = ${value}`);
  if (row >= 0 && row < materialDataBOF.value.length && col >= 0 && col < materialDataBOF.value[row].length) {
    materialDataBOF.value[row][col].value = value;
  }
};


// 数据变化处理
const handleDataChangeIF = (data: CellData[][]) => {
  console.log('IF表格数据变化');
  materialDataIF.value = data;
};

const handleDataChangeEAF = (data: CellData[][]) => {
  console.log('EAF表格数据变化');
  materialDataEAF.value = data;
};

const handleDataChangeAOD = (data: CellData[][]) => {
  console.log('AOD表格数据变化');
  materialDataAOD.value = data;
};

const handleDataChangeBOF = (data: CellData[][]) => {
  console.log('BOF表格数据变化');
  materialDataBOF.value = data;
};

const handleHeightChangeBOF = (height: number) => {
  console.log('BOF表格高度变化:', height);
};

// 初始化
const formName = ref('FBSM15YS2N');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";

// xr-ef-form ready事件
const efFormReady = (e: any) => {
  console.log('efFormReady called', e);
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition || 'default';
  initializePage();
};

// 画面相关数据初始化
const initializePage = async () => {
  console.log('initializePage called');
  try {

    // 加载库区数据源
    await loadStorageAreaDataSource();
    // 加载中类代码数据源
    await loadMiddleCategoryDataSource();
    // 加载工艺路线数据源
    await loadProcessRouteDataSource();

    // 兜底：如果查询失败或无数据，使用默认配置
    if (storageAreaDataSourceIF.value.length === 0) {
      console.warn('使用默认库区配置');
      const defaultData = [
        { seq_id: '1', name: '高位库区', description: '高位存储区域' },
        { seq_id: '2', name: '低位库区', description: '低位存储区域' },
        { seq_id: '3', name: '废钢库区', description: '废钢专用存储区' },
        { seq_id: '4', name: '合金库区', description: '合金材料存储区' },
        { seq_id: '5', name: '镍铁库区', description: '镍铁专用存储区' },
        { seq_id: '6', name: '辅料库区', description: '辅助材料存储区' }
      ];
      storageAreaDataSourceIF.value = defaultData;
      storageAreaDataSourceEAF.value = defaultData;
      storageAreaDataSourceAOD.value = defaultData;
      storageAreaDataSourceBOF.value = defaultData;
    }
    // 初始化四个配料单的数据


    const initialResult = await erFormHelper.Initialize(
      formPartition.value,
      formName.value,
      '',
      initializeService
    );

    if (initialResult.flag >= 0) {
      initializeFlag.value = 1;
      showContent.value = true;

      initMaterialDataIF();
      initMaterialDataEAF();
      initMaterialDataBOF();
      initMaterialDataAOD();

      p_query();
      //query_material();


      // 延迟加载表格数据
      setTimeout(() => {
        loadAllSpreadsheetData();
      }, 100);

    } else {
      console.error('Initialize failed:', initialResult.msg);
      erFormHelper.messageError('ErFormHelper initialize failed, error msg is [' + initialResult.msg + ']!');
      showContent.value = true;
      setTimeout(() => {
        loadAllSpreadsheetData();
      }, 500);
    }
  } catch (error) {
    console.error('Initialize error:', error);
    showContent.value = true;
    setTimeout(() => {
      loadAllSpreadsheetData();
    }, 500);
  }
};

// 加载所有表格数据
const loadAllSpreadsheetData = () => {
  console.log('加载所有表格数据');

  // 加载IF配料单数据
  if (spreadsheetRefIF.value) {
    spreadsheetRefIF.value.setData(materialDataIF.value);
  } else {
    setTimeout(() => {
      if (spreadsheetRefIF.value) {
        spreadsheetRefIF.value.setData(materialDataIF.value);
      }
    }, 300);
  }

  // 加载EAF配料单数据
  if (spreadsheetRefEAF.value) {
    spreadsheetRefEAF.value.setData(materialDataEAF.value);
  } else {
    setTimeout(() => {
      if (spreadsheetRefEAF.value) {
        spreadsheetRefEAF.value.setData(materialDataEAF.value);
      }
    }, 300);
  }

  // 加载AOD配料单数据
  if (spreadsheetRefAOD.value) {
    spreadsheetRefAOD.value.setData(materialDataAOD.value);
  } else {
    setTimeout(() => {
      if (spreadsheetRefAOD.value) {
        spreadsheetRefAOD.value.setData(materialDataAOD.value);
      }
    }, 300);
  }

  // 加载BOF配料单数据
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.setData(materialDataBOF.value);
  } else {
    setTimeout(() => {
      if (spreadsheetRefBOF.value) {
        spreadsheetRefBOF.value.setData(materialDataBOF.value);
      }
    }, 300);
  }

  // erFormHelper.messageInfo('所有配料数据已加载');
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

// 主查询入口
const p_query = async () => {
  // 组装查询条件
  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: Number(form.backlogEa) || 0
  };

  if (!queryParams.composeListNo) {
    erFormHelper.messageWarning("请先选择/输入配料单号，再执行查询");
    return;
  }

  // 调用后台服务
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE');
  block.addRow({
    COMPOSE_LIST_NO: queryParams.composeListNo,
    ST_NO: queryParams.stNo,
    BACKLOG_EA: queryParams.backlogEa,
    MATERIAL_CODE: queryParams.materialCode,
  });

  console.log('后台查询传入：', inInfo);
  const response = await erFormHelper.callService('fbsm15y_inq', inInfo);
  const dataArray = response.getBlock(0).data || [];

  console.log('后台查询返回：', dataArray);

  // 空数据处理
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    erFormHelper.messageInfo('暂无配料单明细数据');
    materialDataIF.value = [createFixedHeaderRow()];
    materialDataEAF.value = [createFixedHeaderRow()];
    materialDataAOD.value = [createFixedHeaderRow()];
    materialDataBOF.value = [createFixedHeaderRow()];
    loadAllSpreadsheetData();
    return;
  }

  // 按炉型分组
  const groupedData = {
    IF: dataArray.filter(item => item.STATION_ID === "Z"),
    EAF: dataArray.filter(item => item.STATION_ID === "E"),
    AOD: dataArray.filter(item => item.STATION_ID === "A"),
    BOF: dataArray.filter(item => item.STATION_ID === "B")
  };

  // 获取辅助数据
  const remarkData = response.getBlock('REMARK')?.data?.[0] || {};
  const controlData = response.getBlock('CONTROL')?.data?.[0];

  // 构建各炉型表格（纯展示，无计算）
  materialDataIF.value = buildTableData(groupedData.IF, 'IF', remarkData["BACK_IF"]?.toString());
  materialDataEAF.value = buildTableData(groupedData.EAF, 'EAF', remarkData["BACK_EAF"]?.toString());
  materialDataBOF.value = buildTableData(groupedData.BOF, 'BOF', remarkData["BACK_BOF"]?.toString());

  // AOD特殊处理：包含预溶液和内控标准
  materialDataAOD.value = buildAODTableData(
    groupedData.AOD,
    remarkData["BACK_AOD"]?.toString(),
    controlData
  );

  // 刷新显示
  await nextTick();
  loadAllSpreadsheetData();
  erFormHelper.messageInfo('配料单数据查询完成');
};

// 统筹构建 IF/EAF/BOF 三个炉型的表格结构（表头+数据行+备注）
const buildTableData = (
  rows: any[],
  formulaType: 'IF' | 'EAF' | 'BOF',
  remark?: string
): CellData[][] => {

  const result: CellData[][] = [createFixedHeaderRow()];

  // 处理每一行（区分物料行和计算行）
  rows.forEach(row => {
    if (isCalculatedRow(row)) {
      // 配料成分、出钢成分等
      result.push(createCalculatedRow(row));
    } else {
      // 普通物料行
      result.push(createMaterialRow(row, formulaType));
    }
  });

  // 添加备注行（如果有）
  if (remark !== undefined) {
    result.push(createRemarkRow(remark));
  }

  return result;
};

// AOD专用表格构建
const buildAODTableData = (
  rows: any[],
  remark?: string,
  controlData?: any
): CellData[][] => {

  const result: CellData[][] = [createFixedHeaderRow()];

  // 分离物料行和计算行
  const materialRows: CellData[][] = [];
  const calculatedRows: CellData[][] = [];

  rows.forEach(row => {
    if (isCalculatedRow(row)) {
      calculatedRows.push(createCalculatedRow(row));
    } else {
      materialRows.push(createMaterialRow(row, 'AOD'));
    }
  });

  // 提取预溶液成分行（放在物料行之前）
  const preSolutionRow = calculatedRows.find(r => r[0]?.value === '预溶液成分');
  const otherCalculatedRows = calculatedRows.filter(r => r[0]?.value !== '预溶液成分');

  // 其余计算行排序：出钢成分 -> 配料成分
  const sortOrder: Record<string, number> = {
    '出钢成分': 0,
    '配料成分': 1
  };
  otherCalculatedRows.sort((a, b) => {
    const nameA = String(a[0]?.value || '');
    const nameB = String(b[0]?.value || '');
    return (sortOrder[nameA] ?? 99) - (sortOrder[nameB] ?? 99);
  });

  // 顺序：预溶液成分 -> 物料行 -> 出钢成分 -> 配料成分
  if (preSolutionRow) result.push(preSolutionRow);
  materialRows.forEach(row => result.push(row));
  otherCalculatedRows.forEach(row => result.push(row));

  // 添加内控标准行（如果有数据）
  if (controlData) {
    // 在配料成分行之后、内控上限之前加一行空行
    const peiliaoIndex = result.findIndex(row => row[0]?.value === '配料成分');
    if (peiliaoIndex !== -1) {
      const emptyRow: CellData[] = Array(22).fill(null).map(() => ({
        value: '',
        format: 'text' as const,
        alignment: 'center' as TextAlign,
        isProtected: true
      }));
      result.splice(peiliaoIndex + 1, 0, emptyRow);
    }

    result.push(...createControlRows(controlData));
  }

  // 添加备注行
  if (remark !== undefined) {
    result.push(createRemarkRow(remark));
  }

  return result;
};

// 创建固定表头
const createFixedHeaderRow = (): CellData[] => {
  const headers = [
    '物料名称', '重量(t)', 'C%', 'Si%', 'Mn%', 'P%', 'S%',
    'Cr%', 'Ni%', 'Mo%', 'Cu%', 'Co%', '库区', '物料代码', '批次号',
    'Al%', 'Nb%', 'V%', 'Ti%', 'B%', 'N%', 'Ca%'
  ];

  return headers.map((text, index) => ({
    value: text,
    format: 'text' as const,
    fontWeight: 'bold',
    alignment: index === 0 ? 'left' : 'center' as TextAlign,
    isProtected: true
  }));
};

// 判断是否为计算行
const isCalculatedRow = (row: any): boolean => {
  const calculatedTypes = ['配料成分', '出钢成分', '预溶液成分'];
  return calculatedTypes.includes(row.MAT_NAME);
};

// 创建物料行
const createMaterialRow = (
  row: any,
  formulaType: 'IF' | 'EAF' | 'AOD' | 'BOF'
): CellData[] => {

  // 使用原有辅助函数创建带数据源的单元格，然后锁定
  const materialNameCell = createMaterialNameCell(row.MAT_NAME || '', formulaType);
  materialNameCell.isProtected = true;  // 只读，但数据源保留用于显示转换

  const storageAreaCell = createStorageAreaCell(row.STOCK_NAME || '', formulaType);
  storageAreaCell.isProtected = true;    // 只读，但数据源保留用于代码转汉字

  const materialCodeCell = createMaterialCodeCell(row.MAT_CODE || '');
  // 原有辅助函数已设置 isProtected，这里保持不变

  const batchCell = createBatchNumberCell(row.LOT_NO || '');
  batchCell.isProtected = true;

  // 数值列构造器（只读）
  const numCell = (val: any): CellData => ({
    value: formatNumber(val),
    format: 'number',
    alignment: 'right',
    isProtected: true
  });

  return [
    materialNameCell,        // 0: 物料名称（带数据源，只读）
    numCell(row.WEIGHT),     // 1: 重量
    numCell(row.C_VALUE),    // 2: C%
    numCell(row.SI_VALUE),   // 3: Si%
    numCell(row.MN_VALUE),   // 4: Mn%
    numCell(row.P_VALUE),    // 5: P%
    numCell(row.S_VALUE),    // 6: S%
    numCell(row.CR_VALUE),   // 7: Cr%
    numCell(row.NI_VALUE),   // 8: Ni%
    numCell(row.MO_VALUE),   // 9: Mo%
    numCell(row.CU_VALUE),   // 10: Cu%
    numCell(row.CO_VALUE),   // 11: Co%
    storageAreaCell,         // 12: 库区（带数据源，只读）
    materialCodeCell,        // 13: 物料代码
    batchCell,               // 14: 批次号
    numCell(row.AL_VALUE),   // 15: Al%
    numCell(row.NB_VALUE),   // 16: Nb%
    numCell(row.V_VALUE),    // 17: V%
    numCell(row.TI_VALUE),   // 18: Ti%
    numCell(row.B_VALUE),    // 19: B%
    numCell(row.N_VALUE),    // 20: N%
    numCell(row.CA_VALUE)    // 21: Ca%
  ];
};

// 创建计算行（配料/出钢/预溶液）
const createCalculatedRow = (row: any): CellData[] => {
  const baseStyle = {
    fontWeight: 'bold' as const,
    isProtected: true
  };

  // 出钢成分行使用暗色底色
  const isSteelmakingRow = row.MAT_NAME === '出钢成分';
  const bgStyle = isSteelmakingRow ? { style: { backgroundColor: '#d9d0c0' } } : {};

  // 辅助函数：创建计算行单元格
  const calcCell = (val: any, digits: number = 2): CellData => ({
    value: formatNumber(val, digits),
    format: 'number',
    alignment: 'right',
    ...baseStyle,
    ...bgStyle
  });

  return [
    // 0: 行类型标识（如"配料成分"）
    { value: row.MAT_NAME || '', format: 'text', alignment: 'center', ...baseStyle, ...bgStyle },

    // 1: 重量
    calcCell(row.WEIGHT, 2),

    // 2-11: 主要化学成分
    calcCell(row.C_VALUE, 2),
    calcCell(row.SI_VALUE, 2),
    calcCell(row.MN_VALUE, 2),
    calcCell(row.P_VALUE, 3),  // P/S 保留3位
    calcCell(row.S_VALUE, 3),
    calcCell(row.CR_VALUE, 2),
    calcCell(row.NI_VALUE, 2),
    calcCell(row.MO_VALUE, 2),
    calcCell(row.CU_VALUE, 2),
    calcCell(row.CO_VALUE, 2),

    // 12-14: 库区、代码和批次（通常为空）
    { value: row.STOCK_NAME || '', format: 'text', alignment: 'center', ...baseStyle, ...bgStyle },
    { value: row.MAT_CODE || '', format: 'text', alignment: 'center', ...baseStyle, ...bgStyle },
    { value: row.LOT_NO || '', format: 'text', alignment: 'center', ...baseStyle, ...bgStyle },

    // 15-21: 微量元素
    calcCell(row.AL_VALUE, 2),
    calcCell(row.NB_VALUE, 2),
    calcCell(row.V_VALUE, 2),
    calcCell(row.TI_VALUE, 2),
    calcCell(row.B_VALUE, 2),
    calcCell(row.N_VALUE, 2),
    calcCell(row.CA_VALUE, 2)
  ];
};

// 创建备注行
const createRemarkRow = (remark: string): CellData[] => {
  return [
    {
      value: '备注',
      format: 'text',
      fontWeight: 'bold',
      alignment: 'center',
      isProtected: true
    },
    {
      value: remark || ' ',
      format: 'text',
      alignment: 'left',
      colspan: 12,  // 跨12列显示
      isProtected: true
    },
    // 填充剩余9列，保持数组长度一致
    ...Array(9).fill(null).map(() => ({
      value: '',
      format: 'text' as const,
      alignment: 'center' as TextAlign,
      isProtected: true
    }))
  ];
};

// 创建内控标准行（AOD专用）
const createControlRows = (controlData: any): CellData[][] => {

  // 单条内控行构造器
  const createSingleRow = (label: string, suffix: string): CellData[] => {
    const base = { fontWeight: 'bold' as const, isProtected: true };

    const numVal = (key: string, digits: number = 2): CellData => ({
      value: formatNumber(controlData[`${key}_${suffix}`], digits),
      format: 'number',
      alignment: 'right',
      ...base
    });

    return [
      { value: label, format: 'text', alignment: 'center', ...base },
      { value: '', format: 'text', alignment: 'center', ...base },  // 重量空

      // 成分标准
      numVal('C', 2), numVal('SI', 2), numVal('MN', 2),
      numVal('P', 3), numVal('S', 3),  // P/S 精度3位
      numVal('CR', 2), numVal('NI', 2), numVal('MO', 2),
      numVal('CU', 2), numVal('CO', 2),

      // 库区、代码和批次空
      { value: '', format: 'text', alignment: 'center', ...base },
      { value: '', format: 'text', alignment: 'center', ...base },
      { value: '', format: 'text', alignment: 'center', ...base },

      // 微量元素
      numVal('AL', 2), numVal('NB', 2), numVal('V', 2),
      numVal('TI', 2), numVal('B', 2), numVal('N', 2), numVal('CA', 2)
    ];
  };

  return [
    createSingleRow('内控上限', 'MAX'),
    createSingleRow('内控目标', 'AIM'),
    createSingleRow('内控下限', 'MIN')
  ];
};

// 统一处理数值空值和精度格式化
const formatNumber = (value: any, digits: number = 2): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toFixed(digits);
};



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
  block.addColumns('COMPOSE_LIST_NO', 'ST_NO');
  block.addRow({
    ST_NO: queryParams.stNo,
  });
  // 3. 调用后台查询接口
  const response = await erFormHelper.callService('fbsm15z_material_inq', inInfo);
  const dataArray = response.getBlock(0).data || []; // 加||[]防止data为undefined

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    // erFormHelper.messageInfo('暂无配料单明细数据');
    loadAllSpreadsheetData(); // 即使无数据也刷新计算，避免表格异常
    return;
  }
  // 初始化表格数据（清空原有数据）
  // console.log('物料代码加载查询：', dataArray);
  materialDataSourceIF.value = [];
  materialDataSourceAOD.value = [];
  materialDataSourceBOF.value = [];
  materialDataSourceEAF.value = [];

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
      ca: item.CA_VALUE || 0
    }));

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
      ca: item.CA_VALUE || 0
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
      ca: item.CA_VALUE || 0
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
      ca: item.CA_VALUE || 0
    }));
}

const refreshFormula = async (e: any) => {
  p_query();
};

// 组件挂载时初始化
onMounted(() => {
  setTimeout(() => {
    if (!efFormIsReady.value) {
      //console.log('efFormReady not called, initializing manually');
      showContent.value = true;
      setTimeout(() => {
        // p_query();
        // query_material();
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
  min-height: unset;
  max-height: none;
  overflow: visible;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-2 {
  height: auto;
  min-height: unset;
  max-height: none;
  overflow: visible;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-3 {
  height: auto;
  min-height: unset;
  max-height: none;
  overflow: visible;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-4 {
  height: auto;
  min-height: unset;
  max-height: none;
  overflow: visible;
  /* 改为自动高度 */
  /* 最小高度 */
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.area-5 {
  height: auto;
  min-height: unset;
  max-height: none;
  overflow: visible;
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
  flex: 0 0 10%;
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
  min-width: 0;
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
  overflow-x: auto;
  overflow-y: visible;
  /* 改为可见 */
  height: auto;
  /* 高度自适应 */
  min-width: 0;
  width: 100%;
}

.spreadsheet-wrapper {
  flex: 1;
  border-radius: 4px;
  overflow: visible;
  /* 改为可见 */
  /* 最小高度 */
  height: auto;
  max-height: none;
  /* 高度自适应 */
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