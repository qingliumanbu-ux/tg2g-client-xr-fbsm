<template>
  <xr-ef-form @ready="efFormReady" :f2-do="F2_DO" :f3-do="F3_DO" :f4-do="F4_DO" :f5-do="F5_DO" :f6-do="F6_DO"
    :f7-do="F7_DO" :f8-do="F8_DO" :f9-do="F9_DO" :f10-do="F10_DO" :f11-do="F11_DO" :f12-do="F12_DO">
    <template v-if="initializeFlag === 1">
      <er-layout :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'" :allow-collapse="true" />

      <v-splitter style="height: 90%">
        <v-splitter-pane :size="show_flg_1 && show_flg_2 ? 25 : (show_flg_1 ? 100 : 0)">
          <xr-ef-panel title="钢种信息" padding="5px" style="height: 100%;">
            <template #customButtonSlot>
              <a-button @click="show_flg_1 = !show_flg_1" type="primary" v-if="show_flg_1 && show_flg_2"
                v-text="'<<折叠'" />
              <a-button @click="show_flg_2 = !show_flg_2" type="primary" v-if="!show_flg_2" v-text="'>>配料单信息'" />
            </template>
            <template #contentSlot>
              <div style="display: flex; flex-direction: column; height: 100%;">
                <er-grid style="flex: 1; min-height: 0;" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                  @erGridReady="erGridReady" @focus-changed="selectionChanged_1" @double-click="dbbutClick" />
                <er-layout :er-form-helper-prop="erFormHelper" :config-id="'LayoutDetail'" :allow-collapse="true" />
              </div>
            </template>
          </xr-ef-panel>
        </v-splitter-pane>

        <v-splitter-pane :size="show_flg_1 && show_flg_2 ? 75 : (show_flg_2 ? 100 : 0)">
          <div style="display: flex; flex-direction: column; height: 100%;">
            <xr-ef-panel class="right-panel" :title="right_title" padding="5px" style="flex: 1; min-height: 0; ">
              <template #customButtonSlot>
                <a-button @click="show_flg_2 = !show_flg_2" type="primary" v-if="show_flg_2 && show_flg_1"
                  v-text="'折叠>>'" />
                <a-button @click="show_flg_1 = !show_flg_1" type="primary" v-if="!show_flg_1" v-text="'<<钢种信息'" />
                <a-layout-header style="width:300px"></a-layout-header>
              </template>
              <template #contentSlot>
                <div v-if="showContent" style="height: 100%; overflow: visible;">
                  <FBSM17ZS2N_Embed ref="embedRef" :show-toolbar="true" :form="form"
                    :process-route-data-source="processRouteDataSource"
                    :middle-category-data-source="middleCategoryDataSource" :has-i-f-material-data="hasIFMaterialData"
                    :has-d-s-material-data="hasDSMaterialData" :has-e-a-f-material-data="hasEAFMaterialData"
                    :has-b-o-f-material-data="hasBOFMaterialData" :has-a-o-d-material-data="hasAODMaterialData"
                    :material-data-i-f="materialDataIF" :material-data-d-s="materialDataDS"
                    :material-data-e-a-f="materialDataEAF" :material-data-b-o-f="materialDataBOF"
                    :material-data-a-o-d="materialDataAOD" :column-widths="columnWidths"
                    :protected-rows-d-s="protectedRowsDS" :protected-rows-i-f="protectedRowsIF"
                    :protected-rows-e-a-f="protectedRowsEAF" :protected-rows-b-o-f="protectedRowsBOF"
                    :protected-rows-a-o-d="protectedRowsAOD" :protected-columns-i-f="protectedColumnsIF"
                    :protected-columns-d-s="protectedColumnsDS" :protected-columns-e-a-f="protectedColumnsEAF"
                    :protected-columns-b-o-f="protectedColumnsBOF" :protected-columns-a-o-d="protectedColumnsAOD"
                    :active-spreadsheet="activeSpreadsheet" :special-row-labels="specialRowLabels"
                    :is-checked="isChecked" @cell-update-if="handleCellUpdateIF" @data-change-if="handleDataChangeIF"
                    @cell-update-eaf="handleCellUpdateEAF" @data-change-eaf="handleDataChangeEAF"
                    @cell-update-bof="handleCellUpdateBOF" @data-change-bof="handleDataChangeBOF"
                    @cell-update-aod="handleCellUpdateAOD" @data-change-aod="handleDataChangeAOD"
                    @cell-update-ds="handleCellUpdateDS" @data-change-ds="handleDataChangeDS"
                    @activated="activateSpreadsheet" @deactivated="deactivateAllSpreadsheets"
                    @refs-ready="onEmbedRefsReady" @form-click="handleFormClick" />
                </div>
              </template>
            </xr-ef-panel>
          </div>
        </v-splitter-pane>
      </v-splitter>
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

  <!-- 进度条遮罩层 -->
  <div v-if="showProgress" class="progress-overlay">
    <div class="progress-box">
      <div class="progress-title">模型计算中，请稍候...</div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-text">{{ progressPercent }}%</div>
    </div>
  </div>
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
import FBSM17ZS2N_Embed from './FBSM17ZS2N_Embed.vue';

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{
  [key: string]: any
}>({});
const efFormIsReady = ref(false);
const showContent = ref(true);

// 进度条
const showProgress = ref(false);
const progressPercent = ref(0);
let progressTimer: ReturnType<typeof setInterval> | null = null;

const startProgress = (duration: number = 10000) => {
  showProgress.value = true;
  progressPercent.value = 0;
  const step = 100 / (duration / 100);
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (progressPercent.value < 90) {
      progressPercent.value = Math.floor(Math.min(90, progressPercent.value + step));
    }
  }, 100);
};

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  progressPercent.value = 100;
  setTimeout(() => {
    showProgress.value = false;
    progressPercent.value = 0;
  }, 300);
};

//显示信息
const show_flg_1 = ref<any>(true);
const show_flg_2 = ref<any>(false);
const show_flg_3 = ref<any>(false);
const show_check = ref<any>(false);
const isChecked = ref(false);

const right_title = ref("'配料单信息'");
const templateComposeListNo = ref('');

//业务变量
let debug_flg = true; //调试日志开关

// Spreadsheet 引用 - 三个独立引用
const spreadsheetRefDS = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefIF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefEAF = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefAOD = ref<InstanceType<typeof Spreadsheet>>();
const spreadsheetRefBOF = ref<InstanceType<typeof Spreadsheet>>();

// 当前激活的spreadsheet组件
const activeSpreadsheet = ref<'DS' | 'IF' | 'EAF' | 'AOD' | 'BOF' | null>(null);

// 嵌入组件 ref
const embedRef = ref<InstanceType<typeof FBSM17ZS2N_Embed> | null>(null);

// 接收嵌入组件内部的 Spreadsheet refs，使父组件原有逻辑无需大改
const onEmbedRefsReady = (refs: any) => {
  spreadsheetRefDS.value = refs.spreadsheetRefDS?.value;
  spreadsheetRefIF.value = refs.spreadsheetRefIF?.value;
  spreadsheetRefEAF.value = refs.spreadsheetRefEAF?.value;
  spreadsheetRefAOD.value = refs.spreadsheetRefAOD?.value;
  spreadsheetRefBOF.value = refs.spreadsheetRefBOF?.value;
};

//显示事件
//隐藏窗口按钮
const btn_left = async () => {
  if (debug_flg) console.log("btn_left");
  show_flg_1.value = !show_flg_1.value;
};

const btn_right = async () => {
  if (debug_flg) console.log("btn_right");
  show_flg_2.value = !show_flg_2.value;
};

const erGridReady = (e: any) => {
  //erFormHelper.setGridEditable("gridviewMain", false);
};

//勾选行事件 / 焦点行切换：先查左侧，再联动右侧
const selectionChanged_1 = async (e: any) => {
  // 1. 获取当前行数据并同步到 form
  const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
  erFormHelper.setControlValueEx(
    "LayoutDetail",
    currentRow
  );
};

const dbbutClick = async () => {
  show_flg_2.value = true;

  const currentRow = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');

  right_title.value = "配料单信息(" + currentRow.data[0]["COMPOSE_LIST_NO"] + "_" + currentRow.data[0]["ST_NO"] + "_" + currentRow.data[0]["BACKLOG_EA_DESC"] + ")";


  Object.assign(form, {
    composeListNo: currentRow.data[0]["COMPOSE_LIST_NO"] || '',
    materialCode: currentRow.data[0]["MATERIAL_CODE"] || '',
    commFmlyCode: currentRow.data[0]["COMM_FMLY_CODE"] || '',
    seqNo: currentRow.data[0]["SEQ_NO"] || '',
    stNo: currentRow.data[0]["ST_NO"] || '',
    furnaceCount: currentRow.data[0]["FURNACE_COUNT"] || '',
    backlogEa: currentRow.data[0]["BACKLOG_EA"] || '',
    createDate: currentRow.data[0]["DATE_TIME"] || '',
  });

  // 设置审核状态
  isChecked.value = currentRow.data[0]["CHECK_FLAG"] === '1' || currentRow.data[0]["CHECK_FLAG"] === 1;

  if (currentRow.data[0]["CHECK_FLAG"] === '1' || currentRow.data[0]["CHECK_FLAG"] === 1) {
    templateComposeListNo.value = String(currentRow.data[0]["COMPOSE_LIST_NO"] ?? '');
  }
  else {
    templateComposeListNo.value = '';
  }

  console.log('配料单:', form.composeListNo);
  // 2. 联动右侧配料单查询
  await p_query();

};

const F2_DO = async (e: any) => {
  if (debug_flg) console.log(e.name + e.desc);
  await p_query_left();
  erFormHelper.setControlValue('LayoutGroupFilter', 'MAT_CODE_LIST', '');
};

//F3启动模型
const F3_DO = async (e: any) => {
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getGridSelectRowsAsBlock('gridviewMain'), 'Main');

  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'), 'query');

  const mainGridCheckedRow = erFormHelper.getGridSelectRowsAsBlock('gridviewMain');
  if (mainGridCheckedRow.data.length < 1) {
    erFormHelper.messageWarning('请勾选钢种信息');
    return false;
  }

  startProgress(1500);
  try {
    const outInfo = await erFormHelper.callService('fbsm17_col', inInfo, true, false, true);

    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.sys.msg);
      return false;
    }
    await p_query_left();

    await nextTick();
    erFormHelper.setGridIndicator('gridviewMain', {
      ST_NO: mainGridCheckedRow.data[0]["ST_NO"]?.toString() || " ",
      BACKLOG_EA: mainGridCheckedRow.data[0]["BACKLOG_EA"]?.toString() || " ",
      DATE_C: mainGridCheckedRow.data[0]["DATE_C"]?.toString() || " ",
    });


    setTimeout(() => {
      erFormHelper.checkGridCurrentRow('gridviewMain');
      const currentRow = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
      // console.log('启动模型后得数据当前行数据:', currentRow);
      if (currentRow && currentRow.data && currentRow.data.length > 0) {
        right_title.value = "配料单信息(" + currentRow.data[0]["COMPOSE_LIST_NO"] + "_" + currentRow.data[0]["ST_NO"] + "_" + currentRow.data[0]["BACKLOG_EA_DESC"] + ")";
        Object.assign(form, {
          composeListNo: currentRow.data[0]["COMPOSE_LIST_NO"] || '',
          materialCode: currentRow.data[0]["MATERIAL_CODE"] || '',
          commFmlyCode: currentRow.data[0]["COMM_FMLY_CODE"] || '',
          stNo: currentRow.data[0]["ST_NO"] || '',
          furnaceCount: currentRow.data[0]["FURNACE_COUNT"] || '',
          backlogEa: currentRow.data[0]["BACKLOG_EA"] || '',
          createDate: currentRow.data[0]["DATE_TIME"] || '',
        });

        // 2. 联动右侧配料单查询
        p_query();
      }
    }, 500);

    erFormHelper.messageSuccess('模型计算完成');
  } finally {
    stopProgress();
  }
};

//F4矫正基础数据
const F4_DO = async (e: any) => {
  const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
  if (!currentRow) {
    erFormHelper.messageWarning('请先选择一条配料信息！');
    return;
  }
  EFCallForm("FBSM00S2N", {
    PARENT: 'FBSM17S2N', // 标识父画面
    COMM_FMLY_CODE: currentRow.get('COMM_FMLY_CODE'), // 传递主表选中行的ST_NO
    MATERIAL_CODE: currentRow.get('MATERIAL_CODE'), // 传递物料编码
    BACKLOG_EA: currentRow.get('BACKLOG_EA'),
    ST_NO: currentRow.get('ST_NO'),
    TABLE_ID: 'tfbsm01',
    // 可添加其他需要传递的参数
  });
};

//F5保存
const F5_DO = async (e: any) => {
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

  // 检测左侧 gridviewMain 是否有修改
  const leftChanges = erFormHelper.getGridChangedRowsAsEiInfo('gridviewMain', undefined, 'Main');
  const leftHasChanges = Object.keys(leftChanges.blocks).some(key =>
    key.startsWith('Main_') && leftChanges.blocks[key].data && leftChanges.blocks[key].data.length > 0
  );

  // 检测右侧配料单是否有修改（检查是否有 lightgreen 标记的单元格）
  const hasRightModified = (materialData: CellData[][]) => {
    if (!materialData || materialData.length <= 1) return false;
    for (let row = 1; row < materialData.length; row++) {
      for (let col = 0; col < materialData[row].length; col++) {
        if (materialData[row][col]?.style?.backgroundColor === 'lightgreen' && materialData[row][0].value !== '备注') {
          return true;
        }
      }
    }
    return false;
  };

  //右侧配料单的备注信息修改
  const hasRightRemark = (materialData: CellData[][]) => {
    if (!materialData || materialData.length <= 1) return false;
    for (let row = 1; row < materialData.length; row++) {
      for (let col = 0; col < materialData[row].length; col++) {
        if (materialData[row][col]?.style?.backgroundColor === 'lightgreen' && materialData[row][0].value === '备注') {
          return true;
        }
      }
    }
    return false;
  };

  const rightDSModified = hasDSMaterialData.value && hasRightModified(materialDataDS.value);
  const rightIFModified = hasIFMaterialData.value && hasRightModified(materialDataIF.value);
  const rightEAFModified = hasEAFMaterialData.value && hasRightModified(materialDataEAF.value);
  const rightAODModified = hasAODMaterialData.value && hasRightModified(materialDataAOD.value);
  const rightBOFModified = hasBOFMaterialData.value && hasRightModified(materialDataBOF.value);
  const rightHasChanges = rightIFModified || rightEAFModified || rightAODModified || rightBOFModified || rightDSModified;

  const rightRemarkChanges = (hasDSMaterialData.value && hasRightRemark(materialDataDS.value)) || (hasIFMaterialData.value && hasRightRemark(materialDataIF.value)) || (hasEAFMaterialData.value && hasRightRemark(materialDataEAF.value)) || (hasAODMaterialData.value && hasRightRemark(materialDataAOD.value)) || (hasBOFMaterialData.value && hasRightRemark(materialDataBOF.value));

  // 如果没有检测到任何修改，提示并返回
  if (!leftHasChanges && !rightHasChanges && !rightRemarkChanges) {
    erFormHelper.messageWarning('没有检测到任何修改，无需保存');
    return;
  }

  // 提取所有可见配料单的数据
  //console.log('开始提取配料单数据...');

  const inInfo = new EI.EIInfo();

  // 如果有左侧修改，加入左侧变更数据
  if (leftHasChanges) {
    Object.values(leftChanges.blocks).forEach(block => {
      if (block.data && block.data.length > 0) {
        inInfo.addBlock(block);
      }
    });
  }



  if (rightDSModified || rightIFModified || rightEAFModified || rightAODModified || rightBOFModified) {

    const block = inInfo.addBlock(new EI.EiBlock('query'));
    block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
    block.addRow({
      COMPOSE_LIST_NO: form.composeListNo,
      ST_NO: form.stNo,
      BACKLOG_EA: form.backlogEa,
      MATERIAL_CODE: form.materialCode,
      DATE_TIME: form.createDate,
    });

    if (hasDSMaterialData.value && spreadsheetRefDS.value) {
      const dsData = extractMaterialData(materialDataDS.value);
      //console.log('IF配料单数据:', ifData);
      const block0 = inInfo.addBlock(new EI.EiBlock('DS'));
      block0.pushData(dsData, true);
    }

    if (hasIFMaterialData.value && spreadsheetRefIF.value) {
      const ifData = extractMaterialData(materialDataIF.value);
      //console.log('IF配料单数据:', ifData);
      const block1 = inInfo.addBlock(new EI.EiBlock('IF'));
      block1.pushData(ifData, true);
    }

    if (hasEAFMaterialData.value && spreadsheetRefEAF.value) {
      const eafData = extractMaterialData(materialDataEAF.value);
      //console.log('EAF配料单数据:', eafData);
      const block2 = inInfo.addBlock(new EI.EiBlock('EAF'));
      block2.pushData(eafData, true);
    }

    if (hasAODMaterialData.value && spreadsheetRefAOD.value) {
      const aodData = extractMaterialData(materialDataAOD.value);
      //console.log('AOD配料单数据:', aodData);
      const block3 = inInfo.addBlock(new EI.EiBlock('AOD'));
      block3.pushData(aodData, true);
    }

    if (hasBOFMaterialData.value && spreadsheetRefBOF.value) {
      const bofData = extractMaterialData(materialDataBOF.value);
      //console.log('BOF配料单数据:', bofData);
      const block4 = inInfo.addBlock(new EI.EiBlock('BOF'));
      block4.pushData(bofData, true);

    }
  }
  else {
    if (rightRemarkChanges) {
      const block = inInfo.addBlock(new EI.EiBlock('query_remark'));
      block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE', 'DATE_TIME');
      block.addRow({
        COMPOSE_LIST_NO: form.composeListNo,
        ST_NO: form.stNo,
        BACKLOG_EA: form.backlogEa,
        MATERIAL_CODE: form.materialCode,
        DATE_TIME: form.createDate,
      });

      if (hasDSMaterialData.value && spreadsheetRefDS.value) {
        const dsData = extractMaterialData(materialDataDS.value);
        //console.log('IF配料单数据:', ifData);
        const block0 = inInfo.addBlock(new EI.EiBlock('DS_REMARK'));
        block0.pushData(dsData, true);
      }

      if (hasIFMaterialData.value && spreadsheetRefIF.value) {
        const ifData = extractMaterialData(materialDataIF.value);
        //console.log('IF配料单数据:', ifData);
        const block1 = inInfo.addBlock(new EI.EiBlock('IF_REMARK'));
        block1.pushData(ifData, true);
      }

      if (hasEAFMaterialData.value && spreadsheetRefEAF.value) {
        const eafData = extractMaterialData(materialDataEAF.value);
        //console.log('EAF配料单数据:', eafData);
        const block2 = inInfo.addBlock(new EI.EiBlock('EAF_REMARK'));
        block2.pushData(eafData, true);
      }

      if (hasAODMaterialData.value && spreadsheetRefAOD.value) {
        const aodData = extractMaterialData(materialDataAOD.value);
        //console.log('AOD配料单数据:', aodData);
        const block3 = inInfo.addBlock(new EI.EiBlock('AOD_REMARK'));
        block3.pushData(aodData, true);
      }

      if (hasBOFMaterialData.value && spreadsheetRefBOF.value) {
        const bofData = extractMaterialData(materialDataBOF.value);
        //console.log('BOF配料单数据:', bofData);
        const block4 = inInfo.addBlock(new EI.EiBlock('BOF_REMARK'));
        block4.pushData(bofData, true);

      }

    }
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
      await p_query();
      await p_query_left();
      erFormHelper.setGridIndicator("gridviewMain", { COMPOSE_LIST_NO: form.composeListNo });

      setTimeout(() => {
        const currentRow = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
        if (currentRow && currentRow.data && currentRow.data.length > 0) {
          right_title.value = "配料单信息(" + currentRow.data[0]["COMPOSE_LIST_NO"] + "_" + currentRow.data[0]["ST_NO"] + "_" + currentRow.data[0]["BACKLOG_EA_DESC"] + ")";
        }
      }, 0);
    }


    erFormHelper.messageSuccess('配料单保存成功');
  }
};

//F10总库存查询
const F10_DO = async (e: any) => {

  EFCallForm("FBSM13S2N", {
    PARENT: 'FBSM17S2N', // 标识父画面
    COMM_FMLY_CODE: "' '", // 传递主表选中行的ST_NO
    // 可添加其他需要传递的参数
  });
};

const p_query_left = async () => {
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  const outInfo = await erFormHelper.callService('fbsm17_inq', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError('查询错误:' + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, 'gridviewMain');
  }
  console.log('p_query_left完成');
};

const query = async () => {
};

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
  seqNo: '1',         // 序号（对应父SEQ_NO）
  createDate: '',    // 制单日期（父DATE_C+DATE_TIME拼接/转换）
  stNo: '',          // 工位号（对应父ST_NO）
  furnaceCount: 0,   // 炉数（父字符串转数字）
  backlogEa: '',      // 待处理数量（父字符串转数字）
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
    backlogEa: '', parentPage: ''
  })
}


// 激活spreadsheet组件
const activateSpreadsheet = (type: 'IF' | 'EAF' | 'AOD' | 'BOF' | 'DS') => {
  // console.log('激活spreadsheet组件:', type);
  activeSpreadsheet.value = type;

  // 先强制停止所有其他组件的编辑状态
  if (type !== 'DS' && spreadsheetRefDS.value) {
    spreadsheetRefDS.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
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
  if (spreadsheetRefDS.value) {
    spreadsheetRefDS.value.forceStopEditing();
    // 不再重新设置数据，避免不必要的重新渲染和滚动
  }
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
const materialDataDS = ref<CellData[][]>([]);

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
const hasDSMaterialData = computed(() => {
  if (materialDataDS.value.length <= 1) return false; // 只有表头或为空

  for (let row = 1; row < materialDataDS.value.length; row++) {
    const firstCellValue = materialDataDS.value[row][0]?.value;
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
  { seq_id: 'MAT001', name: '中镍生铁（印尼）', code: 'MAT001', category: '生铁', storageArea: '高位', batchNumber: 'BATCH-IF-001', weight: 0, c: 2.37, si: 0.1, mn: 0, p: 0.025, s: 0.33, cr: 0.27, ni: 11.17, mo: 0, cu: 0, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
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
  { seq_id: 'MAT101', name: '废钢', code: 'MAT101', category: '废钢', storageArea: '废钢区', batchNumber: 'BATCH-EAF-001', weight: 0, c: 0.15, si: 0.2, mn: 0.5, p: 0.02, s: 0.025, cr: 18.5, ni: 8.5, mo: 0.2, cu: 0.3, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
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
  { seq_id: 'MAT201', name: '高碳铬铁', code: 'MAT201', category: '铬铁', storageArea: '合金区', batchNumber: 'BATCH-AOD-001', weight: 0, c: 7.2, si: 1.8, mn: 0.5, p: 0.025, s: 0.02, cr: 62.0, ni: 0, mo: 0, cu: 0.1, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);


// ========== BOF配料单数据 ==========
// BOF物料名称数据源
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([
  { seq_id: 'MAT301', name: '废钢', code: 'MAT301', category: '废钢', storageArea: '废钢区', batchNumber: 'BATCH-BOF-001', weight: 0, c: 0.15, si: 0.2, mn: 0.5, p: 0.02, s: 0.025, cr: 18.5, ni: 8.5, mo: 0.2, cu: 0.3, co: 0, al: 0, nb: 0, v: 0, ti: 0, b: 0, n: 0, ca: 0, back_c2: ' ', mat_yeild: 100 },
]);

// 备注信息
const remarkInfoDS = ref(' ');
const remarkInfoIF = ref(' ');
const remarkInfoEAF = ref(' ');
const remarkInfoAOD = ref(' ');
const remarkInfoBOF = ref(' ');
const remarkInfoAODLL = ref(' ');

// 收得率系数（初始化时加载）
// 数组结构：[重量收得率, C%收得率, Si%收得率, Mn%收得率, P%收得率, S%收得率, Cr%收得率, Ni%收得率, Mo%收得率, Cu%收得率, Co%收得率, Al%收得率, Nb%收得率, V%收得率, Ti%收得率, B%收得率, N%收得率, Ca%收得率]
const eafYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // EAF收得率系数数组
const aodYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // AOD收得率系数数组
const bofYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // BOF收得率系数数组
const ifYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // BOF收得率系数数组
const dsYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // EAF收得率系数数组

const aodY = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

//配料重量到出钢重量的收得率
const weightYield = ref([1, 1, 1, 1]);

// AOD内控标准（初始化时加载）
const aodControlUpper = ref([3.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co% 上限
const aodControlTarget = ref([3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // 目标值
const aodControlLower = ref([2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // 下限
const p_flag = ref(' ');
// 配料单类型
type FormulaType = 'IF' | 'EAF' | 'AOD' | 'BOF' | 'DS';

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
  },
  DS: {
    material: materialDataSourceIF,
    storageArea: storageAreaDataSourceIF
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
      columns: ['storageArea', 'name', 'code', 'batchNumber', 'weight', 'c', 'si', 'mn', 'p', 's', 'cr', 'ni', 'mo', 'cu', 'co', 'al', 'nb', 'v', 'ti', 'b', 'n', 'ca', 'back_c2', 'mat_yeild'],
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

const createNumberCell_1 = (value: string | number = '', alignment: TextAlign = 'right'): CellData => {
  return {
    value: String(value),
    format: 'number:1',
    alignment
  };
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
  remarkInfo: string,
  clearExisting: boolean = true,
  skipRecalculate: boolean = false
) => {
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

  if (formulaType === 'AOD') {
    const addrow1 = addSteelRows('预溶液成分');
    newDataRows.push(addrow1);
  }

  // 添加新的数据行
  data.forEach(item => {
    const row: CellData[] = [
      createMaterialNameCell(item.Mat_name, formulaType),        // 列0: 物料名称
      createStorageAreaCell(item.StorageArea, formulaType),     // 列1: 库区
      createNumberCell_1(item.Weight),                            // 列2: 重量(t)
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

  if (formulaType != 'DS') {
    const addrow = addSteelRows('配料成分');
    newDataRows.push(addrow);
  }
  if (formulaType != 'IF' && formulaType != 'DS') {
    const addrow1 = addSteelRows('出钢成分');
    newDataRows.push(addrow1);
  }
  if (formulaType === 'AOD') {
    newDataRows.push(addSteelRows('内控上限'));
    newDataRows.push(addSteelRows('内控目标'));
    newDataRows.push(addSteelRows('内控下限'));
  }
  // 更新目标数据
  target.value = newDataRows;



  //内控和目标
  if (formulaType === 'AOD') {
    // console.log('内控目标值', aodControlTarget);
    // console.log('内控上限', aodControlUpper);
    const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '内控下限');
    if (existingIndex !== -1) {
      for (let i = 0; i < aodControlLower.value.length; i++) {
        if (i < 11) {
          materialDataAOD.value[existingIndex][2 + i].value = aodControlLower.value[i].toFixed(3);
        }
        else {

          materialDataAOD.value[existingIndex][2 + i + 2].value = aodControlLower.value[i].toFixed(3);
        }
      }
    }

    const existingIndex1 = materialDataAOD.value.findIndex(row => row[0]?.value === '内控目标');
    if (existingIndex1 !== -1) {
      for (let i = 1; i < aodControlTarget.value.length; i++) {
        if (i < 11) {
          materialDataAOD.value[existingIndex1][2 + i].value = aodControlTarget.value[i].toFixed(3);
        }
        else {
          materialDataAOD.value[existingIndex1][2 + i + 2].value = aodControlTarget.value[i].toFixed(3);
        }
      }
    }

    const existingIndex2 = materialDataAOD.value.findIndex(row => row[0]?.value === '内控上限');
    if (existingIndex2 !== -1) {
      for (let i = 0; i < aodControlUpper.value.length; i++) {
        if (i < 11) {
          materialDataAOD.value[existingIndex2][2 + i].value = aodControlUpper.value[i].toFixed(3);
        }
        else {
          materialDataAOD.value[existingIndex2][2 + i + 2].value = aodControlUpper.value[i].toFixed(3);
        }
      }
    }
  }

  console.log(`${formulaType}配料单数据更新完成，总行数：${newDataRows.length}`);

  // 确保备注行存在（如果缺失则自动创建）
  const hasRemarkRow = target.value.some(row => row[0]?.value === '备注');
  if (!hasRemarkRow) {
    //加AOD料槽信息
    if (formulaType === 'AOD') {
      target.value.push([
        { value: '备注', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: remarkInfoAODLL.value, format: 'text', alignment: 'center', isProtected: true },
        { value: remarkInfo, format: 'text', alignment: 'left', colspan: 11 },
        { value: '', format: 'text', alignment: 'center' }
      ]);
    }
    else {
      target.value.push([
        { value: '备注', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: remarkInfo, format: 'text', alignment: 'left', colspan: 12 },
        { value: '', format: 'text', alignment: 'center' }
      ]);

    }

  }
};

//创建配料成分、出钢成分
const addSteelRows = (MAT_NAME: string) => {
  const weightAvgRow: CellData[] = [
    { value: MAT_NAME, format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
    { value: '', format: 'text', alignment: 'center', isProtected: true },
    { value: '', format: 'number:1', fontWeight: 'bold', alignment: 'right', isProtected: true }, // 总重量
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // C%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Si%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mn%
    { value: '0', format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // P%
    { value: '0', format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true }, // S%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cr%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Ni%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Mo%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Cu%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: ' ', format: 'text', alignment: 'center', isProtected: true },
    { value: ' ', format: 'text', alignment: 'center', isProtected: true },
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
    { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true }, // Co%
  ];
  return weightAvgRow;
};
// 更新配料成分、出钢成分
const updateSteelRows = (data: CellData[][]) => {
  //更新IF的配料成分行
  const ifFormulaIndex = materialDataIF.value.findIndex(row => row[0]?.value === '配料成分');
  const totalWeightIF = colSteelRows(materialDataIF.value, 'IF');
  //console.log('计算配料成分totalWeightIF', totalWeightIF);
  if (ifFormulaIndex !== -1) {
    materialDataIF.value[ifFormulaIndex][2].value = totalWeightIF[0].toFixed(3); //配料重量
    for (let i = 1; i < totalWeightIF.length - 1; i++) {
      if (i < 11) {
        materialDataIF.value[ifFormulaIndex][2 + i].value = totalWeightIF[0] > 0 ? parseFloat((totalWeightIF[i] / totalWeightIF[0]).toFixed(3)) : 0;
      }
      else {
        materialDataIF.value[ifFormulaIndex][2 + i + 2].value = totalWeightIF[0] > 0 ? parseFloat((totalWeightIF[i] / totalWeightIF[0]).toFixed(3)) : 0;

      }
    }
  }
  // 处理EAF出钢成分行 
  const eafSteelmakingIndex = materialDataEAF.value.findIndex(row => row[0]?.value === '出钢成分');
  const totalWeightEAF = colSteelRows(materialDataEAF.value, 'EAF');
  if (eafSteelmakingIndex !== -1) {
    materialDataEAF.value[eafSteelmakingIndex - 1][2].value = totalWeightEAF[0].toFixed(3); //配料重量
    materialDataEAF.value[eafSteelmakingIndex][2].value = (totalWeightEAF[18] * eafYieldRate.value[0]).toFixed(1); //配料重量  
    for (let i = 1; i < totalWeightEAF.length - 1; i++) {
      if (i < 11) {
        materialDataEAF.value[eafSteelmakingIndex - 1][2 + i].value = totalWeightEAF[0] > 0 ? parseFloat((totalWeightEAF[i] / totalWeightEAF[0]).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataEAF.value[eafSteelmakingIndex][2 + i].value = totalWeightEAF[18] > 0 ? parseFloat((totalWeightEAF[i] * eafYieldRate.value[i] / (totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
      }
      else {
        materialDataEAF.value[eafSteelmakingIndex - 1][2 + i + 2].value = totalWeightEAF[0] > 0 ? parseFloat((totalWeightEAF[i] / totalWeightEAF[0]).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataEAF.value[eafSteelmakingIndex][2 + i + 2].value = totalWeightEAF[18] > 0 ? parseFloat((totalWeightEAF[i] * eafYieldRate.value[i] / (totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
      }
    }
  }

  // 处理BOF出钢成分行
  const bofSteelmakingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '出钢成分');
  const totalWeightBOF = colSteelRows(materialDataBOF.value, 'BOF');
  if (bofSteelmakingIndex !== -1) {
    materialDataBOF.value[bofSteelmakingIndex - 1][2].value = totalWeightBOF[0].toFixed(3); //配料重量
    materialDataBOF.value[bofSteelmakingIndex][2].value = (totalWeightBOF[18] * bofYieldRate.value[0]).toFixed(1); //配料重量  
    for (let i = 1; i < totalWeightBOF.length - 1; i++) {
      if (i < 11) {
        materialDataBOF.value[bofSteelmakingIndex - 1][2 + i].value = totalWeightBOF[0] > 0 ? parseFloat((totalWeightBOF[i] / totalWeightBOF[0]).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataBOF.value[bofSteelmakingIndex][2 + i].value = totalWeightBOF[18] > 0 ? parseFloat((totalWeightBOF[i] * bofYieldRate.value[i] / (totalWeightBOF[18] * bofYieldRate.value[0])).toFixed(3)) : 0;
      }
      else {
        materialDataBOF.value[bofSteelmakingIndex - 1][2 + i + 2].value = totalWeightBOF[0] > 0 ? parseFloat((totalWeightBOF[i] / totalWeightBOF[0]).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataBOF.value[bofSteelmakingIndex][2 + i + 2].value = totalWeightBOF[18] > 0 ? parseFloat((totalWeightBOF[i] * bofYieldRate.value[i] / (totalWeightBOF[18] * bofYieldRate.value[0])).toFixed(3)) : 0;
      }
    }
  }


  //AOD预溶液
  const totalWeightAOD = colSteelRows(materialDataAOD.value, 'AOD');
  const existingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '预溶液成分');
  if (existingIndex !== -1) {
    materialDataAOD.value[existingIndex][2].value = (totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]).toFixed(3); //配料重量
    if (String(form.backlogEa) === '06' || String(form.backlogEa) === '08')//如果是全脱的直接取表里的预熔液成分
    {
      for (let i = 0; i < aodY.value.length; i++) {
        if (i < 9) {
          materialDataAOD.value[existingIndex][2 + i].value = aodY.value[i];
        }
        else {
          materialDataAOD.value[existingIndex][2 + i + 2].value = aodY.value[i];
        }
      }
    }
    else {
      for (let i = 1; i < totalWeightIF.length - 1; i++) {
        if (i < 11) {
          materialDataAOD.value[existingIndex][2 + i].value = (totalWeightIF[18] + totalWeightBOF[18] + totalWeightEAF[18]) > 0 ? parseFloat(((totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) / (totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
        }
        else {
          materialDataAOD.value[existingIndex][2 + i + 2].value = (totalWeightIF[18] + totalWeightBOF[18] + totalWeightEAF[18]) > 0 ? parseFloat(((totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) / (totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
        }
      }
    }
  }

  // 处理AOD出钢成分行
  const aodSteelmakingIndex = materialDataAOD.value.findIndex(row => row[0]?.value === '出钢成分');
  if (aodSteelmakingIndex !== -1) {
    materialDataAOD.value[aodSteelmakingIndex - 1][2].value = (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]).toFixed(3); //配料重量
    materialDataAOD.value[aodSteelmakingIndex][2].value = ((totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) * aodYieldRate.value[0]).toFixed(3); //配料重量  
    for (let i = 1; i < totalWeightAOD.length - 1; i++) {
      if (i < 11) {
        materialDataAOD.value[aodSteelmakingIndex - 1][2 + i].value = (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) / (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataAOD.value[aodSteelmakingIndex][2 + i].value = (totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) * aodYieldRate.value[i] / ((totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) * aodYieldRate.value[0])).toFixed(3)) : 0;
      }
      else {
        materialDataAOD.value[aodSteelmakingIndex - 1][2 + i + 2].value = (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) / (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
        //出钢需要乘以收得率
        materialDataAOD.value[aodSteelmakingIndex][2 + i + 2].value = (totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + totalWeightIF[i] * ifYieldRate.value[i] + totalWeightBOF[i] * bofYieldRate.value[i] + totalWeightEAF[i] * eafYieldRate.value[i]) * aodYieldRate.value[i] / ((totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) * aodYieldRate.value[0])).toFixed(3)) : 0;
      }
    }

    //如果是06，脱硫站后直接AOD，则AOD出钢或是配料需要加上预溶液
    if (String(form.backlogEa) === '06') {
      materialDataAOD.value[aodSteelmakingIndex - 1][2].value = (totalWeightAOD[0] + aodY.value[0]).toFixed(3); //配料重量
      materialDataAOD.value[aodSteelmakingIndex][2].value = ((totalWeightAOD[0] + aodY.value[0]) * aodYieldRate.value[0]).toFixed(3); //配料重量  
      for (let i = 1; i < totalWeightAOD.length - 1; i++) {
        if (i < 11) {
          materialDataAOD.value[aodSteelmakingIndex - 1][2 + i].value = (totalWeightAOD[0] + aodY.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + aodY.value[0] * aodY.value[i]) / (totalWeightAOD[0] + aodY.value[0])).toFixed(3)) : 0;
          //出钢需要乘以收得率
          materialDataAOD.value[aodSteelmakingIndex][2 + i].value = (totalWeightAOD[18] + aodY.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + aodY.value[0] * aodY.value[i]) * aodYieldRate.value[i] / ((totalWeightAOD[18] + aodY.value[0]) * aodYieldRate.value[0])).toFixed(3)) : 0;
        }
        else {
          materialDataAOD.value[aodSteelmakingIndex - 1][2 + i + 2].value = (totalWeightAOD[0] + aodY.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + aodY.value[0] * aodY.value[i]) / (totalWeightAOD[0] + aodY.value[0])).toFixed(3)) : 0;
          //出钢需要乘以收得率
          materialDataAOD.value[aodSteelmakingIndex][2 + i + 2].value = (totalWeightAOD[18] + aodY.value[0]) > 0 ? parseFloat(((totalWeightAOD[i] + aodY.value[0] * aodY.value[i]) * aodYieldRate.value[i] / ((totalWeightAOD[18] + aodY.value[0]) * aodYieldRate.value[0])).toFixed(3)) : 0;
        }
      }
    }
  }

  //如果是铬钢且是三脱，P的出钢成分=上限-0.005,然后倒算出预溶液成分
  //console.log('铬钢且是三脱', String(form.backlogEa));
  if ((String(form.backlogEa) === '06' || String(form.backlogEa) === '08') && ((String(form.stNo).slice(1, 2) === 'F' || String(form.stNo).slice(1, 2) === 'M') && String(form.commFmlyCode) != 'V')) {
    materialDataAOD.value[aodSteelmakingIndex][6].value = materialDataAOD.value[aodSteelmakingIndex + 1][6].value - 0.005;
    //配料成分和预溶液成分的P成分需要改
    // console.log('铬钢且是三脱出钢P', materialDataAOD.value[aodSteelmakingIndex][6].value);
    materialDataAOD.value[aodSteelmakingIndex - 1][6].value = (((materialDataAOD.value[aodSteelmakingIndex][2].value * materialDataAOD.value[aodSteelmakingIndex][6].value) / aodYieldRate.value[4]) / materialDataAOD.value[aodSteelmakingIndex - 1][2].value).toFixed(3);
    // console.log('铬钢且是三脱配料P', materialDataAOD.value[aodSteelmakingIndex - 1][6].value);
    // console.log('铬钢且是三脱A0D配料P', totalWeightAOD[4]);
    materialDataAOD.value[existingIndex][6].value = ((((materialDataAOD.value[aodSteelmakingIndex][2].value * materialDataAOD.value[aodSteelmakingIndex][6].value) / aodYieldRate.value[4]) - totalWeightAOD[4]) / materialDataAOD.value[existingIndex][2].value).toFixed(3);
  }

  //如果是镍钢，控P的钢种，电炉需要脱磷（吹氩）,出钢成分的P使用定值
  const v_st_no = String(form.stNo).slice(1, 2);
  if (eafSteelmakingIndex !== -1 && aodSteelmakingIndex !== -1) {
    let p_value = 0.015;
    if ((v_st_no === 'A' || v_st_no === 'D' || ((v_st_no === 'F' || v_st_no === 'M') && String(form.commFmlyCode) === 'V')) && materialDataAOD.value[aodSteelmakingIndex + 1][6].value <= 0.03 && materialDataAOD.value[aodSteelmakingIndex + 1][6].value > 0 && p_flag.value !== '0') {

      if (materialDataAOD.value[aodSteelmakingIndex + 1][6].value <= 0.025) {
        p_value = 0.01;
      }
      if (materialDataAOD.value[aodSteelmakingIndex + 1][6].value <= 0.02) {
        p_value = 0.007;
      }
      if (materialDataAOD.value[aodSteelmakingIndex + 1][6].value <= 0.015) {
        p_value = 0.005;
      }
      materialDataEAF.value[eafSteelmakingIndex][6].value = p_value;
      materialDataEAF.value[eafSteelmakingIndex][6].style = { color: 'red' };

      materialDataAOD.value[existingIndex][6].value = (totalWeightIF[18] + totalWeightBOF[18] + totalWeightEAF[18]) > 0 ? parseFloat(((totalWeightIF[4] * ifYieldRate.value[4] + totalWeightBOF[4] * bofYieldRate.value[4] + totalWeightEAF[18] * eafYieldRate.value[0] * p_value * eafYieldRate.value[4]) / (totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
      materialDataAOD.value[aodSteelmakingIndex - 1][6].value = (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[4] + totalWeightIF[4] * ifYieldRate.value[4] + totalWeightBOF[4] * bofYieldRate.value[4] + totalWeightEAF[18] * eafYieldRate.value[0] * p_value * eafYieldRate.value[4]) / (totalWeightAOD[0] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0])).toFixed(3)) : 0;
      //出钢需要乘以收得率
      materialDataAOD.value[aodSteelmakingIndex][6].value = (totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) > 0 ? parseFloat(((totalWeightAOD[4] + totalWeightIF[4] * ifYieldRate.value[4] + totalWeightBOF[4] * bofYieldRate.value[4] + totalWeightEAF[18] * eafYieldRate.value[0] * p_value * eafYieldRate.value[4]) * aodYieldRate.value[4] / ((totalWeightAOD[18] + totalWeightIF[18] * ifYieldRate.value[0] + totalWeightBOF[18] * bofYieldRate.value[0] + totalWeightEAF[18] * eafYieldRate.value[0]) * aodYieldRate.value[0])).toFixed(3)) : 0;

    }

  }

  if (aodSteelmakingIndex !== -1) {
    //针对硅成分Si,只算硅铁里的硅，其他不算，其他的还原掉了
    materialDataAOD.value[aodSteelmakingIndex - 1][4].value = parseFloat(materialDataAOD.value[aodSteelmakingIndex - 1][2].value) > 0 ? parseFloat(((totalWeightAOD[2]) / materialDataAOD.value[aodSteelmakingIndex - 1][2].value).toFixed(3)) : 0;
    //出钢需要乘以收得率
    materialDataAOD.value[aodSteelmakingIndex][4].value = parseFloat(materialDataAOD.value[aodSteelmakingIndex][2].value) > 0 ? parseFloat((totalWeightAOD[2] * aodYieldRate.value[2] / (materialDataAOD.value[aodSteelmakingIndex][2].value)).toFixed(3)) : 0;


    //C和S使用目标值aodControlTarget
    materialDataAOD.value[aodSteelmakingIndex][3].value = aodControlTarget.value[1];
    materialDataAOD.value[aodSteelmakingIndex][7].value = aodControlTarget.value[5];

    // AOD出钢成分行：值超出内控上下限时字体变红

    const steelmakingRow = materialDataAOD.value[aodSteelmakingIndex];
    // 列 3-12 (C%-Co%) 对应 内控数组索引 0-9；列 15-21 (Al%-Ca%) 对应 内控数组索引 10-16
    const checkCols: { col: number; controlIndex: number }[] = [];
    for (let col = 2; col <= 12; col++) checkCols.push({ col, controlIndex: col - 2 });
    for (let col = 15; col <= 21; col++) checkCols.push({ col, controlIndex: col - 4 });
    // console.log('变色值col', checkCols);
    for (const { col, controlIndex } of checkCols) {
      const cell = steelmakingRow[col];
      if (!cell) continue;
      if (col === 2) {
        const upper = aodControlUpper.value[controlIndex];
        const lower = aodControlLower.value[controlIndex];
        const steelmakingNum = cell.value;
        const isOutOfRange = upper > 0 && (steelmakingNum > upper || steelmakingNum < lower);
        cell.style = { ...(cell.style || {}), color: isOutOfRange ? 'red' : undefined };
      }
      else if (col === 6 || col === 7) {
        const upper = parseFloat(aodControlUpper.value[controlIndex].toFixed(3));
        const lower = parseFloat(aodControlLower.value[controlIndex].toFixed(3));
        const steelmakingNum = parseFloat(cell.value.toFixed(3)) || 0;

        const isOutOfRange = upper > 0 && (steelmakingNum > upper || steelmakingNum < lower);
        cell.style = { ...(cell.style || {}), color: isOutOfRange ? 'red' : undefined };
      }
      else {
        const upper = parseFloat(aodControlUpper.value[controlIndex].toFixed(2));
        const lower = parseFloat(aodControlLower.value[controlIndex].toFixed(2));
        const steelmakingNum = parseFloat(cell.value.toFixed(2)) || 0;
        const isOutOfRange = upper > 0 && (steelmakingNum > upper || steelmakingNum < lower);
        cell.style = { ...(cell.style || {}), color: isOutOfRange ? 'red' : undefined };

        // console.log('变色值', steelmakingNum);
      }


    }
  }
};

//配料合计值
const colSteelRows = (data: CellData[][], formulaType: String): number[] => {
  let totalWeight = 0;
  let totalWeight_cg = 0;
  const weightedSums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%

  // 特殊行标签，遇到这些标签时停止计算（这些是计算结果行，不是物料数据行）
  // 注意：预溶液成分不在此列表中，因为它需要作为物料参与AOD配料单的计算
  const specialRowLabels = ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注', '预溶液成分'];

  for (let row = 1; row < data.length; row++) {
    const firstCellValue = data[row][0]?.value;
    // 如果遇到特殊行标签，停止计算
    if (!specialRowLabels.includes(firstCellValue)) {
      // 获取重量(t) - 列2
      const weightStr = data[row][2]?.value;
      const weight = parseFloat(weightStr) || 0;
      const mat_yeild = parseFloat(data[row][23]?.value || 100);
      if (data[row][22]?.value != '29') //如果是还原硅的情况，重量不参与,如果是硅铁的，只算里面的硅成分,其他不算
      {
        if (weight > 0) {
          totalWeight_cg += weight * 0.01 * mat_yeild;
          totalWeight += weight;
          // 计算各成分的加权和
          for (let col = 3; col <= 12; col++) { // 列3-12: C%到Co%
            const componentStr = data[row][col]?.value;
            const component = parseFloat(componentStr) || 0;
            if (col === 4) {
              if (formulaType === 'AOD') //AOD硅只算硅铁的
              {
                if (data[row][22]?.value == '27') {
                  weightedSums[col - 3] += weight * component;
                }
              }
              else {
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
  }
  // 计算合计值
  const averages = [totalWeight]; // 第一个值是总重量,最后一个是计算的重量
  for (let i = 0; i < weightedSums.length; i++) {
    averages.push(weightedSums[i]);
  }
  const Weight_cg = totalWeight_cg;
  averages.push(Weight_cg);
  //console.log('计算配料合计AOD', averages);
  return averages;



};

// 受保护的行列配置（简化版）
const protectedRowsDS = computed(() => {
  const protectedRows: number[] = [0];
  for (let i = 0; i < materialDataDS.value.length; i++) {
    if (materialDataDS.value[i][0]?.value != '备注') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

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

const protectedColumnsDS = computed(() => []);
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
        if (material.al !== undefined && materialDataIF.value[row].length > 15) {
          materialDataIF.value[row][15].value = material.al;
        }
        if (material.nb !== undefined && materialDataIF.value[row].length > 16) {
          materialDataIF.value[row][16].value = material.nb;
        }
        if (material.v !== undefined && materialDataIF.value[row].length > 17) {
          materialDataIF.value[row][17].value = material.v;
        }
        if (material.ti !== undefined && materialDataIF.value[row].length > 18) {
          materialDataIF.value[row][18].value = material.ti;
        }
        if (material.b !== undefined && materialDataIF.value[row].length > 19) {
          materialDataIF.value[row][19].value = material.b;
        }
        if (material.n !== undefined && materialDataIF.value[row].length > 20) {
          materialDataIF.value[row][20].value = material.n;
        }
        if (material.ca !== undefined && materialDataIF.value[row].length > 21) {
          materialDataIF.value[row][21].value = material.ca;
        }
        materialDataIF.value[row][22].value = material.back_c2;
        materialDataIF.value[row][23].value = material.mat_yeild;

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
      updateSteelRows(materialDataIF.value);
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

        if (material.al !== undefined && materialDataEAF.value[row].length > 15) {
          materialDataEAF.value[row][15].value = material.al;
        }
        if (material.nb !== undefined && materialDataEAF.value[row].length > 16) {
          materialDataEAF.value[row][16].value = material.nb;
        }
        if (material.v !== undefined && materialDataEAF.value[row].length > 17) {
          materialDataEAF.value[row][17].value = material.v;
        }
        if (material.ti !== undefined && materialDataEAF.value[row].length > 18) {
          materialDataEAF.value[row][18].value = material.ti;
        }
        if (material.b !== undefined && materialDataEAF.value[row].length > 19) {
          materialDataEAF.value[row][19].value = material.b;
        }
        if (material.n !== undefined && materialDataEAF.value[row].length > 20) {
          materialDataEAF.value[row][20].value = material.n;
        }
        if (material.ca !== undefined && materialDataEAF.value[row].length > 21) {
          materialDataEAF.value[row][21].value = material.ca;
        }
        materialDataEAF.value[row][22].value = material.back_c2;
        materialDataEAF.value[row][23].value = material.mat_yeild;

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
      updateSteelRows(materialDataEAF.value);
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

        if (material.al !== undefined && materialDataAOD.value[row].length > 15) {
          materialDataAOD.value[row][15].value = material.al;
        }
        if (material.nb !== undefined && materialDataAOD.value[row].length > 16) {
          materialDataAOD.value[row][16].value = material.nb;
        }
        if (material.v !== undefined && materialDataAOD.value[row].length > 17) {
          materialDataAOD.value[row][17].value = material.v;
        }
        if (material.ti !== undefined && materialDataAOD.value[row].length > 18) {
          materialDataAOD.value[row][18].value = material.ti;
        }
        if (material.b !== undefined && materialDataAOD.value[row].length > 19) {
          materialDataAOD.value[row][19].value = material.b;
        }
        if (material.n !== undefined && materialDataAOD.value[row].length > 20) {
          materialDataAOD.value[row][20].value = material.n;
        }
        if (material.ca !== undefined && materialDataAOD.value[row].length > 21) {
          materialDataAOD.value[row][21].value = material.ca;
        }
        materialDataAOD.value[row][22].value = material.back_c2;
        materialDataAOD.value[row][23].value = material.mat_yeild;

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
      updateSteelRows(materialDataAOD.value);
      // 更新表格数据
      if (spreadsheetRefAOD.value) {
        spreadsheetRefAOD.value.setData(materialDataAOD.value);
      }
    }
  }
};
const handleCellUpdateDS = (row: number, col: number, value: any, selectedItem?: DataSourceItem) => {

  if (row >= 0 && row < materialDataDS.value.length && col >= 0 && col < materialDataDS.value[row].length) {
    materialDataDS.value[row][col].value = value;
    // 标记修改的单元格为红色
    markCellAsModified(row, col, materialDataDS.value);

    // 如果更新的是物料名称列（列0），自动更新库区、物料代码、批次号和化学成分
    if (col === 0 && row > 0) { // row > 0 排除表头行
      // 优先使用弹窗直接传递的完整对象，避免同名物料二次查找匹配到错误行
      const material = selectedItem || findMaterialByName(value, 'DS');
      if (material && materialDataDS.value[row].length > 13) {
        // 自动填充库区（列1）
        if (material.storageArea && materialDataDS.value[row].length > 1) {
          materialDataDS.value[row][1].value = material.storageArea;
        }

        // 自动填充物料代码（列12）
        if (material.code && materialDataDS.value[row].length > 12) {
          materialDataDS.value[row][13].value = material.code;
        }

        // 自动填充批次号（列13）
        if (material.batchNumber && materialDataDS.value[row].length > 13) {
          materialDataDS.value[row][14].value = material.batchNumber;
        }

        // 自动填充化学成分（列3-11）
        if (material.c !== undefined && materialDataDS.value[row].length > 3) {
          materialDataDS.value[row][3].value = material.c; // C%
        }
        if (material.si !== undefined && materialDataDS.value[row].length > 4) {
          materialDataDS.value[row][4].value = material.si; // Si%
        }
        if (material.mn !== undefined && materialDataDS.value[row].length > 5) {
          materialDataDS.value[row][5].value = material.mn; // Mn%
        }
        if (material.p !== undefined && materialDataDS.value[row].length > 6) {
          materialDataDS.value[row][6].value = material.p; // P%
        }
        if (material.s !== undefined && materialDataDS.value[row].length > 7) {
          materialDataDS.value[row][7].value = material.s; // S%
        }
        if (material.cr !== undefined && materialDataDS.value[row].length > 8) {
          materialDataDS.value[row][8].value = material.cr; // Cr%
        }
        if (material.ni !== undefined && materialDataDS.value[row].length > 9) {
          materialDataDS.value[row][9].value = material.ni; // Ni%
        }
        if (material.mo !== undefined && materialDataDS.value[row].length > 10) {
          materialDataDS.value[row][10].value = material.mo; // Mo%
        }
        if (material.cu !== undefined && materialDataDS.value[row].length > 11) {
          materialDataDS.value[row][11].value = material.cu; // Cu%
        }
        if (material.co !== undefined && materialDataDS.value[row].length > 12) {
          materialDataDS.value[row][12].value = material.co; // Co%
        }

        if (material.al !== undefined && materialDataDS.value[row].length > 15) {
          materialDataDS.value[row][15].value = material.al;
        }
        if (material.nb !== undefined && materialDataDS.value[row].length > 16) {
          materialDataDS.value[row][16].value = material.nb;
        }
        if (material.v !== undefined && materialDataDS.value[row].length > 17) {
          materialDataDS.value[row][17].value = material.v;
        }
        if (material.ti !== undefined && materialDataDS.value[row].length > 18) {
          materialDataDS.value[row][18].value = material.ti;
        }
        if (material.b !== undefined && materialDataDS.value[row].length > 19) {
          materialDataDS.value[row][19].value = material.b;
        }
        if (material.n !== undefined && materialDataDS.value[row].length > 20) {
          materialDataDS.value[row][20].value = material.n;
        }
        if (material.ca !== undefined && materialDataDS.value[row].length > 21) {
          materialDataDS.value[row][21].value = material.ca;
        }
        materialDataDS.value[row][22].value = material.back_c2;
        materialDataDS.value[row][23].value = material.mat_yeild;

        // 触发表格数据更新
        if (spreadsheetRefDS.value) {
          spreadsheetRefDS.value.setData(materialDataDS.value);
        }
      }
    }

    if (row < materialDataDS.value.length && materialDataDS.value[row][0]?.value === '备注' && col === 1) {
      remarkInfoDS.value = value;
    }

    // 如果更新的是重量列（列2）或成分列（列3-11），重新计算配料成分和出钢成分
    if (row > 0 && (col === 2 || (col >= 3 && col <= 12))) {
      console.log('重量或成分列更新，重新计算配料成分和出钢成分');
      updateSteelRows(materialDataDS.value);
      // 更新表格数据
      if (spreadsheetRefDS.value) {
        spreadsheetRefDS.value.setData(materialDataDS.value);
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

        if (material.al !== undefined && materialDataBOF.value[row].length > 15) {
          materialDataBOF.value[row][15].value = material.al;
        }
        if (material.nb !== undefined && materialDataBOF.value[row].length > 16) {
          materialDataBOF.value[row][16].value = material.nb;
        }
        if (material.v !== undefined && materialDataBOF.value[row].length > 17) {
          materialDataBOF.value[row][17].value = material.v;
        }
        if (material.ti !== undefined && materialDataBOF.value[row].length > 18) {
          materialDataBOF.value[row][18].value = material.ti;
        }
        if (material.b !== undefined && materialDataBOF.value[row].length > 19) {
          materialDataBOF.value[row][19].value = material.b;
        }
        if (material.n !== undefined && materialDataBOF.value[row].length > 20) {
          materialDataBOF.value[row][20].value = material.n;
        }
        if (material.ca !== undefined && materialDataBOF.value[row].length > 21) {
          materialDataBOF.value[row][21].value = material.ca;
        }
        materialDataBOF.value[row][22].value = material.back_c2;
        materialDataBOF.value[row][23].value = material.mat_yeild;

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
      updateSteelRows(materialDataBOF.value);

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
    if (!data[row][13].isProtected) {
      data[row][13].isProtected = true;
    }
    // 确保对齐方式正确
    if (!data[row][13].alignment) {
      data[row][13].alignment = 'center' as TextAlign;
    }

    // 批次号列（列13）- 确保对齐方式正确
    if (data[row][14] && !data[row][14].alignment) {
      data[row][14].alignment = 'center' as TextAlign;
    }
  }

  return data;
};

// 数据变化处理
const handleDataChangeDS = (data: CellData[][]) => {
  //console.log('IF表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'DS');
  materialDataDS.value = processedData;
  // 重新计算配料成分（当新增或删除行时）
  updateSteelRows(materialDataDS.value);
  // 更新表格数据
  if (spreadsheetRefDS.value) {
    spreadsheetRefDS.value.setData(materialDataDS.value);
  }
};

const handleDataChangeIF = (data: CellData[][]) => {
  //console.log('IF表格数据变化');
  // 确保数据源配置正确
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)), 'IF');
  materialDataIF.value = processedData;
  // 重新计算配料成分（当新增或删除行时）
  updateSteelRows(materialDataIF.value);
  // addWeightedAverageRowIF();
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
  updateSteelRows(materialDataEAF.value);
  //addWeightedAverageRowEAF();
  //addSteelmakingRowEAF();
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
  updateSteelRows(materialDataAOD.value);
  //recalculateAndReorderAODRows();
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
  updateSteelRows(materialDataBOF.value);

  // 更新表格数据
  if (spreadsheetRefBOF.value) {
    spreadsheetRefBOF.value.setData(materialDataBOF.value);
  }
};

const handleHeightChangeBOF = (height: number) => {
  //console.log('BOF表格高度变化:', height);
};

// 初始化
const formName = ref('FBSM17S2N');
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
  if (spreadsheetRefDS.value) {
    spreadsheetRefDS.value.setData(materialDataDS.value);
  }
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
const F9_DO = async (e: any) => {
  try {
    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    ProcessDataParentInfo.value = {
      PARENT: 'FBSM17S2N', // 标识父画面
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

const handlestockChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    stockDialogVisible.value = false;
  }
};

//显示历史配料单
const HistoryDialogFormName = ref(''); // 弹出画面的画面名
const HistoryParentInfo = ref({});
const HistoryDialogVisible = ref(false);

//F8导入模板
const F8_DO = async (e: any) => {
  try {
    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    HistoryParentInfo.value = {
      PARENT: 'FBSM17S2N', // 标识父画面
      COMPOSE_LIST_NO: form.composeListNo, // 传递物料编码
      BACKLOG_EA: form.backlogEa,
      ST_NO: form.stNo,
      DATE_TIME: form.createDate,
      MATERIAL_CODE: form.materialCode,
      COMM_FMLY_CODE: form.commFmlyCode,
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
    templateComposeListNo.value = String(info.COMPOSE_LIST_NO ?? '');
    p_query();
  }
};

//计划与配料单匹配
const F7_DO = async (e: any) => {
  if (templateComposeListNo.value === '') {
    erFormHelper.messageWarning("配料单为空,请导入模板配料单再执行");
    return;
  }
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns('COMPOSE_LIST_NO');
  block.addRow({
    COMPOSE_LIST_NO: templateComposeListNo.value
  });
  inInfo.addBlock(erFormHelper.getGridSelectRowsAsBlock('gridviewMain'), 'Main');
  const mainGridCheckedRow = erFormHelper.getGridSelectRowsAsBlock('gridviewMain');
  if (mainGridCheckedRow.data.length < 1) {
    erFormHelper.messageWarning('请勾选钢种信息');
    return false;
  }

  const outInfo = await erFormHelper.callService('fbsm17_pp', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError(outInfo.msg);
    return false;
  }

  const dataArray = outInfo.getBlock(0).data || []; // 加||[]防止data为undefined
  if (dataArray.length > 0) {
    form.composeListNo = String(dataArray[0]["COMPOSE_LIST_NO"]);
    form.stNo = String(dataArray[0]["ST_NO"]);
    form.backlogEa = String(dataArray[0]["BACKLOG_EA"]);
    form.createDate = String(dataArray[0]["DATE_TIME"]);
    await p_query();
    await p_query_left();
    erFormHelper.setGridIndicator("gridviewMain", { COMPOSE_LIST_NO: form.composeListNo, ST_NO: form.stNo, BACKLOG_EA: form.backlogEa, DATE_TIME: form.createDate });

    setTimeout(() => {
      const currentRow = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
      if (currentRow && currentRow.data && currentRow.data.length > 0) {
        right_title.value = "配料单信息(" + currentRow.data[0]["COMPOSE_LIST_NO"] + "_" + currentRow.data[0]["ST_NO"] + "_" + currentRow.data[0]["BACKLOG_EA_DESC"] + ")";
      }
    }, 0);
  }

  erFormHelper.messageSuccess('配料单匹配成功');

};

//锁定物料启动模型
const F11_DO = async () => {
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

  // console.log('锁定时间:', form.createDate);

  // 检查IF配料单是否有选中行
  if (hasDSMaterialData.value && spreadsheetRefDS.value) {
    const selectedRows = spreadsheetRefDS.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataDS.value, selectedRows);
      if (selectedData.length > 0) {
        const blockds = inInfo.addBlock(new EI.EiBlock('DS'));
        blockds.pushData(selectedData, true);
        hasSelectedData = true;
        // console.log('DS配料单选中行数据:', selectedData);
      }
    }
  }
  // 检查IF配料单是否有选中行
  if (hasIFMaterialData.value && spreadsheetRefIF.value) {
    const selectedRows = spreadsheetRefIF.value.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      const selectedData = extractSelectedMaterialData(materialDataIF.value, selectedRows);
      if (selectedData.length > 0) {
        const blockif = inInfo.addBlock(new EI.EiBlock('IF'));
        blockif.pushData(selectedData, true);
        hasSelectedData = true;
        // console.log('IF配料单选中行数据:', selectedData);
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
        // console.log('EAF配料单选中行数据:', selectedData);
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
        // console.log('BOF配料单选中行数据:', selectedData);
      }
    }
  }

  /* if (hasSelectedData) {
     erFormHelper.messageSuccess('选中行数据导出成功');
     // 这里可以添加实际导出逻辑，比如调用后端接口等
   } else {
     erFormHelper.messageInfo('没有选中任何行，无需导出');
   }*/

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

      await p_query_left();
      await nextTick();
      erFormHelper.setGridIndicator('gridviewMain', { COMPOSE_LIST_NO: form.composeListNo });

      const currentRow = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
      if (currentRow && currentRow.data && currentRow.data.length > 0) {
        right_title.value = "配料单信息(" + currentRow.data[0]["COMPOSE_LIST_NO"] + "_" + currentRow.data[0]["ST_NO"] + "_" + currentRow.data[0]["BACKLOG_EA_DESC"] + ")";
      }
      await p_query();
      await nextTick();

      if (spreadsheetRefDS.value) spreadsheetRefDS.value.clearSelection();
      if (spreadsheetRefIF.value) spreadsheetRefIF.value.clearSelection();
      if (spreadsheetRefEAF.value) spreadsheetRefEAF.value.clearSelection();
      if (spreadsheetRefAOD.value) spreadsheetRefAOD.value.clearSelection();
      if (spreadsheetRefBOF.value) spreadsheetRefBOF.value.clearSelection();

      // 重新设定IF打勾项
      if (inInfo.contains('IF')) {
        const blockif = inInfo.getBlock('IF').data;
        if (blockif && blockif.length > 0 && spreadsheetRefIF.value) {
          const ifData = spreadsheetRefIF.value.getData();
          const rowsToSelect: number[] = [];
          for (let row = 1; row < ifData.length; row++) {
            for (let i = 0; i < blockif.length; i++) {
              const cellValue = ifData[row][13]?.value;
              if (cellValue !== undefined && ifData[row][13]?.value === blockif[i]["MAT_CODE"] && ifData[row][14]?.value === blockif[i]["LOT_NO"] && ifData[row][1]?.value === blockif[i]["STOCK_NAME"]) {
                rowsToSelect.push(row);
              }
            }
          }
          if (rowsToSelect.length > 0) {
            spreadsheetRefIF.value.setSelectedRows(rowsToSelect);
          }
        }
      }

      if (inInfo.contains('DS')) {
        const blockds = inInfo.getBlock('DS').data;
        if (blockds && blockds.length > 0 && spreadsheetRefDS.value) {
          const dsData = spreadsheetRefDS.value.getData();
          const rowsToSelect: number[] = [];
          for (let row = 1; row < dsData.length; row++) {
            for (let i = 0; i < blockds.length; i++) {
              const cellValue = dsData[row][13]?.value;
              if (cellValue !== undefined && dsData[row][13]?.value === blockds[i]["MAT_CODE"] && dsData[row][14]?.value === blockds[i]["LOT_NO"] && dsData[row][1]?.value === blockds[i]["STOCK_NAME"]) {
                rowsToSelect.push(row);
              }
            }
          }
          if (rowsToSelect.length > 0) {
            spreadsheetRefDS.value.setSelectedRows(rowsToSelect);
          }
        }
      }

      if (inInfo.contains('EAF')) {
        const blockeaf = inInfo.getBlock('EAF').data;
        if (blockeaf && blockeaf.length > 0 && spreadsheetRefEAF.value) {
          const eafData = spreadsheetRefEAF.value.getData();
          const rowsToSelect: number[] = [];
          for (let row = 1; row < eafData.length; row++) {
            for (let i = 0; i < blockeaf.length; i++) {
              const cellValue = eafData[row][13]?.value;
              if (cellValue !== undefined && eafData[row][13]?.value === blockeaf[i]["MAT_CODE"] && eafData[row][14]?.value === blockeaf[i]["LOT_NO"] && eafData[row][1]?.value === blockeaf[i]["STOCK_NAME"]) {
                rowsToSelect.push(row);
              }
            }
          }
          if (rowsToSelect.length > 0) {
            spreadsheetRefEAF.value.setSelectedRows(rowsToSelect);
          }
        }
      }
      if (inInfo.contains('BOF')) {
        const blockbof = inInfo.getBlock('BOF').data;
        if (blockbof && blockbof.length > 0 && spreadsheetRefBOF.value) {
          const bofData = spreadsheetRefBOF.value.getData();
          const rowsToSelect: number[] = [];
          for (let row = 1; row < bofData.length; row++) {
            for (let i = 0; i < blockbof.length; i++) {
              const cellValue = bofData[row][13]?.value;
              if (cellValue !== undefined && bofData[row][13]?.value === blockbof[i]["MAT_CODE"] && bofData[row][14]?.value === blockbof[i]["LOT_NO"] && bofData[row][1]?.value === blockbof[i]["STOCK_NAME"]) {
                rowsToSelect.push(row);
              }
            }
          }
          if (rowsToSelect.length > 0) {
            spreadsheetRefBOF.value.setSelectedRows(rowsToSelect);
          }
        }
      }

      if (inInfo.contains('AOD')) {
        const blockaod = inInfo.getBlock('AOD').data;
        if (blockaod && blockaod.length > 0 && spreadsheetRefAOD.value) {
          const aodData = spreadsheetRefAOD.value.getData();
          const rowsToSelect: number[] = [];
          for (let row = 1; row < aodData.length; row++) {
            for (let i = 0; i < blockaod.length; i++) {
              const cellValue = aodData[row][13]?.value;
              if (cellValue !== undefined && aodData[row][13]?.value === blockaod[i]["MAT_CODE"] && aodData[row][14]?.value === blockaod[i]["LOT_NO"] && aodData[row][1]?.value === blockaod[i]["STOCK_NAME"]) {
                rowsToSelect.push(row);
              }
            }
          }
          if (rowsToSelect.length > 0) {
            spreadsheetRefAOD.value.setSelectedRows(rowsToSelect);
          }
        }
      }
    }


    erFormHelper.messageSuccess('配料单模型执行成功');
  }

};


// F6配料单审核
const F6_DO = async (e: any) => {
  if (!form.composeListNo) {
    erFormHelper.messageWarning("配料单为空,请双击查询再执行");
    return;
  }
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
    "配料单确认审核？ 配料单号：" + form.composeListNo
  );
  if (!mes_res) {
    return;
  } else {

    const outInfo = await erFormHelper.callService('fbsm17_sh', inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    nextTick(() => {
      p_query_left();
      erFormHelper.setGridIndicator("gridviewMain", { COMPOSE_LIST_NO: form.composeListNo });
      if (isChecked.value === true) {
        isChecked.value = false;
      }
      else {
        isChecked.value = true;
      }
    });

    erFormHelper.messageSuccess('配料单审核通过');

  }

};

// 导出功能触发
const F12_DO = async (e: any) => {
  // 这里可以分别导出三个配料单的数据
  // erFormHelper.messageSuccess('配料单已导出');

  // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）
  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: form.backlogEa || ""
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
    backlogEa: form.backlogEa || ""
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
  backlogEa: string;     // 工艺路线
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
// AOD内控标准响应格式
interface AODControlStandard {
  upper: number[];       // 内控上限 [C%, Si%, Mn%, P%, S%, Cr%, Ni%, Mo%, Cu%, Co%, Al%, Nb%, V%, Ti%, B%, N%, Ca%]
  target: number[];      // 内控目标
  lower: number[];       // 内控下限
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
  // if (flag_souce.value != "1") {
  await query_souce();
  await query_material();
  // }

  const queryParams: QueryFormulaParams = {
    composeListNo: form.composeListNo || "",
    materialCode: form.materialCode || "",
    stNo: form.stNo || "",
    backlogEa: form.backlogEa || ""
  };

  // 基础校验：核心查询条件不能为空（根据业务调整）
  /* if (!queryParams.composeListNo) {
     erFormHelper.messageWarning("请先选择/输入配料单号，再执行查询");
     return;
   }*/
  // 2. 显示加载中提示（提升用户体验） 
  const inInfo = new EI.EIInfo();
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

  const dataArray = response.getBlock(0).data || []; // 加||[]防止data为undefined
  // 初始化表格数据（清空原有数据）
  materialDataIF.value = [];
  materialDataEAF.value = [];
  materialDataAOD.value = [];
  materialDataBOF.value = [];
  materialDataDS.value = [];

  // 6. 关键校验：确保dataArray是数组（兜底，防止后台返回非数组）
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    erFormHelper.messageInfo('暂无配料单明细数据');
    loadAllSpreadsheetData(); // 即使无数据也刷新计算，避免表格异常
    return;
  }

  // 7. 按STATION_ID分组过滤+数据结构映射（统一字段名，修复原代码空格问题）
  const DS_LIST = dataArray
    .filter(item => item.STATION_ID === "D")
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
  const convertedDS_LIST = convertDataToString(DS_LIST);
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
    remarkInfoAODLL.value = String(dataArray2[0]["BACK_AOD_LL"]) || '';
  }

  //控制成分赋值
  const dataArray3 = response.getBlock('CONTROL').data || []; // 加||[]防止data为undefined
  if (dataArray3.length > 0) {
    aodControlUpper.value = [Number(dataArray3[0]["WEIGHT_MAX"]), Number(dataArray3[0]["C_MAX"]), Number(dataArray3[0]["SI_MAX"]), Number(dataArray3[0]["MN_MAX"]), Number(dataArray3[0]["P_MAX"]), Number(dataArray3[0]["S_MAX"])
      , Number(dataArray3[0]["CR_MAX"]), Number(dataArray3[0]["NI_MAX"]), Number(dataArray3[0]["MO_MAX"]), Number(dataArray3[0]["CU_MAX"]), Number(dataArray3[0]["CO_MAX"])
      , Number(dataArray3[0]["AL_MAX"]), Number(dataArray3[0]["NB_MAX"]), Number(dataArray3[0]["V_MAX"]), Number(dataArray3[0]["TI_MAX"]), Number(dataArray3[0]["B_MAX"])
      , Number(dataArray3[0]["N_MAX"]), Number(dataArray3[0]["CA_MAX"])
    ];
    aodControlLower.value = [Number(dataArray3[0]["WEIGHT_MIN"]), Number(dataArray3[0]["C_MIN"]), Number(dataArray3[0]["SI_MIN"]), Number(dataArray3[0]["MN_MIN"]), Number(dataArray3[0]["P_MIN"]), Number(dataArray3[0]["S_MIN"])
      , Number(dataArray3[0]["CR_MIN"]), Number(dataArray3[0]["NI_MIN"]), Number(dataArray3[0]["MO_MIN"]), Number(dataArray3[0]["CU_MIN"]), Number(dataArray3[0]["CO_MIN"])
      , Number(dataArray3[0]["AL_MIN"]), Number(dataArray3[0]["NB_MIN"]), Number(dataArray3[0]["V_MIN"]), Number(dataArray3[0]["TI_MIN"]), Number(dataArray3[0]["B_MIN"])
      , Number(dataArray3[0]["N_MIN"]), Number(dataArray3[0]["CA_MIN"])
    ];
    aodControlTarget.value = [0, Number(dataArray3[0]["C_AIM"]), Number(dataArray3[0]["SI_AIM"]), Number(dataArray3[0]["MN_AIM"]), Number(dataArray3[0]["P_AIM"]), Number(dataArray3[0]["S_AIM"])
      , Number(dataArray3[0]["CR_AIM"]), Number(dataArray3[0]["NI_AIM"]), Number(dataArray3[0]["MO_AIM"]), Number(dataArray3[0]["CU_AIM"]), Number(dataArray3[0]["CO_AIM"])
      , Number(dataArray3[0]["AL_AIM"]), Number(dataArray3[0]["NB_AIM"]), Number(dataArray3[0]["V_AIM"]), Number(dataArray3[0]["TI_AIM"]), Number(dataArray3[0]["B_AIM"])
      , Number(dataArray3[0]["N_AIM"]), Number(dataArray3[0]["CA_AIM"])
    ];
    p_flag.value = String(dataArray3[0]["P_FLAG"]) || '';
  }

  const dataArray4 = response.getBlock('Y').data || []; // 加||[]防止data为undefined
  if (dataArray4.length > 0) {
    aodY.value = [Number(dataArray4[0]["WEIGHT"]), Number(dataArray4[0]["C_VALUE"]), Number(dataArray4[0]["SI_VALUE"]), Number(dataArray4[0]["MN_VALUE"]), Number(dataArray4[0]["P_VALUE"]), Number(dataArray4[0]["S_VALUE"])
      , Number(dataArray4[0]["CR_VALUE"]), Number(dataArray4[0]["NI_VALUE"]), Number(dataArray4[0]["MO_VALUE"]), Number(dataArray4[0]["CU_VALUE"]), Number(dataArray4[0]["CO_VALUE"])
      , Number(dataArray4[0]["AL_VALUE"]), Number(dataArray4[0]["NB_VALUE"]), Number(dataArray4[0]["V_VALUE"]), Number(dataArray4[0]["TI_VALUE"]), Number(dataArray4[0]["B_VALUE"])
      , Number(dataArray4[0]["N_VALUE"]), Number(dataArray4[0]["CA_VALUE"])
    ];
  }

  // 8. 各炉型数据处理：清空→统一方法处理（自动创建表头、添加数据行、计算配料成分和出钢成分、添加备注行）
  materialDataDS.value = [];
  addMaterialDataFromSource(materialDataDS, convertedDS_LIST, 'DS', remarkInfoDS.value, true, false);
  // IF炉（Z）
  materialDataIF.value = [];
  addMaterialDataFromSource(materialDataIF, convertedIF_LIST, 'IF', remarkInfoIF.value, true, false);

  // EAF炉（E）
  materialDataEAF.value = [];
  addMaterialDataFromSource(materialDataEAF, convertedEAF_LIST, 'EAF', remarkInfoEAF.value, true, false);

  // BOF炉（B）
  materialDataBOF.value = [];
  addMaterialDataFromSource(materialDataBOF, convertedBOF_LIST, 'BOF', remarkInfoBOF.value, true, false);

  // AOD炉（A）
  materialDataAOD.value = [];
  addMaterialDataFromSource(materialDataAOD, convertedAOD_LIST, 'AOD', remarkInfoAOD.value, true, false);

  updateSteelRows(materialDataAOD.value);


  //console.log('AOD信息：', materialDataAOD);
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
    backlogEa: form.backlogEa || ""
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

  materialDataSourceIF.value = dataArray.map((item: any) => ({
    name: item.MAT_NAME || '',
    code: item.MAT_CODE || '',
    storageArea: item.STOCK_NAME || '',
    batchNumber: item.LOT_NO || '',
    weight: item.WEIGHT || 0,
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

  materialDataSourceBOF.value = dataArray
    .map((item: any) => ({
      name: item.MAT_NAME || '',
      code: item.MAT_CODE || '',
      storageArea: item.STOCK_NAME || '',
      batchNumber: item.LOT_NO || '',
      weight: item.WEIGHT || 0,
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

  materialDataSourceAOD.value = dataArray.map((item: any) => ({
    name: item.MAT_NAME || '',
    code: item.MAT_CODE || '',
    storageArea: item.STOCK_NAME || '',
    batchNumber: item.LOT_NO || '',
    weight: item.WEIGHT || 0,
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

  materialDataSourceEAF.value = dataArray.map((item: any) => ({
    name: item.MAT_NAME || '',
    code: item.MAT_CODE || '',
    storageArea: item.STOCK_NAME || '',
    batchNumber: item.LOT_NO || '',
    weight: item.WEIGHT || 0,
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

// 组件挂载时初始化
onMounted(() => {
  setTimeout(() => {
    p_query_left();
    //query_souce();
    if (!efFormIsReady.value) {
      showContent.value = true;
      setTimeout(() => {
        //p_query();
      }, 500);
    }
  }, 1000);
});

</script>

<style lang="scss" scoped>
// 右侧配料单面板：强制 flex 布局使 content 占满，避免双滚动条
:deep(.right-panel) {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;


  .panel-body {
    flex: 1 !important;
    overflow-y: hidden !important;
    min-height: 0 !important;
  }

  .xr-ef-panel-content {
    flex: 1 !important;
    overflow-y: auto !important;
    min-height: 0 !important;
  }
}

// 进度条遮罩层
.progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-box {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 24px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.progress-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 16px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-text {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}
</style>
