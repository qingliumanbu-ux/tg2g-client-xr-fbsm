<template>
  <xr-ef-form
    ref="xrEfFormRef"
    @ready="efFormReady"
    :f2-do="f2Do"
    :f3-pre-do="f3PreDo"
    :f3-do="f3Do"
    :f3-cancel="f3Cancel"
  >
    <xr-ef-search-box title="查询条件">
      <template #customButtonSlot>
        <a-button @click="openDialogA">弹出框A</a-button>
        <a-button @click="openDialogDEMOAG">弹出同模块画面DEMOAG</a-button>
        <a-button @click="openDialogDEMOXPX">弹出非同模块画面DEMOXPX</a-button>
        <a-button @click="callFormDEMOXPX">跳转到画面DEMOXPX</a-button>
      </template>
      <template #contentSlot>
        <div style="display: flex">
          <div style="width: 300px; margin-right: 20px">
            <a-form-item label="部门(下拉框)">
              <xr-ef-select
                v-model="select1"
                :columns="selectColumns"
                :data="selectData"
                :options="selectOptions"
              ></xr-ef-select
            ></a-form-item>
          </div>
          <div style="width: 300px; margin-right: 20px">
            <a-form-item label="工号(输入框)">
              <a-input v-model:value="input1"></a-input>
            </a-form-item>
          </div>
        </div>
      </template>
    </xr-ef-search-box>

    <v-splitter class="default-theme" :horizontal="true" style="flex: 1">
      <v-splitter-pane size="50%">
        <xr-ef-panel title="主表" style="height: 100%">
          <template #customButtonSlot> </template>
          <template #contentSlot>
            <ag-grid-vue
              style="width: 100%; height: 100%"
              class="ag-theme-balham"
              ref="mainGridRef"
              :rowData="mainGridRowData"
              :columnDefs="mainGridColumnDefs"
              :defaultColDef="mainGridDefaultColDef"
              :statusBar="mainGridStatusBar"
              :localeText="agLocaleText"
              :singleClickEdit="true"
              rowSelection="multiple"
              :stopEditingWhenCellsLoseFocus="true"
              :checkboxSelection="true"
              :suppressRowClickSelection="true"
              @grid-ready="onMainGridReady"
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
              :rowData="subGridRowData"
              :columnDefs="subGridColumnDefs"
              :defaultColDef="subGridDefaultColDef"
              :statusBar="subGridStatusBar"
              :localeText="agLocaleText"
              :singleClickEdit="true"
              rowSelection="multiple"
              :stopEditingWhenCellsLoseFocus="true"
              :checkboxSelection="true"
              :suppressRowClickSelection="true"
              @grid-ready="onSubGridReady"
            ></ag-grid-vue>
          </template>
        </xr-ef-panel>
      </v-splitter-pane>
    </v-splitter>
  </xr-ef-form>

  <xr-ef-dialog
    v-model:visible="dialogVisible1"
    width="800px"
    height="500px"
    title="弹框A"
    :defaultFooter="true"
  >
    <div>你好，我是弹框A的内容</div>
  </xr-ef-dialog>

  <xr-ef-dialog
    v-model:visible="dialogVisible2"
    width="80%"
    height="80%"
    title="DEMOAG"
    :parentFormRef="xrEfFormRef"
  >
    <DEMOAG
      :openInDialog="true"
      :parentInfo="parentInfo"
      @getChildInfo="getChildInfo"
    ></DEMOAG>
  </xr-ef-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getAgLocaleText } from "EFX/locale";
import xrEfForm from "EFX/xrEfForm";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSelect from "EFX/xrEfSelect";
import xrEfDialog from "EFX/xrEfDialog";
import DEMOAG from "../DEMOAG/DEMOAG.vue";
import EFDialogForm, { EFDialogFormMessage } from "EFX/EFDialogForm";
import EFCallForm from "EFX/EFCallForm";
import agToolbarPanel from "EFX/agToolbarPanel";
import multiDropDownEditor from "EFX/agMultiDropDownEditor";
import { EI, EIManager } from "EIX/ei";
import { message } from "ant-design-vue";

const agLocaleText = getAgLocaleText();

// 画面配置信息
const efFormInfo = ref<{ [key: string]: any }>();
const formPartition = ref<string>("");
const efFormReady = (e: any) => {
  // 参数e.formInfo为当前画面配置信息
  efFormInfo.value = e.formInfo;
  formPartition.value = e.formInfo.formPartition;
  // console.log(efFormInfo.value);
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
const onCellFocused = (e: any) => {
  // 获取当前行数据
  const rowNode = e.api.getModel().getRow(e.rowIndex);
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
// -------------------------------------

// --------------- 弹出框 ----------------
const dialogVisible1 = ref(false);
const openDialogA = () => {
  dialogVisible1.value = true;
};

const dialogVisible2 = ref(false);
const parentInfo = ref("我是DEMOPX画面的数据");
const getChildInfo = (info: any) => {
  console.log("获取DEMOAG传递过来的信息", info);
  dialogVisible2.value = false;
};
const openDialogDEMOAG = () => {
  dialogVisible2.value = true;
};

const openDialogDEMOXPX = () => {
  const message = {
    msg: "我来自DEMOPX",
  };
  // 打开弹窗, 并给子画面发送消息
  const dialogForm = EFDialogForm.open("DEMOXPX", xrEfFormRef, message, {
    width: "70%",
    height: "70%",
    modal: true,
    title: "DEMOXPX",
  });
  // 父画面接收子画面的消息
  dialogForm.receive("msg001", (message: any) => {
    // message为接收到的消息
    console.log(message);
    if (message.close) {
      dialogForm.close();
    }
  });
};
// -----------------------------------------

// --------------- 跳转画面 -----------------
const callFormDEMOXPX = () => {
  EFCallForm("DEMOXPX", { msg: "这是来自DEMOPX的消息" });
};
// -----------------------------------------

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
  // 获取变更集
  const mainGridChangedData = mainGridApi.value
    .getStatusPanel("toolbarPanel")
    .getChangedData().modifiedData;
  const eiInfo = new EI.EIInfo();
  const eiblock_INS = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_ADD");
  eiblock_INS.pushData(mainGridChangedData.createdData, true);
  const eiblock_UPD = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_MODIFY");
  eiblock_UPD.pushData(mainGridChangedData.updatedData, true);
  const eiblock_DEL = eiInfo.addBlock(new EI.EiBlock(), "TDEMO01_DELETE");
  eiblock_DEL.pushData(mainGridChangedData.deleteData, true);

  await EIManager.callService(formPartition.value, "demo01_do", eiInfo)
    .then((res) => {
      if (res.status === 0) {
        message.success("主表保存成功");
      } else {
        message.error("err:" + res.msg);
      }
    })
    .catch((err) => {
      message.error("err:" + err);
    });
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
  queryMainGrid();
};
const f3PreDo = (e: any) => {
  // 让主表进入可维护状态
  mainGridDefaultColDef.value.editable = true;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(true);
};
const f3Do = async (e: any) => {
  await saveMainGridData();
  // 保存后清空grid变更集
  mainGridApi.value.getStatusPanel("toolbarPanel").clearChanges();
  // 将主表退出维护状态
  mainGridDefaultColDef.value.editable = false;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(false);
  // 主表查询
  queryMainGrid();
};
const f3Cancel = (e: any) => {
  // 清空grid变更集
  mainGridApi.value.getStatusPanel("toolbarPanel").clearChanges();
  // 让主表退出维护状态
  mainGridDefaultColDef.value.editable = false;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(false);
  // 主表查询
  queryMainGrid();
};
</script>

<style lang="scss" scoped></style>
