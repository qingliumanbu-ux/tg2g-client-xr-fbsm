<template>
  <xr-ef-form
    ref="xrEfFormRef"
    @ready="efFormReady"
    :f2-do="f2Do"
    :f3-pre-do="f3PreDo"
    :f3-do="f3Do"
    :f3-cancel="f3Cancel"
    @closeEfDialogForm="closeEfDialogForm"
  >
    <xr-ef-search-box title="查询条件">
      <template #customButtonSlot> </template>
      <template #contentSlot>
        <a-row :gutter="20">
          <a-col :span="6">
            <a-form-item label="部门(下拉框)">
              <xr-ef-select
                v-model="select1"
                :columns="selectColumns"
                :data="selectData"
                :options="selectOptions"
              ></xr-ef-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工号(输入框)">
              <a-input v-model:value="input1"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </xr-ef-search-box>

    <v-splitter class="default-theme" :horizontal="true" style="flex: 1">
      <v-splitter-pane size="40%">
        <xr-ef-panel title="Grid1" style="height: 100%">
          <template #customButtonSlot> </template>
          <template #contentSlot>
            <ag-grid-vue
              style="width: 100%; height: 100%"
              class="ag-theme-balham"
              ref="Grid1Ref"
              :singleClickEdit="true"
              :rowData="Grid1RowData"
              :columnDefs="Grid1ColumnDefs"
              :defaultColDef="Grid1DefaultColDef"
              :statusBar="Grid1StatusBar"
              :localeText="agLocaleText"
              rowSelection="multiple"
              :stopEditingWhenCellsLoseFocus="true"
              :checkboxSelection="true"
              :suppressRowClickSelection="true"
              @grid-ready="onGrid1Ready"
              @first-data-rendered="onGrid1FirstDataRendered"
            ></ag-grid-vue>
          </template>
        </xr-ef-panel>
      </v-splitter-pane>
      <v-splitter-pane size="60%">
        <v-splitter class="default-theme" style="height: 100%">
          <v-splitter-pane size="50%">
            <xr-ef-panel title="主表" style="height: 100%">
              <template #customButtonSlot> </template>
              <template #contentSlot>
                <ag-grid-vue
                  style="width: 100%; height: 100%"
                  class="ag-theme-balham"
                  ref="mainGridRef"
                  :singleClickEdit="true"
                  :rowData="mainGridRowData"
                  :columnDefs="mainGridColumnDefs"
                  :defaultColDef="mainGridDefaultColDef"
                  :statusBar="mainGridStatusBar"
                  :localeText="agLocaleText"
                  rowSelection="multiple"
                  :stopEditingWhenCellsLoseFocus="true"
                  :checkboxSelection="true"
                  :suppressRowClickSelection="true"
                  @grid-ready="onMainGridReady"
                  @first-data-rendered="onMainGridFirstDataRendered"
                  @cell-focused="onCellFocused"
                ></ag-grid-vue>
              </template>
            </xr-ef-panel>
          </v-splitter-pane>
          <v-splitter-pane size="50%">
            <xr-ef-panel title="子表" style="height: 100%">
              <template #customButtonSlot> </template>
              <template #contentSlot>
                <ag-grid-vue
                  style="width: 100%; height: 100%"
                  class="ag-theme-balham"
                  ref="subGridRef"
                  :singleClickEdit="true"
                  :rowData="subGridRowData"
                  :columnDefs="subGridColumnDefs"
                  :defaultColDef="subGridDefaultColDef"
                  :statusBar="subGridStatusBar"
                  :localeText="agLocaleText"
                  rowSelection="multiple"
                  :stopEditingWhenCellsLoseFocus="true"
                  :checkboxSelection="true"
                  :suppressRowClickSelection="true"
                  @grid-ready="onSubGridReady"
                  @first-data-rendered="onSubGridFirstDataRendered"
                ></ag-grid-vue>
              </template>
            </xr-ef-panel>
          </v-splitter-pane>
        </v-splitter>
      </v-splitter-pane>
    </v-splitter>
  </xr-ef-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getAgLocaleText } from "EFX/locale";
import xrEfForm from "EFX/xrEfForm";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSelect from "EFX/xrEfSelect";
import agToolbarPanel from "EFX/agToolbarPanel";
import multiDropDownEditor from "EFX/agMultiDropDownEditor";
import dateEditor from "EFX/agDateEditor";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { EI, EIManager } from "EIX/ei";
import { message } from "ant-design-vue";
import { EFDialogFormMessage } from "EFX/EFDialogForm";

const agLocaleText = getAgLocaleText();

// 被callForm打开的画面接收参数
import { useRoute } from "vue-router";
const currentRoute = useRoute();

// 画面配置信息
const efFormInfo = ref<{ [key: string]: any }>();
const formPartition = ref<string>("");
const efFormReady = (e: any) => {
  // 参数e.formInfo为当前画面配置信息
  efFormInfo.value = e.formInfo;
  formPartition.value = e.formInfo.formPartition;
  // console.log(efFormInfo.value);

  // 接收父画面open时发的消息，这时的id必须为openProps
  EFDialogFormMessage.receive("openProps", (message: any) => {
    console.log(message);
  });

  // 被callForm打开的画面接收参数
  const msg = currentRoute.query ?? {};
  console.log(msg);
};
const xrEfFormRef = ref();

// --------------- 查询条件 ----------------
const select1 = ref("");
const input1 = ref("");

const selectColumns = ref([
  {
    headerName: "部门编号",
    field: "ENAME",
  },
  {
    headerName: "部门描述",
    field: "CNAME",
  },
]);
const selectData = ref([
  { ENAME: "NODEPT", CNAME: "不定部门" },
  { ENAME: "BS", CNAME: "宝信" },
  { ENAME: "MES", CNAME: "MES" },
  { ENAME: "YJS", CNAME: "信息化研究所" },
]);
const selectOptions = ref({
  multiple: false,
  valueField: "ENAME",
  textField: "CNAME",
  format: "{0} | {1}",
});
// -----------------------------------------

// --------------- Grid1 ----------------
const Grid1Ref = ref();
const Grid1DefaultColDef = ref({
  sortable: true,
  editable: true,
  filter: "agMultiColumnFilter",
  resizable: true,
});
const Grid1ColumnDefs = ref<any>([
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    pinned: "left",
    lockPinned: true,
    editable: false,
    maxWidth: 40,
  },
  {
    field: "CODE_CLASS",
    headerName: "代码编号(文本编辑)",
    cellEditorParams: { maxLength: 20 },
  },
  {
    field: "UNIT",
    headerName: "机组(多列下拉)",
    cellEditorPopup: true,
    valueGetter: (params: any) => {
      const unitData = [
        { CODE: "A001", DESC: "机组A001" },
        { CODE: "A002", DESC: "机组A002" },
        { CODE: "A003", DESC: "机组A003" },
        { CODE: "A004", DESC: "机组A004" },
      ];
      if (!params.data.UNIT) return "";
      const rowData = unitData.filter(
        (item: any) => item.CODE === params.data.UNIT
      )[0];
      return rowData.CODE + "|" + rowData.DESC;
    },
    cellEditorSelector: (params: any) => {
      const columns = [
        { field: "CODE", headerName: "代码" },
        { field: "DESC", headerName: "描述" },
      ];
      const unitData = [
        { CODE: "A001", DESC: "机组A001" },
        { CODE: "A002", DESC: "机组A002" },
        { CODE: "A003", DESC: "机组A003" },
        { CODE: "A004", DESC: "机组A004" },
      ];
      return {
        component: multiDropDownEditor,
        params: {
          dropDownParams: {
            columns: columns,
            data: unitData,
            multiSelect: false,
            valueField: "CODE",
          },
        },
      };
    },
  },
  {
    field: "EX_CODE",
    headerName: "电文(下拉多列并联动)",
    cellEditorPopup: true,
    cellEditorSelector: (params: any) => {
      const columns = [
        {
          field: "CODE",
          headerName: "代码",
        },
        {
          field: "CODE_DESC_1_CONTENT",
          headerName: "描述",
        },
      ];
      const data = [
        {
          CODE: "0",
          CODE_DESC_1_CONTENT: "模拟电文",
        },
        {
          CODE: "1",
          CODE_DESC_1_CONTENT: "实际电文",
        },
      ];
      return {
        component: multiDropDownEditor,
        params: {
          dropDownParams: {
            columns: columns,
            data: data,
            multiSelect: false,
            valueField: "CODE",
            linkTo: [
              {
                linkField: "EX_DESC",
                linkValueField: "CODE_DESC_1_CONTENT",
              },
            ],
          },
        },
      };
    },
  },
  {
    field: "EX_DESC",
    headerName: "电文描述",
    cellDataType: "text",
    editable: false,
  },
  {
    field: "EX_CODE_M",
    headerName: "电文(下拉多选)",
    cellEditorPopup: true,
    cellEditorPopupPosition: "under",
    cellEditorSelector: (params: any) => {
      const data = [
        {
          CODE: "0",
          CODE_DESC_1_CONTENT: "模拟电文",
        },
        {
          CODE: "1",
          CODE_DESC_1_CONTENT: "实际电文",
        },
      ];
      const columns = [
        {
          field: "CODE",
          headerName: "代码",
        },
        {
          field: "CODE_DESC_1_CONTENT",
          headerName: "描述",
        },
      ];
      return {
        component: multiDropDownEditor,
        params: {
          dropDownParams: {
            columns: columns,
            data: data,
            multiSelect: true,
            valueField: "CODE",
          },
        },
      };
    },
  },
  {
    field: "PROD_TIME",
    headerName: "生产时间(日期编辑)",
    cellEditor: dateEditor,
    cellDataType: "datetime",
    valueFormatter: (params: any) => {
      return params.data.PROD_TIME
        ? dayjs(params.data.PROD_TIME, "YYYYMMDDHHmmss").format(
            "YYYY-MM-DD HH:mm:ss"
          )
        : null;
    },
    filterParams: {
      filters: [
        {
          filter: "agDateColumnFilter",
          filterParams: {
            defaultOption: "startsWith",
            comparator(filterLocalDateAtMidnight: any, cellValue: any) {
              const dateAsString = cellValue;
              if (!dateAsString) return 0;
              const cellDate = dayjs(cellValue, "YYYYMMDDHHmmss").toDate();
              if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              } else if (cellDate > filterLocalDateAtMidnight) {
                return 1;
              }
              return 0;
            },
          },
        },
        { filter: "agSetColumnFilter" },
      ],
    },
  },
  {
    field: "WEIGHT",
    headerName: "重量(数值编辑)",
    cellDataType: "number",
    cellEditorParams: { showStepperButtons: true },
  },
  {
    field: "LEVEL",
    headerName: "等级(下拉单列)",
    cellEditor: "agRichSelectCellEditor",
    cellEditorParams: {
      values: ["0", "1", "2"],
      allowTyping: true,
      filterList: true,
      // formatValue: (value: any) => {
      //   return '等级' + value;
      // }
    },
  },
  {
    field: "PASS",
    headerName: "是否通过(布尔编辑)",
    cellDataType: "boolean",
    valueGetter: (params: any) => {
      return params.data.PASS === "1" ? true : false;
    },
    valueSetter: (params: any) => {
      params.data.PASS = params.newValue ? "1" : "0";
      return true;
    },
  },
  {
    field: "REMARK1",
    headerName: "备注1(多行文本编辑)",
    cellEditorPopup: true,
    cellEditor: "agLargeTextCellEditor",
    cellEditorParams: { maxLength: 250, rows: 10, cols: 50 },
  },
]);

const Grid1StatusBar = ref({
  statusPanels: [
    {
      statusPanel: agToolbarPanel,
      key: "toolbarPanel",
      align: "left",
      statusPanelParams: {
        options: () => {
          return {
            gridRef: Grid1Ref.value,
            exportConfig: {
              fileName: "mainGridExport",
            },
          };
        },
      },
    },
    // 有虚拟滚动时的配置
    { statusPanel: "agTotalAndFilteredRowCountComponent" },
  ],
});

const Grid1RowData = ref([
  {
    CODE_CLASS: "TE00",
    UNIT: "A001",
    EX_CODE: "0",
    EX_DESC: "模拟电文",
    EX_CODE_M: "0,1",
    PROD_TIME: "20220908232425",
    WEIGHT: 78.9,
    LEVEL: "0",
    REMARK: "11",
    PASS: "0",
    REMARK1: "附件上传",
  },
  {
    CODE_CLASS: "BG01",
    UNIT: "A002",
    EX_CODE: "0",
    EX_DESC: "模拟电文",
    EX_CODE_M: "0",
    PROD_TIME: "20221008232425",
    WEIGHT: 20,
    LEVEL: "1",
    REMARK: "22",
    PASS: "0",
    REMARK1: "板坯位置",
  },
  {
    CODE_CLASS: "ST88",
    UNIT: "A003",
    EX_CODE: "0",
    EX_DESC: "模拟电文",
    EX_CODE_M: "0",
    PROD_TIME: "20221109383800",
    WEIGHT: 87,
    LEVEL: "0",
    REMARK: "33",
    PASS: "1",
    REMARK1: "业务快捷链接",
  },
  {
    CODE_CLASS: "TE46",
    UNIT: "A004",
    EX_CODE: "0",
    EX_DESC: "模拟电文",
    EX_CODE_M: "0",
    PROD_TIME: "20220607454545",
    WEIGHT: 45,
    LEVEL: "0",
    REMARK: "44",
    PASS: "1",
    REMARK1: "批处理",
  },
]);

const Grid1Api = ref();
const onGrid1Ready = (e: any) => {
  Grid1Api.value = e.api;
  Grid1Api.value.getStatusPanel("toolbarPanel").change(true);
  e.api.setPopupParent(document.querySelector("body")); // 让下拉编辑不会被挡住
};
const onGrid1FirstDataRendered = (e: any) => {
  // 列宽自适应，只会自适应可见区域
  e.columnApi.autoSizeAllColumns();
};
// -------------------------------------

// --------------- 主表 ----------------
const mainGridRef = ref();
const mainGridDefaultColDef = ref({
  sortable: true,
  editable: false,
  filter: "agMultiColumnFilter",
  resizable: true,
});
const mainGridColumnDefs = ref<any>([
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    pinned: "left",
    lockPinned: true,
    editable: false,
    maxWidth: 40,
  },
  {
    field: "ENAME",
    headerName: "工号",
    cellDataType: "text",
  },
  {
    field: "CNAME",
    headerName: "姓名",
    cellDataType: "text",
  },
  {
    field: "SEX",
    headerName: "性别",
    cellEditor: "agRichSelectCellEditor",
    cellEditorParams: {
      values: ["F", "M"],
      allowTyping: true,
      filterList: true,
    },
  },
  {
    field: "DEPTINFO",
    headerName: "部门",
    cellEditorPopup: true,
    valueGetter: (params: any) => {
      if (!params.data.DEPTINFO || !params.data.DEPTINFO.trim()) return "";
      const rowData = selectData.value.filter(
        (item: any) => item.ENAME === params.data.DEPTINFO
      )[0];
      return rowData ? rowData.ENAME + "|" + rowData.CNAME : null;
    },
    cellEditorSelector: (params: any) => {
      return {
        component: multiDropDownEditor,
        params: {
          dropDownParams: {
            columns: selectColumns.value,
            data: selectData.value,
            multiSelect: false,
            valueField: "ENAME",
          },
        },
      };
    },
  },
  {
    field: "SUB_SYSTEM_ENAME",
    headerName: "二级模块",
    cellDataType: "text",
  },
  {
    field: "FORM_NO",
    headerName: "画面名",
    cellDataType: "text",
  },
  {
    field: "SRV_ID",
    headerName: "server号",
    cellDataType: "text",
  },
  {
    field: "REC_CREATOR",
    headerName: "记录创建责任者",
    cellDataType: "text",
    editable: false,
  },
  {
    field: "REC_CREATE_TIME",
    headerName: "记录创建时刻",
    cellDataType: "datetime",
    editable: false,
  },
  {
    field: "REC_REVISOR",
    headerName: "记录修改责任者",
    cellDataType: "text",
    editable: false,
  },
  {
    field: "REC_REVISE_TIME",
    headerName: "记录修改时刻",
    cellDataType: "datetime",
    editable: false,
  },
]);
const mainGridRowData = ref<any>([]);

const mainGridStatusBar = ref({
  statusPanels: [
    {
      statusPanel: agToolbarPanel,
      key: "toolbarPanel",
      align: "left",
      statusPanelParams: {
        options: () => {
          return {
            gridRef: mainGridRef.value,
            exportConfig: {
              fileName: "mainGridExport",
            },
          };
        },
        save: async (e: any) => {
          const outInfo = await saveMainGridData();
          if (outInfo) {
            // 判断后台是否调用成功
            if (outInfo.sys.status < 0) {
              message.error(outInfo.sys.msg);
            } else {
              message.success("主表保存成功");
              // 保存成功后清空grid变更集
              e.done();
              // 主表查询
              queryMainGrid();
            }
          }
        },
      },
    },
    // 有虚拟滚动时的配置
    { statusPanel: "agTotalAndFilteredRowCountComponent" },
  ],
});

const mainGridApi = ref();
const onMainGridReady = (e: any) => {
  mainGridApi.value = e.api;
  e.api.setPopupParent(document.querySelector("body")); // 让下拉编辑不会被挡住
};
const onMainGridFirstDataRendered = (e: any) => {
  // 列宽自适应，只会自适应可见区域
  e.columnApi.autoSizeAllColumns();
};
const onCellFocused = (e: any) => {
  // console.log(e);
  // 获取当前行数据
  const rowNode = e.api.getModel().getRow(e.rowIndex);
  // // 新增行不触发子表查询
  // if (!rowNode.isNew) {
  //   querySubGrid(rowNode.data);
  // }
  // 维护状态下不触发子表查询
  if (!mainGridDefaultColDef.value.editable) {
    querySubGrid(rowNode.data);
  }
};
// -------------------------------------

// --------------- 子表 ----------------
const subGridRef = ref();
const subGridDefaultColDef = ref({
  sortable: true,
  editable: false,
  filter: "agMultiColumnFilter",
  resizable: true,
});
const subGridColumnDefs = ref<any>([
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    pinned: "left",
    lockPinned: true,
    editable: false,
    maxWidth: 40,
  },
  {
    field: "ENAME",
    headerName: "部门编号",
    cellDataType: "text",
  },
  {
    field: "CNAME",
    headerName: "部门描述",
    cellDataType: "text",
  },
  {
    field: "FDEPARTMENT",
    headerName: "上级部门描述",
    cellDataType: "text",
  },
  {
    field: "DEPT_ADMIN1",
    headerName: "部门管理员1工号",
    cellDataType: "text",
  },
  {
    field: "DEPT_ADMIN2",
    headerName: "部门管理员2工号",
    cellDataType: "text",
  },
]);
const subGridRowData = ref<any>([]);

const subGridStatusBar = ref({
  statusPanels: [
    {
      statusPanel: agToolbarPanel,
      key: "toolbarPanel",
      align: "left",
      statusPanelParams: {
        options: () => {
          return {
            gridRef: subGridRef.value,
            exportConfig: {
              fileName: "subGridExport",
            },
          };
        },
      },
    },
    // 有虚拟滚动时的配置
    { statusPanel: "agTotalAndFilteredRowCountComponent" },
  ],
});

const subGridApi = ref();
const onSubGridReady = (e: any) => {
  subGridApi.value = e.api;
};
const onSubGridFirstDataRendered = (e: any) => {
  // 列宽自适应，只会自适应可见区域
  e.columnApi.autoSizeAllColumns();
};
// -------------------------------------

// --------------- 弹出框 ----------------
const closeEfDialogForm = () => {
  // 向父画面发送消息，让其关闭弹框
  EFDialogFormMessage.post("msg001", {
    message: "这是来自DEMOXPX的消息，请求关闭弹框",
    close: true,
  });
};
// -------------------------------------

// 主表查询
const queryMainGrid = async () => {
  const eiInfo = new EI.EIInfo();
  const eiblock = eiInfo.addBlock(new EI.EiBlock(), "Table0");
  eiblock.pushData(
    [
      {
        REC_ID: "",
        REC_CREATOR: "",
        REC_CREATE_TIME: "",
        REC_REVISOR: "",
        REC_REVISE_TIME: "",
        ARCHIVE_FLAG: "",
        ENAME: input1.value, // 查询条件
        CNAME: "",
        SEX: "",
        DEPTINFO: select1.value, // 查询条件
        SUB_SYSTEM_ENAME: "",
        FORM_NO: "",
        SRV_ID: "",
      },
    ],
    true
  );
  await EIManager.callService(formPartition.value, "demo01_inq", eiInfo)
    .then((res) => {
      console.log(res);
      if (res.status === 0) {
        message.success("主表查询成功");
        mainGridRowData.value = res.getBlock("DEMO01").data;
        // mainGridApi.value.setRowData(res.getBlock("DEMO01").data);
        if (mainGridRowData.value.length > 0) {
          mainGridApi.value.setFocusedCell(0, "ENAME");
        }
      } else {
        message.error(res.msg);
      }
    })
    .catch((err) => {
      message.error("err:" + err);
    });
};

// 保存主表的数据更改
const saveMainGridData = async () => {
  // 判断是否有变更
  if (mainGridApi.value.getStatusPanel("toolbarPanel").hasChanges()) {
    // 获取变更集
    const mainGridChangedData = mainGridApi.value
      .getStatusPanel("toolbarPanel")
      .getChangedData().modifiedData;
    const eiInfo = new EI.EIInfo();
    const eiblock_INS = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_INS");
    eiblock_INS.pushData(mainGridChangedData.createdData, true);
    const eiblock_UPD = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_UPD");
    eiblock_UPD.pushData(mainGridChangedData.updatedData, true);
    const eiblock_DEL = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_DEL");
    eiblock_DEL.pushData(mainGridChangedData.deleteData, true);

    const outInfo = await EIManager.callService(
      formPartition.value,
      "demo01_do",
      eiInfo
    );
    // console.log(outInfo);
    return outInfo;
  } else {
    message.warning("暂无变更的数据需要保存");
    return false;
  }
};

// 子表查询
const querySubGrid = async (data: any) => {
  const eiInfo = new EI.EIInfo();
  const eiblock = eiInfo.addBlock(new EI.EiBlock(), "Table0");
  eiblock.pushData(
    [
      {
        DEPTINFO: data.DEPTINFO ? data.DEPTINFO : "",
      },
    ],
    true
  );
  await EIManager.callService(formPartition.value, "demo02_inq", eiInfo)
    .then((res) => {
      // console.log(res);
      if (res.status === 0) {
        message.success("子表查询成功");
        subGridRowData.value = res.getBlock("DEMO02").data;
        // subGridApi.value.setRowData(subGridRowData.value);
      } else {
        message.error(res.msg);
      }
    })
    .catch((err) => {
      message.error(err);
    });
};

// --------------- 授权按钮事件 -----------------
const f2Do = (e: any) => {
  // console.log("F2", e);
  queryMainGrid();
};

const f3PreDo = (e: any) => {
  mainGridDefaultColDef.value.editable = true;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(true);
};
const f3Do = async (e: any) => {
  const outInfo = await saveMainGridData();
  if (outInfo) {
    // 判断后台是否调用成功, 调用失败则多步按钮保持状态
    if (outInfo.sys.status < 0) {
      message.error(outInfo.sys.msg);
      return false;
    } else {
      message.success("主表保存成功");
      // 保存成功后清空grid变更集
      mainGridApi.value.getStatusPanel("toolbarPanel").clearChanges();
      // 将grid变为不可编辑
      mainGridDefaultColDef.value.editable = false;
      mainGridApi.value.getStatusPanel("toolbarPanel").change(false);
      // 主表查询
      queryMainGrid();
    }
  } else {
    // 无变更时, 多步按钮保持状态
    return false;
  }
};
const f3Cancel = (e: any) => {
  mainGridDefaultColDef.value.editable = false;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(false);
  mainGridApi.value.setRowData(mainGridRowData.value);
};
// ---------------------------------------------
</script>

<style lang="scss" scoped></style>
