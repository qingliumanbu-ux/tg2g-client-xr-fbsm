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
  >
    <template v-if="initializeFlag === 1">
      <v-splitter style="height: auto" class="default-theme">
        <v-splitter-pane size="70">
          <er-layout
            :er-form-helper-prop="erFormHelper"
            :config-id="'FBSM41S2N_QUERY'"
          ></er-layout>
        </v-splitter-pane>
        <v-splitter-pane size="30">
          <er-layout
            :er-form-helper-prop="erFormHelper"
            :config-id="'FBSM41S2N_PROD2'"
          ></er-layout>
        </v-splitter-pane>
      </v-splitter>
      <v-splitter style="height: 90%" class="default-theme">
        <v-splitter-pane :size="show_flg_1 && show_flg_2 ? 25 : show_flg_1 ? 100 : 0">
          <xr-ef-panel title="配料单信息" padding="5px" style="height: 100%">
            <template #customButtonSlot>
              <a-button
                @click="show_flg_1 = !show_flg_1"
                type="primary"
                v-if="show_flg_1 && show_flg_2"
                v-text="'<<折叠'"
              />
              <a-button
                @click="show_flg_2 = !show_flg_2"
                type="primary"
                v-if="!show_flg_2"
                v-text="'>>料篮信息'"
              />
            </template>
            <template #contentSlot>
              <div style="display: flex; flex-direction: column; height: 100%">
                <er-grid
                  style="flex: 1; min-height: 0"
                  :er-form-helper-prop="erFormHelper"
                  :config-id="'FBSM41S2N_INQ1'"
                  @double-click="FBSM41S2N_INQ1DoubleClick"
                  @focus-changed="FBSM41S2N_INQ1FocusChanged"
                >
                </er-grid>
              </div>
            </template>
          </xr-ef-panel>
        </v-splitter-pane>
        <v-splitter-pane :size="show_flg_1 && show_flg_2 ? 75 : show_flg_2 ? 100 : 0">
          <div style="display: flex; flex-direction: column; height: 100%">
            <xr-ef-panel title="料篮信息" padding="5px" style="flex: 1; min-height: 0">
              <template #customButtonSlot>
                <a-button
                  @click="show_flg_2 = !show_flg_2"
                  type="primary"
                  v-if="show_flg_2 && show_flg_1"
                  v-text="'折叠>>'"
                />
                <a-button
                  @click="show_flg_1 = !show_flg_1"
                  type="primary"
                  v-if="!show_flg_1"
                  v-text="'<<配料单信息'"
                />
                <a-button @click="handleAddBasket" type="primary" style="margin-left: 8px"
                  >新增篮</a-button
                >
              </template>
              <template #contentSlot>
                <div
                  style="
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: auto;
                  "
                >
                  <er-layout
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41S2N_PROD1'"
                    :show-group-border="false"
                    @value-changed="onProd1ValueChanged"
                  ></er-layout>
                  <FBSM41S2N_Embed
                    ref="embedRef"
                    :raw-data="rawMaterialData"
                    :material-data-source="materialDataSource"
                    :code-map="codeMap"
                    :bunker-no-list="bunkerNoList"
                    @data-change="handleEmbedDataChange"
                    @delete-basket-request="handleDeleteBasketRequest"
                  />
                </div>
              </template>
            </xr-ef-panel>
          </div>
        </v-splitter-pane>
      </v-splitter>
    </template>
    <xr-ef-dialog
      ref="dialogRef"
      title="配料单展示"
      v-model:visible="dialogVisible"
      width="100%"
      height="100%"
    >
      <FBSM15YS2N
        :openInDialog="true"
        :parentInfo="parentInfo"
        @getChildInfo="getChildInfo"
        :dialogFormName="dialogFormName"
        :openFormName="'FBSM15YS2N'"
      >
      </FBSM15YS2N>
    </xr-ef-dialog>

    <!-- 模板配料单弹窗 FBSM41MS2N -->
    <xr-ef-dialog
      ref="templateDialogRef"
      title="导入模板配料单"
      v-model:visible="templateDialogVisible"
      width="95%"
      height="95%"
    >
      <FBSM41MS2N
        :openInDialog="true"
        :parentInfo="templateParentInfo"
        @getChildInfo="handleTemplateChildInfo"
        :dialogFormName="templateDialogFormName"
      >
      </FBSM41MS2N>
    </xr-ef-dialog>
  </xr-ef-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default {
  name: "FBSM41S2N",
};
</script>

<script lang="ts" setup>
import { ref, reactive, computed, nextTick, watch } from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import { ER } from "ERX/Er";
import { EI } from "EIX/ei";
import eBFR from "EBFR/eBFR";
import type { DataSourceItem } from "../FBSM17S2N/Spreadsheet.vue";
import FBSM41S2N_Embed from "./FBSM41S2N_Embed.vue";
import type { RawMaterialRow } from "./FBSM41S2N_Embed.vue";
import FBSM15YS2N from "@/views/FBSM15YS2N/FBSM15YS2N.vue";
import FBSM41MS2N from "@/views/FBSM41MS2N/FBSM41MS2N.vue";

// ==================== 变量定义 ====================
const formPartition = ref("");
const efFormInfo = ref<{ [key: string]: any }>({});
const efFormIsReady = ref(false);
const show_flg_1 = ref(true);
const show_flg_2 = ref(true);

// 左右折叠控制

// 弹窗相关
const dialogVisible = ref(false);
const dialogFormName = ref("FBSM15YS2N");
const parentInfo = ref<Record<string, any>>({});

const getChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    dialogVisible.value = false;
  }
};

// 模板配料单弹窗相关
const templateDialogVisible = ref(false);
const templateDialogFormName = ref("FBSM41MS2N");
const templateParentInfo = ref<Record<string, any>>({});
const templateDialogRef = ref<any>(null);

const handleTemplateChildInfo = async (info: any) => {
  if (info.closeEfDialog === true) {
    templateDialogVisible.value = false;

    // 没有选中模板行，直接返回
    if (!info.COMPOSE_LIST_NO || !info.COMPOSE_LIST_NO_EAF) {
      return;
    }

    // 保存当前焦点行定位键
    let locateDateC = "";
    let locateStNo = "";
    let locateBacklogEa = "";
    let locateSeqNo = "";
    const currentRow = erFormHelper.getGridCurrentRow("FBSM41S2N_INQ1");
    if (currentRow) {
      const getVal = (key: string) => {
        if (currentRow && typeof currentRow.get === "function") {
          return currentRow.get(key);
        }
        return currentRow[key];
      };
      locateDateC = getVal("DATE_C") || "";
      locateStNo = getVal("ST_NO") || "";
      locateBacklogEa = getVal("BACKLOG_EA") || "";
      locateSeqNo = getVal("SEQ_NO") || "";
    }

    // 获取左侧勾选行作为 Table0
    const table0 = erFormHelper.getGridSelectRowsAsBlock("FBSM41S2N_INQ1");
    if (!table0 || !table0.data || table0.data.length === 0) {
      erFormHelper.messageWarning("请先选择左侧要应用模板的计划数据！");
      return;
    }

    // 校验勾选行：COMPOSE_LIST_NO 和 COMPOSE_LIST_NO_EAF 必须都为空
    for (const row of table0.data) {
      const hasComposeListNo =
        row.COMPOSE_LIST_NO && String(row.COMPOSE_LIST_NO).trim() !== "";
      const hasComposeListNoEaf =
        row.COMPOSE_LIST_NO_EAF && String(row.COMPOSE_LIST_NO_EAF).trim() !== "";
      if (hasComposeListNo || hasComposeListNoEaf) {
        erFormHelper.messageError("勾选的 plan data 必须未分配配料单号和电炉配料单号！");
        return;
      }
    }

    // Table1：模板配料单信息
    const table1 = new EI.EiBlock("Table1");
    table1.addColumns("COMPOSE_LIST_NO", "COMPOSE_LIST_NO_EAF", "ST_NO", "DATE_C");
    table1.addRow({
      COMPOSE_LIST_NO: info.COMPOSE_LIST_NO,
      COMPOSE_LIST_NO_EAF: info.COMPOSE_LIST_NO_EAF,
      ST_NO: info.ST_NO || "",
      DATE_C: info.DATE_C || "",
    });

    // 组装 EIInfo 并调用服务
    const inInfo = new EI.EIInfo();
    inInfo.addBlock(table0, "Table0");
    inInfo.addBlock(table1, "Table1");

    const outInfo = await erFormHelper.callService("fbsm41_plan_map", inInfo);
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError("导入模板配料单失败：" + outInfo.sys.msg);
      return;
    }
    erFormHelper.messageSuccess("导入模板配料单成功！");

    // 重新查询左侧并恢复焦点行、刷新右侧
    await restoreFocusAndRefreshDetail({
      DATE_C: locateDateC,
      ST_NO: locateStNo,
      BACKLOG_EA: locateBacklogEa,
      SEQ_NO: locateSeqNo,
    });
  }
};

// Embed 组件引用
const embedRef = ref<InstanceType<typeof FBSM41S2N_Embed>>();

// 原始物料数据
const rawMaterialData = ref<RawMaterialRow[]>([]);

// 物料数据源（从后台查询加载，和17画面一致）
const materialDataSource = ref<DataSourceItem[]>([]);

// 料篮号数据源（从 fbsm41_material_inq 第二个返回块加载）
const bunkerNoList = ref<DataSourceItem[]>([]);

// 库区代码对照表（CODE → 中文描述）
const codeMap = ref<Map<string, string>>(new Map());
const reverseCodeMap = ref<Map<string, string>>(new Map());

// 电炉最新处理号对照表（DEV_CODE → 最新 EAF_PROC_NO）
const eafProcNoMap = ref<Record<string, string>>({});

// PROD1 数据修改标记（auto-bind 会导致无法编辑，改用事件监听）
const prod1DataChanged = ref(false);

// 标记是否正在加载 PROD1 数据（加载期间不响应 value-changed 生成处理号）
const isLoadingProd1 = ref(false);

const onProd1ValueChanged = (e: any) => {
  if (e?.itemCode != "BUNKER_SEQ_MAX") {
    if (isLoadingProd1.value) return;
    prod1DataChanged.value = true;

    if (e?.itemCode === "DEV_CODE") {
      generateEafProcNo(e?.value);
    }
  }
};

// 根据 DEV_CODE 设置新的 EAF_PROC_NO（后台已直接返回最新可用处理号）
const generateEafProcNo = (devCode: string) => {
  if (!devCode) return;
  const newEafProcNo = eafProcNoMap.value[devCode];
  if (!newEafProcNo) return;

  erFormHelper.setControlValue("FBSM41S2N_PROD1", "EAF_PROC_NO", newEafProcNo);
};

let debug_flg = true;

// ==================== 初始化 ====================
const formName = "FBSM41S2N";
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";

const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  initializePage();
};

const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(
    formPartition.value,
    formName,
    "",
    initializeService
  );
  if (initialResult.flag >= 0) {
    await queryCodeMap();
    initializeFlag.value = 1;
  } else {
    erFormHelper.messageError(
      "ErFormHelper initialize failed, error msg is [" + initialResult.msg + "]!"
    );
  }
};

// 查询库区代码对照表
const queryCodeMap = async () => {
  const res = await erFormHelper.callService(
    "fbsm_stock_name_inq",
    new EI.EIInfo(),
    true,
    true
  );
  if (res.sys.status < 0) {
    erFormHelper.messageError("查询库区代码对照表错误:" + res.sys.msg);
    return;
  }
  const data = res.getBlock("Table0")?.data || [];
  const map = new Map<string, string>();
  const reverseMap = new Map<string, string>();
  for (const item of data) {
    const code = String(item.CODE || "").trim();
    const desc = String(item.CODE_DESC || "").trim();
    if (code && desc) {
      map.set(code, desc);
      // reverseMap 中相同中文描述只保留第一个（避免 SQL union 中重复描述覆盖）
      if (!reverseMap.has(desc)) {
        reverseMap.set(desc, code);
      }
    }
  }
  codeMap.value = map;
  reverseCodeMap.value = reverseMap;
};

// ==================== 左侧查询 ====================
const F2_DO = async (e: any) => {
  if (debug_flg) console.log(e.name + e.desc);
  await p_query_left();
};

const p_query_left = async () => {
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock("FBSM41S2N_QUERY"));
  const outInfo = await erFormHelper.callService("fbsm41_inq", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, "FBSM41S2N_INQ1");
  }
};

// ==================== Grid 事件 ====================
const FBSM41S2N_INQ1FocusChanged = async (e: any) => {
  const currentRow = erFormHelper.getGridCurrentRow("FBSM41S2N_INQ1");
  if (currentRow) {
    // 可同步到明细 layout
  }
};

const FBSM41S2N_INQ1DoubleClick = async (e: any) => {
  show_flg_2.value = true;

  const currentRow = erFormHelper.getGridCurrentRowAsBlock("FBSM41S2N_INQ1");
  if (!currentRow || !currentRow.data || currentRow.data.length === 0) return;

  // 清空右侧旧数据，避免新数据加载前显示上次的内容
  erFormHelper.clearLayoutData("FBSM41S2N_PROD1");
  rawMaterialData.value = [];

  await p_query_detail();
};

// ==================== 右侧详情查询 ====================
const p_query_detail = async () => {
  const currentRow = erFormHelper.getGridCurrentRowAsBlock("FBSM41S2N_INQ1");
  if (!currentRow || !currentRow.data || currentRow.data.length === 0) return;

  const rowData = currentRow.data[0];
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns(
    "COMPOSE_LIST_NO",
    "ST_NO",
    "BACKLOG_EA",
    "MATERIAL_CODE",
    "COMPOSE_LIST_NO_EAF"
  );
  block.addRow({
    COMPOSE_LIST_NO: rowData["COMPOSE_LIST_NO"] || "",
    ST_NO: rowData["ST_NO"] || "",
    BACKLOG_EA: rowData["BACKLOG_EA"] || "",
    MATERIAL_CODE: rowData["MATERIAL_CODE"] || "",
    COMPOSE_LIST_NO_EAF: rowData["COMPOSE_LIST_NO_EAF"] || "",
  });

  const response = await erFormHelper.callService("fbsm41_inq_dtl", inInfo);
  const dataArray = response.getBlock(0)?.data || [];

  console.log("配料单详情dataArray", response.getBlock(1)?.data[0]);
  console.log("配料单明细dataArray", dataArray);

  // 第三个返回块为电炉最新处理号（列 E1、E2）
  const eafProcNoBlock = response.getBlock(2)?.data?.[0] || {};
  eafProcNoMap.value = {
    E1: String(eafProcNoBlock.E1 || ""),
    E2: String(eafProcNoBlock.E2 || ""),
  };

  isLoadingProd1.value = true;
  erFormHelper.setControlValueEx("FBSM41S2N_PROD1", response.getBlock(1)?.data[0]);
  isLoadingProd1.value = false;
  prod1DataChanged.value = false; // 加载新数据后重置修改标记

  // 同步加载物料数据源（供右侧弹窗使用）
  await queryMaterialSource();

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    rawMaterialData.value = [];
    return;
  }

  // 转换为 RawMaterialRow 格式（库区保持原始代码，由 Embed 组件自行转换显示）
  rawMaterialData.value = dataArray.map((item: any) => ({
    BUNKER_SEQ: String(item.BUNKER_SEQ || "1"),
    BUNKER_NO: String(item.BUNKER_NO || ""),
    LAYER_NO: String(item.LAYER_NO || ""),
    MAT_NAME: String(item.MAT_NAME || ""),
    CAL_WEIGHT: String(item.CAL_WEIGHT || ""),
    ACT_WEIGHT: String(item.ACT_WEIGHT || ""),
    C_VALUE: String(item.C_VALUE || ""),
    SI_VALUE: String(item.SI_VALUE || ""),
    MN_VALUE: String(item.MN_VALUE || ""),
    P_VALUE: String(item.P_VALUE || ""),
    S_VALUE: String(item.S_VALUE || ""),
    CR_VALUE: String(item.CR_VALUE || ""),
    NI_VALUE: String(item.NI_VALUE || ""),
    MO_VALUE: String(item.MO_VALUE || ""),
    CU_VALUE: String(item.CU_VALUE || ""),
    CO_VALUE: String(item.CO_VALUE || ""),
    MAT_CODE: String(item.MAT_CODE || ""),
    LOT_NO: String(item.LOT_NO || ""),
    STOCK_NAME: String(item.STOCK_NAME || ""),
  }));
};

// ==================== 物料数据源查询 ====================
const queryMaterialSource = async () => {
  const currentRow = erFormHelper.getGridCurrentRowAsBlock("FBSM41S2N_INQ1");
  const composeListNo = currentRow?.data?.[0]?.["COMPOSE_LIST_NO"] || "";

  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock());
  block.addColumns("COMPOSE_LIST_NO");
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
  });

  const response = await erFormHelper.callService("fbsm41_material_inq", inInfo);
  const dataArray = response.getBlock(0)?.data || [];
  const bunkerArray = response.getBlock(1)?.data || [];

  // 加载料篮号列表（第二个返回块）
  bunkerNoList.value = bunkerArray
    .map((item: any) => ({
      bunkerNo: String(item.BUNKER_NO || ""),
    }))
    .filter((item: any) => item.bunkerNo);

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    materialDataSource.value = [];
    return;
  }

  materialDataSource.value = dataArray.map((item: any) => {
    return {
      name: item.MAT_NAME || "",
      code: item.MAT_CODE || "",
      storageArea:
        codeMap.value.get(String(item.STOCK_NAME || "").trim()) ||
        String(item.STOCK_NAME || ""),
      storageAreaCode: String(item.STOCK_NAME || ""),
      batchNumber: item.LOT_NO || "",
      weight: item.WEIGHT || 0,
      c: item.C_VALUE || 0,
      si: item.SI_VALUE || 0,
      mn: item.MN_VALUE || 0,
      p: item.P_VALUE || 0,
      s: item.S_VALUE || 0,
      cr: item.CR_VALUE || 0,
      ni: item.NI_VALUE || 0,
      mo: item.MO_VALUE || 0,
      cu: item.CU_VALUE || 0,
      co: item.CO_VALUE || 0,
    };
  });
};

// ==================== Embed 数据变化 ====================
const handleEmbedDataChange = (data: any[][][]) => {
  // 可根据需要处理数据变化
  if (debug_flg) console.log("Embed data changed");
};

const handleDeleteBasketRequest = async (index: number, basketSeq: string) => {
  const confirmed = await erFormHelper.messageConfirm(`确认删除第${basketSeq}篮？`);
  if (confirmed && embedRef.value) {
    embedRef.value.deleteBasket(index);
    erFormHelper.messageSuccess("删除成功");
  }
};

// ==================== 新增/删除篮 ====================
const handleAddBasket = () => {
  if (embedRef.value) {
    embedRef.value.addBasket();
  }
};

// 保存功能
const F3_DO = async (e: any) => {
  // 1. 从 PROD1 layout 获取配料单号和电炉配料单号
  const composeListNo =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO") || "";
  const composeListNoEaf =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO_EAF") || "";
  if (!composeListNo) {
    erFormHelper.messageError("配料单号为空，无法保存");
    return;
  }
  if (!composeListNoEaf) {
    erFormHelper.messageError("电炉配料单号为空，无法保存");
    return;
  }

  // 2. 检测是否有修改（PROD1 layout + Embed）
  const prod1HasChanges = prod1DataChanged.value;
  const rightHasChanges = embedRef.value?.hasDataChange() || false;
  if (!prod1HasChanges && !rightHasChanges) {
    erFormHelper.messageWarning("没有数据修改，无需保存");
    return;
  }

  // 3. 获取右侧所有篮的数据
  const rawData = embedRef.value?.getAllDataAsRaw() || [];

  // 4. 数据校验（仅当 Embed 有修改时校验明细数据）
  if (rightHasChanges) {
    if (rawData.length === 0) {
      erFormHelper.messageWarning("没有数据需要保存");
      return;
    }
    for (const row of rawData) {
      const matCodeEmpty = !row.MAT_CODE || String(row.MAT_CODE).trim() === "";
      const layerNoEmpty = !row.LAYER_NO || String(row.LAYER_NO).trim() === "";
      if (matCodeEmpty && layerNoEmpty) {
        erFormHelper.messageWarning(`第${row.BUNKER_SEQ}篮数据有空行`);
        return;
      }
      if (matCodeEmpty) {
        erFormHelper.messageWarning(
          `第${row.BUNKER_SEQ}篮的第${row.LAYER_NO}层物料代码为空`
        );
        return;
      }
      // if (layerNoEmpty) {
      //   erFormHelper.messageWarning(
      //     `第${row.BUNKER_SEQ}篮的${row.MAT_NAME || "某物料"}未分配层号`
      //   );
      //   return;
      // }

      // 校验配料重量不能为空
      // const calWeightStr = String(row.CAL_WEIGHT || "").trim();
      // if (calWeightStr === "") {
      //   erFormHelper.messageWarning(
      //     `第${row.BUNKER_SEQ}篮的第${row.LAYER_NO}层无配料重量`
      //   );
      //   return;
      // }

      const actWeightStr = String(row.ACT_WEIGHT || "").trim();
      if (actWeightStr === "") {
        erFormHelper.messageWarning(
          `第${row.BUNKER_SEQ}篮的第${row.LAYER_NO}层无实际重量`
        );
        return;
      }

      // 校验配料重量和实际重量是否为有效数字
      // if (isNaN(Number(calWeightStr))) {
      //   erFormHelper.messageError(
      //     `第${row.BUNKER_SEQ}篮的第${row.LAYER_NO}层配料重量输入非法：${calWeightStr}`
      //   );
      //   return;
      // }

      if (actWeightStr !== "" && isNaN(Number(actWeightStr))) {
        erFormHelper.messageError(
          `第${row.BUNKER_SEQ}篮的第${row.LAYER_NO}层实际重量输入非法：${actWeightStr}`
        );
        return;
      }
    }
  }

  // 5. 组装 EIInfo
  const inInfo = new EI.EIInfo();

  // Table0: Embed 明细数据（有修改则压数据，无修改传空块）
  const table0 = new EI.EiBlock("Table0");
  if (rightHasChanges) {
    table0.addColumns(
      "COMPOSE_LIST_NO",
      "COMPOSE_LIST_NO_EAF",
      "BUNKER_NO",
      "BUNKER_SEQ",
      "LAYER_NO",
      "MAT_CODE",
      "MAT_NAME",
      "LOT_NO",
      "CAL_WEIGHT",
      "ACT_WEIGHT",
      "STOCK_NAME"
    );
    rawData.forEach((row: RawMaterialRow) => {
      // 库区中文转代码传回后台
      const stockCode =
        reverseCodeMap.value.get(String(row.STOCK_NAME || "").trim()) || row.STOCK_NAME;
      table0.addRow({
        COMPOSE_LIST_NO: composeListNo,
        COMPOSE_LIST_NO_EAF: composeListNoEaf,
        BUNKER_NO: row.BUNKER_NO,
        BUNKER_SEQ: row.BUNKER_SEQ,
        LAYER_NO: row.LAYER_NO,
        MAT_CODE: row.MAT_CODE,
        MAT_NAME: row.MAT_NAME,
        LOT_NO: row.LOT_NO,
        CAL_WEIGHT: row.CAL_WEIGHT,
        ACT_WEIGHT: row.ACT_WEIGHT,
        STOCK_NAME: stockCode,
      });
    });
  }
  inInfo.addBlock(table0, "Table0");

  // Table1: PROD1 layout 数据（有修改则压数据，无修改传空块）
  let table1 = new EI.EiBlock("Table1");
  if (prod1HasChanges) {
    table1 = erFormHelper.getAllControlValueAsEiBlock("FBSM41S2N_PROD1");
  }
  inInfo.addBlock(table1, "Table1");

  // 保存时库区已由 Embed 通过 code 字段还原，无需 reverseCodeMap 转换

  console.log("保存传入数据 Table0:", table0);
  console.log("保存传入数据 Table1:", table1);

  // 6. 调用保存服务
  const outInfo = await erFormHelper.callService("fbsm41_detail_save", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("保存失败：" + outInfo.sys.msg);
    return;
  }
  erFormHelper.messageSuccess("保存成功！");
  prod1DataChanged.value = false; // 保存成功后重置修改标记

  // 5. 刷新右侧明细
  await p_query_detail();
};

// 延时工具
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 恢复焦点行并刷新右侧详情（通用：按 DATE_C、ST_NO、BACKLOG_EA、SEQ_NO 定位）
const restoreFocusAndRefreshDetail = async (locator: Record<string, any>) => {
  await p_query_left();
  const hasLocator = Object.values(locator).some(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );
  if (hasLocator) {
    nextTick(async () => {
      try {
        erFormHelper.setGridIndicator("FBSM41S2N_INQ1", locator);
        await sleep(300);
        p_query_detail();
      } catch (e: any) {
        console.log("焦点行恢复失败:", e?.message || e);
      }
    });
  } else {
    await p_query_detail();
  }
};

// 调用模型功能
const F4_DO = async (e: any) => {
  // 0. 保存当前焦点行定位键（用于查询后恢复）
  let locateDateC = "";
  let locateStNo = "";
  let locateBacklogEa = "";
  let locateSeqNo = "";
  const currentRow = erFormHelper.getGridCurrentRow("FBSM41S2N_INQ1");
  if (currentRow) {
    const getVal = (key: string) => {
      if (currentRow && typeof currentRow.get === "function") {
        return currentRow.get(key);
      }
      return currentRow[key];
    };
    locateDateC = getVal("DATE_C") || "";
    locateStNo = getVal("ST_NO") || "";
    locateBacklogEa = getVal("BACKLOG_EA") || "";
    locateSeqNo = getVal("SEQ_NO") || "";
  }

  // 1. 获取左侧INQ1当前行数据作为Table0
  const table0 = erFormHelper.getGridSelectRowsAsBlock("FBSM41S2N_INQ1");
  if (!table0 || !table0.data || table0.data.length === 0) {
    erFormHelper.messageWarning("请先选择左侧查询行！");
    return;
  }

  // 1.1 校验勾选行是否有配料单号
  const emptyComposeListNoRows = table0.data.filter(
    (row: any) => !row.COMPOSE_LIST_NO || String(row.COMPOSE_LIST_NO).trim() === ""
  );
  if (emptyComposeListNoRows.length > 0) {
    const confirmed = await erFormHelper.messageConfirm(
      `有${emptyComposeListNoRows.length}行数据无配料单号，将会被跳过，是否继续？`
    );
    if (!confirmed) return;
    // 过滤掉无配料单号的行
    table0.data = table0.data.filter(
      (row: any) => row.COMPOSE_LIST_NO && String(row.COMPOSE_LIST_NO).trim() !== ""
    );
    if (table0.data.length === 0) {
      erFormHelper.messageWarning("没有有效的勾选行，无法调用模型！");
      return;
    }
  }

  // 2. 获取PROD2布局数据作为Table1
  const table1 = erFormHelper.getAllControlValueAsEiBlock("FBSM41S2N_PROD2");

  // 2.1 校验 PROD2 字段（为空时不校验，后台有默认值）
  if (table1 && table1.data && table1.data.length > 0) {
    const bunkerWeightMaxStr = table1.data[0].BUNKER_WEIGHT_MAX?.toString() || "";
    if (bunkerWeightMaxStr.trim() !== "") {
      const bunkerWeightMax = parseFloat(bunkerWeightMaxStr);
      if (isNaN(bunkerWeightMax)) {
        erFormHelper.messageError("单篮最大重量输入非法");
        return;
      }
      if (bunkerWeightMax < 30 || bunkerWeightMax > 200) {
        erFormHelper.messageError("单篮最大重量最小值为30，最大值为200");
        return;
      }
    }

    const bunkerNumStr = table1.data[0].BUNKER_NUM?.toString() || "";
    if (bunkerNumStr.trim() !== "") {
      const bunkerNum = parseFloat(bunkerNumStr);
      if (isNaN(bunkerNum)) {
        erFormHelper.messageError("篮数输入非法");
        return;
      }
      if (bunkerNum < 1 || bunkerNum > 10) {
        erFormHelper.messageError("篮数最小值为1，最大值为10");
        return;
      }
    }
  }

  // 3. 组装EIInfo
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(table0, "Table0");
  inInfo.addBlock(table1, "Table1");

  // 4. 调用后台模型服务
  const outInfo = await erFormHelper.callService("fbsm41_mx", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("调用模型失败：" + outInfo.sys.msg);
    return;
  }
  erFormHelper.messageSuccess("模型调用成功！");

  // 5. 重新查询左侧并恢复焦点行、刷新右侧
  await restoreFocusAndRefreshDetail({
    DATE_C: locateDateC,
    ST_NO: locateStNo,
    BACKLOG_EA: locateBacklogEa,
    SEQ_NO: locateSeqNo,
  });
};
const F5_DO = async (e: any) => {
  const composeListNo =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO") || "";
  const stNo = erFormHelper.getControlValue("FBSM41S2N_PROD1", "ST_NO") || "";
  if (!composeListNo) {
    erFormHelper.messageWarning("配料单号为空，无法打开配料单展示");
    return;
  }
  parentInfo.value = {
    COMPOSE_LIST_NO: composeListNo,
    ST_NO: stNo,
    PARENT: "FBSM41S2N",
  };
  dialogFormName.value = "FBSM15YS2N";
  dialogVisible.value = true;
};

// 打印功能（参数直接从 FBSM41S2N_PROD1 读取）
const printReport = async () => {
  const composeListNo =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO") || "";
  const composeListNoEaf =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO_EAF") || "";
  const missingFields: string[] = [];
  if (!composeListNo) missingFields.push("配料单号");
  if (!composeListNoEaf) missingFields.push("电炉配料单号");
  if (missingFields.length > 0) {
    erFormHelper.messageError(`未获取到必要的参数：${missingFields.join("、")}`);
    return;
  }

  const reportParam = `@COMPOSE_LIST_NO@$$${composeListNo};;@COMPOSE_LIST_NO_EAF@$$${composeListNoEaf}`;

  await eBFR.CallReportPDFFrom("FBSM41S2N", reportParam, formPartition.value);

  erFormHelper.messageSuccess("打印请求已发送！");
};

// F6：匹配对应
const F6_DO = async (e: any) => {
  // 0. 保存当前焦点行定位键（用于查询后恢复）
  let locateDateC = "";
  let locateStNo = "";
  let locateBacklogEa = "";
  let locateSeqNo = "";
  const currentRow = erFormHelper.getGridCurrentRow("FBSM41S2N_INQ1");
  if (currentRow) {
    const getVal = (key: string) => {
      if (currentRow && typeof currentRow.get === "function") {
        return currentRow.get(key);
      }
      return currentRow[key];
    };
    locateDateC = getVal("DATE_C") || "";
    locateStNo = getVal("ST_NO") || "";
    locateBacklogEa = getVal("BACKLOG_EA") || "";
    locateSeqNo = getVal("SEQ_NO") || "";
  }

  // 1. 获取左侧INQ1勾选行数据作为Table0
  const table0 = erFormHelper.getGridSelectRowsAsBlock("FBSM41S2N_INQ1");
  if (!table0 || !table0.data || table0.data.length === 0) {
    erFormHelper.messageWarning("请先选择左侧要匹配的数据！");
    return;
  }

  // 1.1 校验勾选行：COMPOSE_LIST_NO 和 COMPOSE_LIST_NO_EAF 必须都为空
  for (const row of table0.data) {
    const hasComposeListNo =
      row.COMPOSE_LIST_NO && String(row.COMPOSE_LIST_NO).trim() !== "";
    const hasComposeListNoEaf =
      row.COMPOSE_LIST_NO_EAF && String(row.COMPOSE_LIST_NO_EAF).trim() !== "";
    if (hasComposeListNo || hasComposeListNoEaf) {
      erFormHelper.messageError("勾选的计划数据必须未分配配料单号和电炉配料单号！");
      return;
    }
  }

  // 2. 获取PROD1布局数据作为Table1
  const table1 = erFormHelper.getAllControlValueAsEiBlock("FBSM41S2N_PROD1");
  if (!table1 || !table1.data || table1.data.length === 0) {
    erFormHelper.messageError("未获取到应显示在右侧的要复用的历史配料单数据！");
    return;
  }

  const prod1Data = table1.data[0];
  const composeListNo = prod1Data.COMPOSE_LIST_NO || "";
  const composeListNoEaf = prod1Data.COMPOSE_LIST_NO_EAF || "";

  // 2.1 校验PROD1：COMPOSE_LIST_NO 和 COMPOSE_LIST_NO_EAF 必须都有值
  if (!composeListNo || !composeListNoEaf) {
    erFormHelper.messageError("历史配料单的配料单号和电炉配料单号不能为空");
    return;
  }

  // 3. 确认弹窗
  const confirmed = await erFormHelper.messageConfirm(
    `确认将以下配料单信息复用到勾选的计划数据？配料单号：${composeListNo} 电炉配料单号：${composeListNoEaf}`
  );
  if (!confirmed) return;

  // 4. 组装EIInfo
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(table0, "Table0");
  inInfo.addBlock(table1, "Table1");

  // 5. 调用匹配对应服务
  const outInfo = await erFormHelper.callService("fbsm41_plan_map", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("匹配对应失败：" + outInfo.sys.msg);
    return;
  }
  erFormHelper.messageSuccess("匹配对应成功！");

  // 6. 重新查询左侧并恢复焦点行、刷新右侧
  await restoreFocusAndRefreshDetail({
    DATE_C: locateDateC,
    ST_NO: locateStNo,
    BACKLOG_EA: locateBacklogEa,
    SEQ_NO: locateSeqNo,
  });
};

// F7：制表提交（审核 + 打印）
const F7_DO = async (e: any) => {
  const composeListNo =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO") || "";
  const composeListNoEaf =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO_EAF") || "";
  const bunker_seq_max =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "BUNKER_SEQ_MAX") || "";
  const missingFields: string[] = [];
  if (!composeListNo) missingFields.push("配料单号");
  if (!composeListNoEaf) missingFields.push("电炉配料单号");
  if (missingFields.length > 0) {
    erFormHelper.messageError(`未获取到必要的参数：${missingFields.join("、")}`);
    return;
  }

  // 1. 校验是否有修改未保存
  const prod1HasChanges = prod1DataChanged.value;
  const rightHasChanges = embedRef.value?.hasDataChange() || false;
  if (prod1HasChanges || rightHasChanges) {
    erFormHelper.messageWarning("有修改的数据未保存，请先保存");
    return;
  }

  // 2. 校验电炉设备号
  const devCode = erFormHelper.getControlValue("FBSM41S2N_PROD1", "DEV_CODE") || "";
  if (!devCode) {
    erFormHelper.messageWarning("请先分配电炉设备号");
    return;
  }

  // 3. 校验料篮号
  const rawData = embedRef.value?.getAllDataAsRaw() || [];
  if (rawData.length === 0) {
    erFormHelper.messageError("无电炉料篮配料单数据");
    return;
  }
  const basketNoMap = new Map<string, string>();
  for (const row of rawData) {
    const seq = String(row.BUNKER_SEQ || "");
    const no = String(row.BUNKER_NO || "").trim();
    if (!basketNoMap.has(seq)) {
      basketNoMap.set(seq, no);
    }
  }
  for (const [seq, no] of basketNoMap) {
    if (!no) {
      erFormHelper.messageError(`第${seq}篮未分配料篮号`);
      return;
    }
  }

  // 4. 校验料篮流水号
  if (bunker_seq_max !== "" && isNaN(Number(bunker_seq_max))) {
    erFormHelper.messageError(`料篮最大流水号输入非法：${bunker_seq_max}`);
    return;
  }

  // 调用审核服务
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("Table0"));
  block.addColumns("COMPOSE_LIST_NO", "COMPOSE_LIST_NO_EAF", "BUNKER_SEQ_MAX");
  block.addRow({
    COMPOSE_LIST_NO: composeListNo,
    COMPOSE_LIST_NO_EAF: composeListNoEaf,
    BUNKER_SEQ_MAX: bunker_seq_max,
  });

  const flagBlock = inInfo.addBlock(new EI.EiBlock("Table1"));
  flagBlock.addColumns("SH_FLAG");
  flagBlock.addRow({ SH_FLAG: "UPD" });

  const response = await erFormHelper.callService("fbsm41_sh_upd", inInfo);
  if (response.sys.status < 0) {
    erFormHelper.messageError("制表提交（审核）失败:" + response.sys.msg);
    return;
  }

  erFormHelper.messageSuccess("制表提交（审核）成功");

  // 审核成功后先查左，再按COMPOSE_LIST_NO和COMPOSE_LIST_NO_EAF恢复焦点行并查右，最后打印
  await p_query_left();
  try {
    erFormHelper.setGridIndicator("FBSM41S2N_INQ1", {
      COMPOSE_LIST_NO: composeListNo,
      COMPOSE_LIST_NO_EAF: composeListNoEaf,
    });
  } catch (e: any) {
    console.log("焦点行恢复失败:", e?.message || e);
  }
  await sleep(300);
  await p_query_detail();
  await printReport();
};

// F8：取消审核
const F8_DO = async (e: any) => {
  const composeListNo =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO") || "";
  const composeListNoEaf =
    erFormHelper.getControlValue("FBSM41S2N_PROD1", "COMPOSE_LIST_NO_EAF") || "";
  const missingFields: string[] = [];
  if (!composeListNo) missingFields.push("配料单号");
  if (!composeListNoEaf) missingFields.push("电炉配料单号");
  if (missingFields.length > 0) {
    erFormHelper.messageError(`未获取到必要的参数：${missingFields.join("、")}`);
    return;
  }

  // 调用审核服务
  const inInfo = new EI.EIInfo();
  const block = inInfo.addBlock(new EI.EiBlock("Table0"));
  block.addColumns("COMPOSE_LIST_NO", "COMPOSE_LIST_NO_EAF");
  block.addRow({ COMPOSE_LIST_NO: composeListNo, COMPOSE_LIST_NO_EAF: composeListNoEaf });

  const flagBlock = inInfo.addBlock(new EI.EiBlock("Table1"));
  flagBlock.addColumns("SH_FLAG");
  flagBlock.addRow({ SH_FLAG: "DEL" });

  const response = await erFormHelper.callService("fbsm41_sh_upd", inInfo);
  if (response.sys.status < 0) {
    erFormHelper.messageError("取消审核失败:" + response.sys.msg);
    return;
  }

  erFormHelper.messageSuccess("取消审核成功");

  // 审核成功后先查左，再按COMPOSE_LIST_NO和COMPOSE_LIST_NO_EAF恢复焦点行并查右，最后打印
  await p_query_left();
  try {
    erFormHelper.setGridIndicator("FBSM41S2N_INQ1", {
      COMPOSE_LIST_NO: composeListNo,
      COMPOSE_LIST_NO_EAF: composeListNoEaf,
    });
  } catch (e: any) {
    console.log("焦点行恢复失败:", e?.message || e);
  }
  await sleep(300);
  await p_query_detail();
};

// F9：导入模板配料单
const F9_DO = async (e: any) => {
  // 1. 校验左侧是否有勾选行
  const selectedRows = erFormHelper.getGridSelectRowsAsBlock("FBSM41S2N_INQ1");
  if (!selectedRows || !selectedRows.data || selectedRows.data.length === 0) {
    erFormHelper.messageWarning("请先选择左侧要应用模板的计划数据！");
    return;
  }

  // 2. 校验勾选行：COMPOSE_LIST_NO 和 COMPOSE_LIST_NO_EAF 必须都为空
  for (const row of selectedRows.data) {
    const hasComposeListNo =
      row.COMPOSE_LIST_NO && String(row.COMPOSE_LIST_NO).trim() !== "";
    const hasComposeListNoEaf =
      row.COMPOSE_LIST_NO_EAF && String(row.COMPOSE_LIST_NO_EAF).trim() !== "";
    if (hasComposeListNo || hasComposeListNoEaf) {
      erFormHelper.messageError("勾选的计划数据必须未分配配料单号和电炉配料单号！");
      return;
    }
  }

  // 3. 获取当前焦点行的 ST_NO，传入弹窗作为查询条件默认值
  const currentRow = erFormHelper.getGridCurrentRow("FBSM41S2N_INQ1");
  const stNo = currentRow
    ? typeof currentRow.get === "function"
      ? currentRow.get("ST_NO") || ""
      : currentRow["ST_NO"] || ""
    : "";

  // 4. 组装传递给弹窗的参数
  templateParentInfo.value = {
    PARENT: "FBSM41S2N",
    ST_NO: stNo,
  };

  // 5. 显示弹窗
  templateDialogFormName.value = "FBSM41MS2N";
  templateDialogVisible.value = true;
};

// F10：打印
const F10_DO = async (e: any) => {
  await printReport();
};
</script>

<style lang="scss" scoped></style>
