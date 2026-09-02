<template>
  <xr-ef-form
    @ready="efFormReady"
    :f2-do="F2_DO"
    :f3-do="F3_DO"
    :f4-do="F4_DO"
    :f5-do="F5_DO"
    :f6-do="F6_DO"
    :f7-do="F7_DO"
    :f8-do="F8_DO"
    :f9-do="F9_DO"
    :f10-do="F10_DO"
    :f11-do="F11_DO"
    :f12-do="F12_DO"
  >
    <template v-if="initializeFlag === 1">
      <div style="display: flex; flex-direction: column; height: 100%">
        <div style="display: flex; width: 100%">
          <er-layout
            :er-form-helper-prop="erFormHelper"
            :config-id="'FBSM32S2N_QUERY'"
            style="flex: 0 0 70%"
          ></er-layout>
          <er-layout
            :er-form-helper-prop="erFormHelper"
            :config-id="'FBSM32S2N_PROD1'"
            style="flex: 0 0 30%"
          ></er-layout>
        </div>
        <v-splitter style="flex: 1; min-height: 0" class="default-theme">
          <v-splitter-pane size="50%">
            <xr-ef-panel title="计划信息" padding="5px" style="height: 100%">
              <template #contentSlot>
                <div style="display: flex; flex-direction: column; height: 100%">
                  <er-grid
                    style="flex: 1; min-height: 0"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM32S2N_INQ1'"
                    @double-click="FBSM32S2N_INQ1DoubleClick"
                    @erGridReady="erGrid1Ready"
                  >
                  </er-grid>
                </div>
              </template>
            </xr-ef-panel>
          </v-splitter-pane>
          <v-splitter-pane size="50%">
            <div style="display: flex; flex-direction: column; height: 100%">
              <xr-ef-panel :title="rightPanelTitle" padding="5px" style="flex: 1; min-height: 0">
                <template #contentSlot>
                  <!-- 嵌入 FBSM31ZS2N 内容，替代原来的 FBSM32S2N_INQ2 grid -->
                  <FBSM31ZS2N_Embed
                    ref="embedRef"
                    :show-toolbar="true"
                    :material-data-b-o-f="materialDataBOF"
                    :column-widths-b-o-f="columnWidthsBOF"
                    :protected-rows-b-o-f="protectedRowsBOF"
                    :protected-columns-b-o-f="protectedColumnsBOF"
                    :active-spreadsheet="activeSpreadsheet"
                    @toolbar-refresh="onToolbarRefresh"
                    @toolbar-show-process-data="onToolbarShowProcessData"
                    @toolbar-show-stock="onToolbarShowStock"
                    @toolbar-show-history="onToolbarShowHistory"
                    @toolbar-save-to-template="onToolbarSaveToTemplate"
                    @toolbar-save-formula="onToolbarSaveFormula"
                    @toolbar-check-formula="onToolbarCheckFormula"
                    @toolbar-nocheck-formula="onToolbarNocheckFormula"
                    @toolbar-export-formula="onToolbarExportFormula"
                    @cell-update="handleCellUpdateBOF"
                    @data-change="handleDataChangeBOF"
                    @height-change="handleHeightChangeBOF"
                    @activated="activateSpreadsheet"
                    @deactivated="deactivateAllSpreadsheets"
                  />
                </template>
              </xr-ef-panel>
            </div>
          </v-splitter-pane>
        </v-splitter>
      </div>
    </template>
  </xr-ef-form>

  <!-- ==================== 弹窗区域（从 FBSM31ZS2N 搬过来的） ==================== -->
  <!-- 库存按钮对应的FBSM13S2N弹窗 -->
  <xr-ef-dialog
    ref="stockDialogRef"
    title="原料总库存查询"
    v-model:visible="stockDialogVisible"
    width="80%"
    height="95%"
  >
    <FBSM13S2N
      :openInDialog="true"
      :parentInfo="stockParentInfo"
      @getChildInfo="handlestockChildInfo"
      :dialogFormName="stockDialogFormName"
    >
    </FBSM13S2N>
  </xr-ef-dialog>
  <!-- 过程数据对应的FBSM31GS2N弹窗 -->
  <xr-ef-dialog
    ref="ProcessDataDialogRef"
    title="过程成分查看"
    v-model:visible="ProcessDataDialogVisible"
    width="80%"
    height="95%"
  >
    <FBSM31GS2N
      :openInDialog="true"
      :parentInfo="ProcessDataParentInfo"
      @getChildInfo="handleProcessDataChildInfo"
      :dialogFormName="ProcessDataDialogFormName"
    >
    </FBSM31GS2N>
  </xr-ef-dialog>
  <!-- 模板配料单对应的FBSM15MS2N弹窗 -->
  <xr-ef-dialog
    ref="HistoryDialogRef"
    title="模板配料单"
    v-model:visible="HistoryDialogVisible"
    width="80%"
    height="95%"
  >
    <FBSM15MS2N
      :openInDialog="true"
      :parentInfo="HistoryParentInfo"
      @getChildInfo="handleHistoryChildInfo"
      :dialogFormName="HistoryDialogFormName"
    >
    </FBSM15MS2N>
  </xr-ef-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  computed,
  nextTick,
  toRaw,
  Ref,
} from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfDialog from "EFX/xrEfDialog";
import EFUtility from "EFX/EFUtility";
import eBFR from "EBFR/eBFR";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import { ER } from "ERX/Er";
import { EI } from "EIX/ei";
import { SiUtils } from "ERX/SiUtils";
import { FiUtils } from "ERX/FiUtils";
import { PopFreeReturnInfo, PopQueryReturnInfo } from "ERX/er-type";
import ErPopFree from "ERX/ErPopFree";
import ErPopQuery from "ERX/ErPopQuery";
import FBSM31ZS2N_Embed from "./FBSM31ZS2N_Embed.vue";

// 从 FBSM31ZS2N 搬过来的弹窗画面
import FBSM13S2N from "../FBSM13S2N/FBSM13S2N.vue";
import FBSM31GS2N from "../FBSM31GS2N/FBSM31GS2N.vue";
import FBSM15MS2N from "../FBSM15MS2N/FBSM15MS2N.vue";

// Spreadsheet 组件和类型
import Spreadsheet from "./Spreadsheet.vue";
import type { CellData, DataSourceItem, TextAlign } from "../FBSM32S2N/Spreadsheet.vue";

export default {
  name: "FBSM32S2N",
};
</script>

<script lang="ts" setup>
// ====================  FBSM32S2N 原有基础状态  ====================
const formPartition = ref("");
const efFormInfo = ref<{ [key: string]: any }>({});
const efFormIsReady = ref(false);

const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  initializePage();
};

const erGrid1Ready = () => {
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  erFormHelper.setGridEditable(config_inq1.value, false);
  erFormHelper.setGridEditable(config_inq2.value, false);
  erFormHelper.setGridToolbarVisible(config_inq1.value, {
    addrow: false,
    copyrow: false,
    excel: false,
  });
  erFormHelper.setGridToolbarVisible(config_inq2.value, {
    addrow: false,
    copyrow: false,
    excel: false,
  });
  initializePage();
};

const formName = "FBSM32S2N";
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";
const config_query = ref("FBSM32S2N_QUERY");
const config_inq1 = ref("FBSM32S2N_INQ1");
const config_inq2 = ref("FBSM32S2N_INQ2");

// 右侧配料单 panel 标题
const rightPanelTitle = ref("配料单信息");

// 嵌入组件 ref
const embedRef = ref<InstanceType<typeof FBSM31ZS2N_Embed> | null>(null);

// 当前左侧焦点行原始数据
const selectedRowData = ref<Record<string, any>>({});

// 右侧配料单数据修改标记
const dataModified = ref(false);

// 导入模板后未保存标记：导入模板后必须先保存，才能进行审核、取消审核、匹配对应、存为模板、导出等操作
const templateImportedNotSaved = ref(false);

// 画面相关数据初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(
    formPartition.value,
    formName,
    "",
    initializeService
  );
  if (initialResult.flag >= 0) {
    initializeFlag.value = 1;
  } else {
    erFormHelper.messageError(
      "ErFormHelper initialize faild, error msg is [" + initialResult.msg + "]!"
    );
  }
};

// 左侧主查询
const p_query = async () => {
  console.log("进入查数据函数");
  // 1. 保存当前焦点行的定位键（ST_NO / DATE_C）
  let locateKeys: { ST_NO?: string; DATE_C?: string } = {};
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  console.log("查询前当前行:", currentRow);
  if (currentRow) {
    const getVal = (key: string) => {
      if (currentRow && typeof currentRow.get === "function") {
        return currentRow.get(key);
      }
      return currentRow[key];
    };
    locateKeys = {
      ST_NO: getVal("ST_NO") || "",
      DATE_C: getVal("DATE_C") || "",
    };
    console.log("保存的定位键:", locateKeys);
  } else {
    console.log("查询前未获取到当前行");
  }

  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock(config_query.value));
  const outInfo = await erFormHelper.callService("fbsm31_inq", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    console.log(outInfo, "查数据outInfo");
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, config_inq1.value);

    // 2. 查询完成后尝试按 ST_NO + DATE_C 恢复焦点行
    if (locateKeys.ST_NO && locateKeys.DATE_C) {
      nextTick(() => {
        try {
          erFormHelper.setGridIndicator(config_inq1.value, {
            ST_NO: locateKeys.ST_NO,
            DATE_C: locateKeys.DATE_C,
          });
          console.log("焦点行恢复成功:", locateKeys);
        } catch (e: any) {
          console.log("焦点行恢复失败:", e?.message || e);
        }
      });
    } else {
      console.log("定位键不完整，跳过焦点恢复:", locateKeys);
    }
  }

  // 重新查询左侧后，重置导入模板未保存标记
  templateImportedNotSaved.value = false;
};

// ====================  从 FBSM31ZS2N 搬过来的 Spreadsheet 状态与方法  ====================
const activeSpreadsheet = ref<"IF" | "EAF" | "AOD" | "BOF" | null>(null);
const specialRowLabels = ["配料重量", "备注"];

const columnWidthsBOF = ref<number[]>([
  200, // 0: 物料名称
  0, // 1: 库区
  60, // 2: 重量(t)
  100, // 3: 物料代码
  0, // 4: 物料属性（隐藏）
]);

const materialDataBOF = ref<CellData[][]>([]);
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([
  {
    seq_id: "MAT301",
    name: "废钢",
    code: "MAT301",
    category: "废钢",
    storageArea: "废钢区",
    back_c2: " ",
  },
  {
    seq_id: "MAT302",
    name: "铁水",
    code: "MAT302",
    category: "铁水",
    storageArea: "铁水区",
    back_c2: " ",
  },
]);
const remarkInfoBOF = ref(" ");

// 创建BOF专用表头
const createHeaderRowBOF = (): CellData[] => {
  return [
    {
      value: "物料名称",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    {
      value: "库区",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    {
      value: "重量(t)",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    {
      value: "物料代码",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    {
      value: "物料属性",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
      style: { display: "none" },
    },
  ];
};

const createMaterialNameCell = (value: string = ""): CellData => {
  return {
    value,
    format: "text",
    alignment: "left" as TextAlign,
    dataSource: {
      data: materialDataSourceBOF.value,
      displayField: "name",
      valueField: "name",
      searchable: true,
      columns: ["name", "code", "back_c2"],
      title: "选择物料",
    },
  };
};

const protectedRowsBOF = computed(() => {
  const protectedRows: number[] = [0]; // 表头行
  for (let i = 0; i < materialDataBOF.value.length; i++) {
    const rowLabel = materialDataBOF.value[i][0]?.value;
    if (rowLabel === "配料重量") {
      protectedRows.push(i);
    }
  }
  return protectedRows;
});

const protectedColumnsBOF = computed(() => []);

const addMaterialDataFromSource = (
  target: Ref<CellData[][]>,
  data: Array<{
    Mat_name: string;
    StorageArea: string;
    Weight: string;
    Mat_code: string;
    back_c2: string;
    COOL_COEF?: string | number;
  }>,
  clearExisting: boolean = true
) => {
  console.log(`开始添加物料数据到BOF配料单，数据行数：${data.length}`);

  const headerRow = createHeaderRowBOF();

  if (!target.value || target.value.length === 0) {
    target.value = [headerRow];
  }

  const currentData = [...target.value];
  let existingHeaderRow: CellData[];
  const firstRowFirstCellValue = currentData[0]?.[0]?.value;
  const isHeaderRow =
    typeof firstRowFirstCellValue === "string" && firstRowFirstCellValue === "物料名称";

  if (isHeaderRow) {
    existingHeaderRow = currentData[0];
  } else {
    existingHeaderRow = headerRow;
  }

  const specialRows: CellData[][] = [];
  for (let i = 0; i < currentData.length; i++) {
    if (i === 0 && isHeaderRow) continue;
    const firstCellValue = currentData[i][0]?.value;
    if (typeof firstCellValue === "string" && specialRowLabels.includes(firstCellValue)) {
      specialRows.push(currentData[i]);
    }
  }

  const newDataRows: CellData[][] = [];
  newDataRows.push(existingHeaderRow);

  if (!clearExisting) {
    const startIndex = isHeaderRow ? 1 : 0;
    for (let i = startIndex; i < currentData.length; i++) {
      const firstCellValue = currentData[i][0]?.value;
      if (
        typeof firstCellValue === "string" &&
        specialRowLabels.includes(firstCellValue)
      ) {
        continue;
      }
      newDataRows.push(currentData[i]);
    }
  }

  data.forEach((item) => {
    const coolCoef = parseFloat(String(item.COOL_COEF ?? '1')) || 1;
    const row: CellData[] = [
      {
        value: item.Mat_name,
        format: "text",
        alignment: "center",
        coolCoef,
        dataSource: {
          data: materialDataSourceBOF.value,
          displayField: "name",
          valueField: "name",
          searchable: true,
          columns: ["name", "code", "back_c2"],
          title: "选择物料",
        },
      },
      { value: item.StorageArea, format: "text", alignment: "center" },
      { value: String(item.Weight), format: "number:1", alignment: "right" },
      { value: item.Mat_code, format: "text", alignment: "center", isProtected: true },
      {
        value: item.back_c2 || "",
        format: "text",
        alignment: "center",
        style: { display: "none" },
      },
    ];
    newDataRows.push(row);
  });

  specialRows.forEach((row) => {
    newDataRows.push(row);
  });

  target.value = newDataRows;
  console.log(`BOF配料单数据更新完成，总行数：${newDataRows.length}`);
};

const addFormulaWeightRowBOF = () => {
  const existingIndex = materialDataBOF.value.findIndex(
    (row) => row[0]?.value === "配料重量"
  );
  if (existingIndex !== -1) {
    materialDataBOF.value.splice(existingIndex, 1);
  }

  let totalWeight = 0;
  for (let row = 1; row < materialDataBOF.value.length; row++) {
    const firstCellValue = materialDataBOF.value[row][0]?.value;
    if (
      typeof firstCellValue === "string" &&
      ["配料重量", "备注"].includes(firstCellValue)
    ) {
      continue;
    }
    const weight = parseFloat(materialDataBOF.value[row][2]?.value) || 0;
    totalWeight += weight;
  }

  const formulaWeightRow: CellData[] = [
    {
      value: "配料重量",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    { value: "", format: "text", alignment: "center", isProtected: true },
    {
      value: totalWeight.toFixed(3),
      format: "number:1",
      fontWeight: "bold",
      alignment: "right",
      isProtected: true,
    },
    { value: "", format: "text", alignment: "center", isProtected: true },
    {
      value: "",
      format: "text",
      alignment: "center",
      isProtected: true,
      style: { display: "none" },
    },
  ];

  const remarkIndex = materialDataBOF.value.findIndex((row) => row[0]?.value === "备注");
  if (remarkIndex !== -1) {
    materialDataBOF.value.splice(remarkIndex, 0, formulaWeightRow);
  } else {
    materialDataBOF.value.push(formulaWeightRow);
  }
};

const ensureDataSourceConfig = (data: CellData[][]) => {
  if (!data || data.length === 0) return data;
  for (let row = 1; row < data.length; row++) {
    if (!data[row]) {
      data[row] = [];
    }
    const firstCellValue = data[row][0]?.value;
    const isSpecialRow =
      typeof firstCellValue === "string" && specialRowLabels.includes(firstCellValue);
    if (isSpecialRow) {
      continue;
    }
    while (data[row].length < 5) {
      data[row].push({ value: "", format: "text", alignment: "center" as TextAlign });
    }
    if (!data[row][0].dataSource) {
      const existingValue = data[row][0]?.value || "";
      const existingCoolCoef = data[row][0]?.coolCoef;
      data[row][0] = {
        value: existingValue,
        format: "text",
        alignment: "center" as TextAlign,
        coolCoef: existingCoolCoef,
        dataSource: {
          data: materialDataSourceBOF.value,
          displayField: "name",
          valueField: "name",
          searchable: true,
          columns: ["name", "code", "back_c2"],
          title: "选择物料",
        },
      };
    } else {
      const cell = data[row][0];
      if (cell?.dataSource) {
        cell.dataSource.data = materialDataSourceBOF?.value || '';
      }
    }
    if (data[row][2]) {
      data[row][2].alignment = "right" as TextAlign;
      if (!data[row][2].format) {
        data[row][2].format = "number:1";
      }
    }
    if (!data[row][3].isProtected) {
      data[row][3].isProtected = true;
    }
    if (!data[row][3].alignment) {
      data[row][3].alignment = "center" as TextAlign;
    }
  }
  return data;
};

const handleCellUpdateBOF = (row: number, col: number, value: any) => {
  dataModified.value = true;
  if (
    row >= 0 &&
    row < materialDataBOF.value.length &&
    col >= 0 &&
    col < materialDataBOF.value[row].length
  ) {
    materialDataBOF.value[row][col].value = value;
    let needRecalculate = false;

    if (col === 0 && row > 0) {
      const material = materialDataSourceBOF.value.find((item) => item.name === value);
      if (material) {
        if (material.back_c2) materialDataBOF.value[row][1].value = material.back_c2;
        materialDataBOF.value[row][3].value = material.code || "";
        // 手动选择物料时默认冷却系数为 1（数据源中若存在则使用实际值）
        materialDataBOF.value[row][0].coolCoef = parseFloat(String((material as any).COOL_COEF ?? '1')) || 1;
        needRecalculate = true;
      }
    }

    if (col === 2) {
      needRecalculate = true;
    }

    if (needRecalculate) {
      addFormulaWeightRowBOF();
    }

    embedRef.value?.setBOFData(materialDataBOF.value);
  }
};

const handleDataChangeBOF = (data: CellData[][]) => {
  dataModified.value = true;
  const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)));
  materialDataBOF.value = processedData;
  addFormulaWeightRowBOF();
  embedRef.value?.setBOFData(materialDataBOF.value);
};

const handleHeightChangeBOF = (height: number) => {};

const activateSpreadsheet = (type: "IF" | "EAF" | "AOD" | "BOF") => {
  activeSpreadsheet.value = type;
  if (type !== "BOF") {
    embedRef.value?.forceStopBOFEditing();
  }
};

const deactivateAllSpreadsheets = () => {
  activeSpreadsheet.value = null;
  embedRef.value?.forceStopBOFEditing();
};

const loadBOFDataToEmbed = () => {
  embedRef.value?.setBOFData(materialDataBOF.value);
};

// ====================  嵌入组件的配料单查询（左侧焦点行切换时调用） ====================
interface QueryFormulaParams {
  composeListNo: string;
  materialCode: string;
  stNo: string;
  backlogEa: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const convertDataToString = (list: any[]) => {
  return list.map((item) => ({
    ...item,
    Mat_name: String(item.Mat_name || ""),
    StorageArea: String(item.StorageArea || ""),
    Weight: String(item.Weight || ""),
    Mat_code: String(item.Mat_code || ""),
    back_c2: String(item.back_c2 || ""),
  }));
};

// 根据左侧焦点行，查询右侧配料单数据
const loadEmbedData = async (rowData: Record<string, any>) => {
  const composeListNo = rowData.COMPOSE_LIST_NO || "";
  const materialCode = rowData.MATERIAL_CODE || "";
  const stNo = rowData.ST_NO || "";
  const backlogEa = Number(rowData.BACKLOG_EA) || 0;

  if (!composeListNo) {
    materialDataBOF.value = [createHeaderRowBOF()];
    loadBOFDataToEmbed();
    return;
  }

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns("COMPOSE_LIST_NO", "ST_NO", "BACKLOG_EA", "MATERIAL_CODE");
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
    MATERIAL_CODE: materialCode,
  });

  const response = await erFormHelper.callService("fbsm31z_inq", inInfo);
  const dataArray = response.getBlock(0).data || [];

  // 无数据时只保留表头
  materialDataBOF.value = [createHeaderRowBOF()];

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    erFormHelper.messageInfo("暂无配料单明细数据");
    loadBOFDataToEmbed();
    return;
  }

  const BOF_LIST = dataArray
    .filter((item) => item.STATION_ID === "B")
    .map((item) => ({
      Mat_name: item.MAT_NAME || "",
      StorageArea: item.STOCK_NAME || "",
      Weight: item.WEIGHT || "",
      Mat_code: item.MAT_CODE || "",
      back_c2: item.BACK_C2 || "",
      COOL_COEF: item.COOL_COEF,
    }));

  const convertedBOF_LIST = convertDataToString(BOF_LIST);

  const dataArray2 = response.getBlock("REMARK").data || [];
  if (dataArray2.length > 0) {
    remarkInfoBOF.value = String(dataArray2[0]["BACK_BOF"]) || "";
  }

  materialDataBOF.value = [];
  addMaterialDataFromSource(materialDataBOF, convertedBOF_LIST, true);

  const hasFormulaWeightRow = materialDataBOF.value.some(
    (row) => row[0]?.value === "配料重量"
  );

  if (!hasFormulaWeightRow) {
    addFormulaWeightRowBOF();
  }

  const remarkRow: CellData[] = [
    {
      value: "备注",
      format: "text",
      fontWeight: "bold",
      alignment: "center",
      isProtected: true,
    },
    { value: remarkInfoBOF.value, format: "text", alignment: "left", colspan: 4 },
  ];
  materialDataBOF.value.push(remarkRow);

  await nextTick();
  loadBOFDataToEmbed();

  // 顺便查物料数据源
  await queryMaterialSource(stNo, backlogEa);

  // 物料数据源更新后，重新配置表格单元格的 dataSource 并刷新嵌入组件
  ensureDataSourceConfig(materialDataBOF.value);
  loadBOFDataToEmbed();

  // 重新加载数据后重置修改标记
  dataModified.value = false;
};

// 物料数据源查询
const queryMaterialSource = async (stNo: string, backlogEa: number) => {
  if (!stNo) return;
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns("COMPOSE_LIST_NO", "ST_NO", "BACKLOG_EA");
  block.addRow({
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
  });

  const response = await erFormHelper.callService("fbsm31z_material_inq", inInfo);
  const bofData = response.getBlock(0).data || [];

  if (!Array.isArray(bofData) || bofData.length === 0) {
    return;
  }

  materialDataSourceBOF.value = bofData.map((item) => ({
    seq_id: item.SEQ_ID || "",
    name: item.MAT_NAME || "",
    code: item.MAT_CODE || "",
    back_c2: item.BACK_C2 || "",
  }));
};

// ====================  按钮事件处理（后续写逻辑在这里写） ====================

// 刷新数据
const onToolbarRefresh = () => {
  loadEmbedData(selectedRowData.value);
};

// 过程数据
const onToolbarShowProcessData = async () => {
  try {
    ProcessDataParentInfo.value = {
      PARENT: "FBSM32S2N",
      COMPOSE_LIST_NO: selectedRowData.value.COMPOSE_LIST_NO || "",
      BACKLOG_EA: selectedRowData.value.BACKLOG_EA || "",
      ST_NO: selectedRowData.value.ST_NO || "",
      DATE_TIME: selectedRowData.value.DATE_TIME || "",
    };
    ProcessDataDialogFormName.value = "FBSM31GS2N";
    ProcessDataDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError(
      "打开模型过程数据(FBSM31GS2N)画面失败：" + (error as Error).message
    );
  }
};

// 库存查询
const onToolbarShowStock = async () => {
  try {
    stockParentInfo.value = {
      PARENT: "FBSM32S2N",
      COMPOSE_LIST_NO: selectedRowData.value.COMPOSE_LIST_NO || "",
      BACKLOG_EA: selectedRowData.value.BACKLOG_EA || "",
    };
    stockDialogFormName.value = "FBSM13S2N";
    stockDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError(
      "打开原料总库存查询(FBSM13S2N)画面失败：" + (error as Error).message
    );
  }
};

// 导入模板
const onToolbarShowHistory = async () => {
  try {
    HistoryParentInfo.value = {
      PARENT: "FBSM32S2N",
      COMPOSE_LIST_NO: selectedRowData.value.COMPOSE_LIST_NO || "",
      BACKLOG_EA: selectedRowData.value.BACKLOG_EA || "",
      ST_NO: selectedRowData.value.ST_NO || "",
      DATE_TIME: selectedRowData.value.DATE_TIME || "",
    };
    HistoryDialogFormName.value = "FBSM15MS2N";
    HistoryDialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError(
      "打开模板配料单(FBSM15MS2N)画面失败：" + (error as Error).message
    );
  }
};

// 存为模板
const onToolbarSaveToTemplate = async () => {
  // 校验导入模板后是否已保存
  if (templateImportedNotSaved.value) {
    erFormHelper.messageWarning("请先保存当前导入的模板配料单，再执行存为模板");
    return;
  }

  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns("COMPOSE_LIST_NO", "ST_NO");
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
  });
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认设定为模板？ 配料单号：" + composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService("fbsm31_mb_upd", inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    erFormHelper.messageSuccess("保存到模板库");
  }
};

// 保存修改
const onToolbarSaveFormula = async () => {
  const extractMaterialData = (materialData: CellData[][]) => {
    const result: Array<{
      MAT_NAME: string;
      STOCK_NAME: string;
      WEIGHT: string;
      MAT_CODE: string;
      BACK_C2: string;
    }> = [];
    if (!materialData || materialData.length <= 1) return result;
    for (let row = 1; row < materialData.length; row++) {
      // 这些也正常保存，跳过特殊行的逻辑注释掉
      // const firstCellValue = materialData[row][0]?.value;
      // if (typeof firstCellValue === 'string' && ['配料重量', '备注'].includes(firstCellValue)) {
      //     continue;
      // }
      const getCellValue = (col: number): string => {
        if (
          materialData[row] &&
          materialData[row][col] &&
          materialData[row][col].value !== undefined &&
          materialData[row][col].value !== null
        ) {
          return String(materialData[row][col].value);
        }
        return "";
      };
      const rowData = {
        MAT_NAME: getCellValue(0),
        STOCK_NAME: getCellValue(1),
        WEIGHT: getCellValue(2),
        MAT_CODE: getCellValue(3),
        BACK_C2: getCellValue(4),
      };
      result.push(rowData);
    }
    return result;
  };

  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";
  const backlogEa = selectedRowData.value.BACKLOG_EA || "";
  const materialCode = selectedRowData.value.MATERIAL_CODE || "";
  const dateC = selectedRowData.value.DATE_C || "";

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("query"));
  block.addColumns(
    "COMPOSE_LIST_NO",
    "ST_NO",
    "BACKLOG_EA",
    "MATERIAL_CODE",
    "DATE_C"
  );
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
    MATERIAL_CODE: materialCode,
    DATE_C: dateC,
  });

  const hasData =
    materialDataBOF.value.length > 1 &&
    materialDataBOF.value.some((row, idx) => {
      if (idx === 0) return false;
      const val = row[0]?.value;
      return val && !specialRowLabels.includes(String(val));
    });

  if (hasData) {
    const bofData = extractMaterialData(materialDataBOF.value);
    const blockBof = inInfo.addBlock(new EI.EiBlock("BOF"));
    blockBof.pushData(bofData, true);
  }

  const mes_res = await erFormHelper.messageConfirm(
    "配料单是否确认保存？ 配料单号：" + composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService("fbsm31z_save", inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    }
    const dataArray = outInfo.getBlock(0).data || [];
    if (dataArray.length > 0) {
      // 保存成功后，后台可能生成新的配料单号，用 ST_NO + DATE_C + COMPOSE_LIST_NO 定位焦点行
      const newComposeListNo = String(
        dataArray[0]["COMPOSE_LIST_NO"] || selectedRowData.value.COMPOSE_LIST_NO || ""
      );
      await restoreFocusAndRefresh({
        ST_NO: selectedRowData.value.ST_NO,
        DATE_C: selectedRowData.value.DATE_C,
        COMPOSE_LIST_NO: newComposeListNo,
      });
    }
    // 保存成功后，重置导入模板未保存标记
    templateImportedNotSaved.value = false;
    erFormHelper.messageSuccess("配料单保存成功");
  }
};

// 审核
const onToolbarCheckFormula = async () => {
  // 校验导入模板后是否已保存
  if (templateImportedNotSaved.value) {
    erFormHelper.messageWarning("请先保存当前导入的模板配料单，再执行审核");
    return;
  }

  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";
  const backlogEa = selectedRowData.value.BACKLOG_EA || "";
  const materialCode = selectedRowData.value.MATERIAL_CODE || "";
  const dateC = selectedRowData.value.DATE_C || "";

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns(
    "COMPOSE_LIST_NO",
    "ST_NO",
    "BACKLOG_EA",
    "MATERIAL_CODE",
    "DATE_C"
  );
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
    MATERIAL_CODE: materialCode,
    DATE_C: dateC,
  });
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认审核？ 配料单号：" + composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService("fbsm31_sh_upd", inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    } else {
      // 成功后刷新：根据 ST_NO + DATE_C + COMPOSE_LIST_NO 恢复左侧焦点行并同步右侧
      await restoreFocusAndRefresh({
        ST_NO: selectedRowData.value.ST_NO,
        DATE_C: selectedRowData.value.DATE_C,
        COMPOSE_LIST_NO: selectedRowData.value.COMPOSE_LIST_NO,
      });
    }
    erFormHelper.messageSuccess("配料单审核通过");
  }
};

// 取消审核
const onToolbarNocheckFormula = async () => {
  // 校验导入模板后是否已保存
  if (templateImportedNotSaved.value) {
    erFormHelper.messageWarning("请先保存当前导入的模板配料单，再执行取消审核");
    return;
  }

  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";
  const backlogEa = selectedRowData.value.BACKLOG_EA || "";
  const materialCode = selectedRowData.value.MATERIAL_CODE || "";
  const dateC = selectedRowData.value.DATE_C || "";

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("LD"));
  block.addColumns(
    "COMPOSE_LIST_NO",
    "ST_NO",
    "BACKLOG_EA",
    "MATERIAL_CODE",
    "DATE_C"
  );
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
    MATERIAL_CODE: materialCode,
    DATE_C: dateC,
  });
  const mes_res = await erFormHelper.messageConfirm(
    "配料单确认取消审核？ 配料单号：" + composeListNo
  );
  if (!mes_res) {
    return;
  } else {
    const outInfo = await erFormHelper.callService("fbsm31_sh_del", inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError(outInfo.msg);
      return false;
    } else {
      // 成功后刷新：根据 ST_NO + DATE_C + COMPOSE_LIST_NO 恢复左侧焦点行并同步右侧
      await restoreFocusAndRefresh({
        ST_NO: selectedRowData.value.ST_NO,
        DATE_C: selectedRowData.value.DATE_C,
        COMPOSE_LIST_NO: selectedRowData.value.COMPOSE_LIST_NO,
      });
    }
    erFormHelper.messageSuccess("配料单取消审核");
  }
};

// 导出
const onToolbarExportFormula = async () => {
  // 校验导入模板后是否已保存
  if (templateImportedNotSaved.value) {
    erFormHelper.messageWarning("请先保存当前导入的模板配料单，再执行导出");
    return;
  }

  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";

  if (!composeListNo || !stNo) {
    erFormHelper.messageError("未获取到必要的导出参数（配料单号或出钢记号）!");
    return;
  }
  const reportParam = `@COMPOSE_LIST_NO@$$${composeListNo};;@ST_NO@$$${stNo}`;
  try {
    const exportDataWithName = {
      REPORT_ID: "",
      REPORT_ENAME: "FBSM31ZS2N",
      REPORT_CNAME: "",
      REPORT_TYPE: "",
      REPORT_STATUS: "",
      REPORT_PARAM: reportParam,
      RETURN_FILE_TYPE: "xlsx",
      FILE_NAME: `配料单_${composeListNo}_${stNo}`,
    };
    const fileUrl = await eBFR.ExportReportSpecifyNameFile(
      exportDataWithName,
      formPartition.value
    );
    window.open(fileUrl);
    erFormHelper.messageSuccess("报表导出请求已发送，文件正在生成！");
  } catch (error) {
    console.error("导出报表时发生错误:", error);
    erFormHelper.messageError("报表导出失败，请检查参数或模板配置！");
  }
};

// ====================  弹窗相关状态  ====================
const ProcessDataDialogFormName = ref("");
const ProcessDataParentInfo = ref({});
const ProcessDataDialogVisible = ref(false);
const handleProcessDataChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    ProcessDataDialogVisible.value = false;
  }
};

const stockDialogFormName = ref("");
const stockParentInfo = ref({});
const stockDialogVisible = ref(false);
const handlestockChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    stockDialogVisible.value = false;
  }
};

const HistoryDialogFormName = ref("");
const HistoryParentInfo = ref({});
const HistoryDialogVisible = ref(false);
const handleHistoryChildInfo = async (info: any) => {
  if (info.closeEfDialog === true) {
    HistoryDialogVisible.value = false;

    // 没有选中模板行，直接返回
    if (!info.COMPOSE_LIST_NO) {
      return;
    }

    // 保存左侧计划行原来的配料单号和日期
    const originalComposeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
    const originalDateTime = selectedRowData.value.DATE_TIME || "";
    const originalDateC = selectedRowData.value.DATE_C || "";

    // 临时切换为模板配料单号，查询右侧明细
    selectedRowData.value = {
      ...selectedRowData.value,
      COMPOSE_LIST_NO: info.COMPOSE_LIST_NO,
      DATE_TIME: info.DATE_TIME || "",
      DATE_C: info.DATE_C || info.DATE_TIME || "",
    };

    // 更新右侧配料单 panel 标题为模板配料单号
    const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
    const stNo = selectedRowData.value.ST_NO || "";
    const dateC = selectedRowData.value.DATE_C || "";
    rightPanelTitle.value = `配料单信息_${composeListNo}_${stNo}_${dateC}`;

    // 用新的模板配料单号查询右侧明细
    await loadEmbedData(selectedRowData.value);

    // 查询完成后，恢复 selectedRowData 为左侧计划行原来的配料单号和日期
    // 这样保存时会传入正确的左侧计划行配料单号
    selectedRowData.value = {
      ...selectedRowData.value,
      COMPOSE_LIST_NO: originalComposeListNo,
      DATE_TIME: originalDateTime,
      DATE_C: originalDateC,
    };

    // 标记为导入模板后未保存，必须先保存才能进行审核、匹配对应等其他操作
    templateImportedNotSaved.value = true;

    // 恢复标题为原配料单号
    const originalTitleComposeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
    const originalTitleStNo = selectedRowData.value.ST_NO || "";
    const originalTitleDateC = selectedRowData.value.DATE_C || "";
    rightPanelTitle.value = `配料单信息_${originalTitleComposeListNo}_${originalTitleStNo}_${originalTitleDateC}`;
  }
};

// ====================  F2 ~ F10（后续写逻辑在主文件这里写） ====================

// F2 查询
const F2_DO = async (e: any) => {
  console.log("查询,start");
  p_query();
};

// F3 调用模型
const F3_DO = async (e: any) => {
  // 0. 保存当前焦点行定位键（DATE_C / ST_NO）
  let locateDateC = "";
  let locateStNo = "";
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  if (currentRow) {
    const getVal = (key: string) => {
      if (currentRow && typeof currentRow.get === "function") {
        return currentRow.get(key);
      }
      return currentRow[key];
    };
    locateDateC = getVal("DATE_C") || "";
    locateStNo = getVal("ST_NO") || "";
  }

  // 获取左侧 INQ1 勾选行数据作为 Main
  const table0 = erFormHelper.getGridSelectRowsAsBlock(config_inq1.value);
  if (!table0 || !table0.data || table0.data.length === 0) {
    erFormHelper.messageWarning("请先选择左侧查询行！");
    return;
  }

  // 组装 EIInfo
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(table0, "Main");
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('FBSM32S2N_PROD1'), 'TAPPING_WT');

  // 调用后台模型服务
  const outInfo = await erFormHelper.callService("fbsm15tg_mx_ins", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("调用模型失败：" + outInfo.sys.msg);
    return;
  }
  erFormHelper.messageSuccess("模型调用成功！");

  // 刷新左侧并恢复焦点行、同步右侧
  await restoreFocusAndRefresh({
    DATE_C: locateDateC,
    ST_NO: locateStNo,
  });
};

// F4 保存修改
const F4_DO = async (e: any) => {
  onToolbarSaveFormula();
};

// F5 过程数据
const F5_DO = async (e: any) => {
  onToolbarShowProcessData();
};

// F6 库存查询
const F6_DO = async (e: any) => {
  onToolbarShowStock();
};

// 恢复焦点行并刷新右侧（匹配对应/模型/保存/审核等操作后使用）
const restoreFocusAndRefresh = async (locator: { DATE_C?: string; ST_NO?: string; COMPOSE_LIST_NO?: string }) => {
  await p_query();
  const hasLocator = Object.values(locator).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );
  if (hasLocator) {
    await nextTick();
    try {
      erFormHelper.setGridIndicator(config_inq1.value, locator);
      await sleep(300);
      await syncRightPanelWithCurrentGridRow();
    } catch (e: any) {
      console.log("焦点行恢复失败:", e?.message || e);
    }
  } else {
    await syncRightPanelWithCurrentGridRow();
  }
};

// F7 匹配对应
const F7_DO = async (e: any) => {
  // 校验导入模板后是否已保存
  if (templateImportedNotSaved.value) {
    erFormHelper.messageWarning("请先保存当前导入的模板配料单，再执行匹配对应");
    return;
  }

  // 0. 保存当前焦点行定位键（DATE_C / ST_NO）
  let locateDateC = "";
  let locateStNo = "";
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  if (currentRow) {
    const getVal = (key: string) => {
      if (currentRow && typeof currentRow.get === "function") {
        return currentRow.get(key);
      }
      return currentRow[key];
    };
    locateDateC = getVal("DATE_C") || "";
    locateStNo = getVal("ST_NO") || "";
  }

  // 1. 获取左侧 INQ1 勾选行数据作为 Table0
  const table0 = erFormHelper.getGridSelectRowsAsBlock(config_inq1.value);
  if (!table0 || !table0.data || table0.data.length === 0) {
    erFormHelper.messageWarning("请先选择左侧要匹配的数据！");
    return;
  }

  // 1.1 校验右侧数据：必须有数据且未被修改
  const hasRightData =
    materialDataBOF.value.length > 1 &&
    materialDataBOF.value.some((row, idx) => {
      if (idx === 0) return false;
      const val = row[0]?.value;
      return val && !specialRowLabels.includes(String(val));
    });
  if (!hasRightData) {
    erFormHelper.messageError("右侧没有配料单数据，无法匹配对应");
    return;
  }
  if (dataModified.value) {
    erFormHelper.messageError("右侧配料单数据有修改未保存，请先保存或刷新后再匹配对应");
    return;
  }

  // 2. 从 selectedRowData 组装 Table1（右侧历史配料单数据）
  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";
  const backlogEa = selectedRowData.value.BACKLOG_EA || "";
  const materialCode = selectedRowData.value.MATERIAL_CODE || "";
  const dateC = selectedRowData.value.DATE_C || "";

  if (!composeListNo) {
    erFormHelper.messageError("右侧未获取到历史配料单号，无法匹配对应");
    return;
  }

  const table1 = new EI.EiBlock("Table1");
  table1.addColumns("COMPOSE_LIST_NO", "ST_NO", "BACKLOG_EA", "MATERIAL_CODE", "DATE_C");
  table1.addRow({
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    BACKLOG_EA: backlogEa,
    MATERIAL_CODE: materialCode,
    DATE_C: dateC,
  });

  // 3. 确认弹窗
  const confirmed = await erFormHelper.messageConfirm(
    `确认将以下配料单信息复用到勾选的计划数据？配料单号：${composeListNo}`
  );
  if (!confirmed) return;

  // 4. 组装 EIInfo
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(table0, "Table0");
  inInfo.addBlock(table1, "Table1");

  // 5. 调用匹配对应服务
  const outInfo = await erFormHelper.callService("fbsm31z_plan_map", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("匹配对应失败：" + outInfo.sys.msg);
    return;
  }
  erFormHelper.messageSuccess("匹配对应成功！");

  // 6. 重新查询左侧并恢复焦点行、刷新右侧
  await restoreFocusAndRefresh({
    DATE_C: locateDateC,
    ST_NO: locateStNo,
  });
};

// F8 导入模板
const F8_DO = async (e: any) => {
  onToolbarShowHistory();
};

// F9 存为模板
const F9_DO = async (e: any) => {
  onToolbarSaveToTemplate();
};

// F10 审核
const F10_DO = async (e: any) => {
  onToolbarCheckFormula();
};

// F11 取消审核
const F11_DO = async (e: any) => {
  onToolbarNocheckFormula();
};

// F12 导出
const F12_DO = async (e: any) => {
  onToolbarExportFormula();
};

// 根据左侧当前焦点行同步右侧 panel 标题、selectedRowData 并加载右侧数据
const syncRightPanelWithCurrentGridRow = async () => {
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  selectedRowData.value = currentRow || {};

  // 更新右侧配料单 panel 标题
  const composeListNo = selectedRowData.value.COMPOSE_LIST_NO || "";
  const stNo = selectedRowData.value.ST_NO || "";
  const dateC = selectedRowData.value.DATE_C || "";
  rightPanelTitle.value = `配料单号_${composeListNo}_${stNo}_${dateC}`;

  await loadEmbedData(selectedRowData.value);

  // 切换左侧焦点行后，重置导入模板未保存标记
  templateImportedNotSaved.value = false;
};

const FBSM32S2N_INQ1DoubleClick = async (e: any) => {
  console.log("左侧行双击，触发右侧嵌入组件加载");
  await syncRightPanelWithCurrentGridRow();
};

onMounted(() => {
  // 初始状态：右侧只显示表头
  materialDataBOF.value = [createHeaderRowBOF()];
});
</script>

<style lang="scss" scoped></style>
