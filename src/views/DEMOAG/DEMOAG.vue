<!--
 * @Description:
 * @Author: zhangTing
 * @Date: 2023-11-15 14:06:36
 * @LastEditors: zhangTing
 * @LastEditTime: 2024-02-22 10:55:01
-->
<template>
  <xr-ef-form
    :f2-do="f2Do"
    :f3-pre-do="f3PreDo"
    :f3-do="f3Do"
    :f3-cancel="f3Cancel"
    :in-dialog-form-name="props.openInDialog ? 'DEMOAG' : undefined"
    :class="isRTL() ? 'DEMOAG_rtl' : 'DEMOAG_default'"
    @ready="efFormReady"
    @closeDialog="closeDialog"
  >
    <xr-ef-search-box ref="searchBox" :title="$t('DEMOAG.searchBox.title')">
      <template #customButtonSlot>
        {{ getLocale() }}
        <button
          class="xr-ef-button addButton"
          @click="customAdd"
          ref="addButton"
        >
          {{ $t("DEMOAG.addButton.content") }}
        </button>
        <button class="xr-ef-button" ref="modifyButton" @click="customUpdate">
          {{ $t("DEMOAG.modifyButton.content") }}
        </button>
        <button class="xr-ef-button" ref="deleteButton" @click="customDelete">
          {{ $t("DEMOAG.deleteButton.content") }}
        </button>
      </template>
      <template #contentSlot>
        <!-- :labelCol="{style: {width: getLocale() === 'en' ? '100px' : '60px'}}"  -->
        <a-form
          ref="searchForm"
          :model="queryCondition"
          name="basic"
          autocomplete="off"
          layout="inline"
          :colon="false"
          :labelCol="{ style: { width: $t('DEMOAG.searchForm.labelCol') } }"
          :wrapperCol="{ style: { width: '200px' } }"
        >
          <a-row :gutter="[5, 5]">
            <!-- 分区 -->
            <a-col>
              <a-form-item
                ref="partitionFormItem"
                :label="$t('DEMOAG.partitionFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.partName"
                  :options="partNameOptions"
                  :columns="partNameColumns"
                  :data="partNameData"
                  @change="xrEfSelectChange"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 代码编号 -->
            <a-col>
              <a-form-item
                ref="codeClassFormItem"
                :label="$t('DEMOAG.codeClassFormItem.label')"
              >
                <a-input v-model:value="queryCondition.codeClass" />
              </a-form-item>
            </a-col>
            <!-- 代码名称 -->
            <a-col>
              <a-form-item
                ref="codeNameFormItem"
                :label="$t('DEMOAG.codeNameFormItem.label')"
              >
                <a-input v-model:value="queryCondition.codeName" />
              </a-form-item>
            </a-col>
            <!-- 机组 -->
            <a-col>
              <a-form-item
                ref="unitFormItem"
                :label="$t('DEMOAG.unitFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.unitCode"
                  :options="commonSelectOptions"
                  :columns="commonSelectColumns"
                  :data="unitData"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 生产时间 -->
            <a-col>
              <a-form-item
                ref="proTimeFormItem"
                :label="$t('DEMOAG.proTimeFormItem.label')"
              >
                <a-date-picker
                  v-model="queryCondition.productionTime"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <!-- 等级 -->
            <a-col>
              <a-form-item
                ref="levelFormItem"
                :label="$t('DEMOAG.levelFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.level"
                  :options="commonSelectOptions"
                  :columns="commonSelectColumns"
                  :data="levelData"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 重量 -->
            <a-col>
              <a-form-item
                ref="weightFormItem"
                :label="$t('DEMOAG.weightFormItem.label')"
              >
                <a-input v-model:value="queryCondition.weight" />
              </a-form-item>
            </a-col>
            <!-- 是否通过 -->
            <a-col>
              <a-form-item
                ref="passFormItem"
                :label="$t('DEMOAG.passFormItem.label')"
              >
                <!-- <xr-ef-range-number-input v-model:value="numberRange"
                @change="numberRangeChange">
              </xr-ef-range-number-input> -->
                <!-- <a-input-number :decimalSeparator="null"  /> -->
                <!-- <a-input type="number" v-model:value="numbertest" @change="numberChange"/> -->
                <!-- <xr-ef-select
                v-model="queryCondition.pass"
                :options="commonSelectOptions"
                :columns="commonSelectColumns"
                :data="passData"
              ></xr-ef-select> -->
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </template>
    </xr-ef-search-box>
    <xr-ef-search-box ref="searchBox" :title="$t('DEMOAG.searchBox.title')">
      <template #contentSlot>
        <!-- :labelCol="{style: {width: getLocale() === 'en' ? '100px' : '60px'}}"  -->
        <a-form
          ref="searchForm"
          :model="queryCondition"
          name="basic"
          autocomplete="off"
          :colon="false"
          :labelCol="{ style: { width: $t('DEMOAG.searchForm.labelCol') } }"
        >
          <a-row :wrap="true" :gutter="[5, 5]">
            <!-- 分区 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="partitionFormItem"
                :label="$t('DEMOAG.partitionFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.partName"
                  :options="partNameOptions"
                  :columns="partNameColumns"
                  :data="partNameData"
                  @change="xrEfSelectChange"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 代码编号 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="codeClassFormItem"
                :label="$t('DEMOAG.codeClassFormItem.label')"
              >
                <a-input v-model:value="queryCondition.codeClass" />
              </a-form-item>
            </a-col>
            <!-- 代码名称 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="codeNameFormItem"
                :label="$t('DEMOAG.codeNameFormItem.label')"
              >
                <a-input v-model:value="queryCondition.codeName" />
              </a-form-item>
            </a-col>
            <!-- 机组 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="unitFormItem"
                :label="$t('DEMOAG.unitFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.unitCode"
                  :options="commonSelectOptions"
                  :columns="commonSelectColumns"
                  :data="unitData"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 生产时间 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="proTimeFormItem"
                :label="$t('DEMOAG.proTimeFormItem.label')"
              >
                <a-date-picker
                  v-model:value="queryCondition.productionTime"
                  :show-time="{ format: 'HH:mm:ss' }"
                  format="ll"
                  valueFormat="LLL"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <!-- 等级 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="levelFormItem"
                :label="$t('DEMOAG.levelFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.level"
                  :options="commonSelectOptions"
                  :columns="commonSelectColumns"
                  :data="levelData"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
            <!-- 重量 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="weightFormItem"
                :label="$t('DEMOAG.weightFormItem.label')"
              >
                <a-input v-model:value="queryCondition.weight" />
              </a-form-item>
            </a-col>
            <!-- 是否通过 -->
            <a-col :span="getLocale() === 'en' ? 8 : 6">
              <a-form-item
                ref="passFormItem"
                :label="$t('DEMOAG.passFormItem.label')"
              >
                <xr-ef-select
                  v-model="queryCondition.pass"
                  :options="commonSelectOptions"
                  :columns="commonSelectColumns"
                  :data="passData"
                ></xr-ef-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </template>
    </xr-ef-search-box>
    <v-splitter horizontal style="height: 100%" class="default-theme">
      <v-splitter-pane
        ref="splitterPane1"
        :size="$t('DEMOAG.splitterPane1.size')"
      >
        <xr-ef-panel
          ref="mainEfPanel"
          :title="$t('DEMOAG.mainEfPanel.title')"
          style="height: 100%"
          padding="0 5px 0 5px"
        >
          <template #contentSlot>
            <ag-grid-vue
              id="DEMOAG_MAINGRID"
              v-if="efFormIsReady"
              ref="mainGridRef"
              style="width: 100%; height: 100%"
              class="ag-theme-balham"
              :enableRtl="isRTL()"
              :singleClickEdit="true"
              :rowData="mainGridRowData"
              :columnDefs="mainGridColumnDefs"
              :defaultColDef="mainGridDefaultColDef"
              :localeText="agLocaleText"
              :statusBar="mainGridStatusBar"
              rowSelection="multiple"
              groupDisplayType="groupRows"
              rowGroupPanelShow="always"
              :stopEditingWhenCellsLoseFocus="true"
              :checkboxSelection="true"
              :suppressRowClickSelection="true"
              @grid-ready="onMainGridReady"
              @first-data-rendered="onFirstDataRendered"
              @cell-focused="onCellFocused"
            ></ag-grid-vue>
          </template>
        </xr-ef-panel>
      </v-splitter-pane>
      <v-splitter-pane
        ref="splitterPane2"
        :size="$t('DEMOAG.splitterPane2.size')"
      >
        <xr-ef-panel
          ref="subEfPanel"
          :title="$t('DEMOAG.subEfPanel.title')"
          style="height: 100%"
          padding="0 5px 5px 5px"
        >
          <template #contentSlot>
            <ag-grid-vue
              v-if="efFormIsReady"
              ref="subGridRef"
              style="width: 100%; height: 100%"
              class="ag-theme-balham"
              :enableRtl="isRTL()"
              :singleClickEdit="true"
              :rowData="subGridRowData"
              :columnDefs="subGridColumnDefs"
              :defaultColDef="subGridDefaultColDef"
              :localeText="agLocaleText"
              :statusBar="subGridStatusBar"
              rowSelection="multiple"
              :checkboxSelection="true"
              :suppressRowClickSelection="true"
              @grid-ready="onSubGridReady"
              @first-data-rendered="onSubGridFirstDataRendered"
            ></ag-grid-vue>
          </template>
        </xr-ef-panel>
      </v-splitter-pane>
    </v-splitter>
  </xr-ef-form>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import AG_GRID_LOCALE_ZH from "EFX/ag-i18n-cn";
import EFUtility from "EFX/EFUtility";
// import agToolbarPanel from '@/components/ag-grid-components/toolbarPanel.vue';
import agToolbarPanel from "EFX/agToolbarPanel";
import multiDropDownEditor from "EFX/agMultiDropDownEditor";
import dateEditor from "EFX/agDateEditor";
import xrEfSelect from "EFX/xrEfSelect";
import { getLocale, getAgLocaleText, isRTL } from "EFX/locale";
import useI18n from "EFX/useI18n";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const agLocaleText = getAgLocaleText();
const { $t } = useI18n();

defineOptions({
  name: "DEMOAG",
});

const props = defineProps<{
  openInDialog: boolean;
  parentInfo: string;
}>();

const emit = defineEmits(["getChildInfo"]);

const closeDialog = () => {
  emit("getChildInfo", { msg: "我是DEMO03画面的信息" });
};

const partNameColumns = ref<any>([
  {
    headerName: $t("partition"),
    field: "PART_NAME",
  },
  {
    headerName: $t("partitionDes"),
    field: "PART_DESC",
  },
]);

const partNameData = ref<any>([
  {
    PART_NAME: "IPLAT4C",
    PART_DESC: $t("partition4C"),
  },
  {
    PART_NAME: "IPLAT4J",
    PART_DESC: $t("partition4J"),
  },
]);

const partNameOptions = ref<any>({
  // mode: "multiple", // 'multiple' | 'tags' | 'combobox'
  multiple: true,
  valueField: "PART_NAME",
  textField: "PART_DESC",
});

const commonSelectColumns = ref<any>([
  { headerName: $t("code"), field: "CODE" },
  { headerName: $t("desc"), field: "DESC" },
]);
const commonSelectOptions = ref<any>({
  valueField: "CODE",
  textField: "DESC",
});
const levelData = [
  { CODE: "0", DESC: "等级0" },
  { CODE: "1", DESC: "等级1" },
  { CODE: "2", DESC: "等级2" },
];
const passData = [
  { CODE: "0", DESC: $t("no") },
  { CODE: "1", DESC: $t("yes") },
];
const unitData = [
  { CODE: "A001", DESC: "机组A001" },
  { CODE: "A002", DESC: "机组A002" },
  { CODE: "A003", DESC: "机组A003" },
  { CODE: "A004", DESC: "机组A004" },
];
const queryCondition = ref({
  partName: [],
  unitCode: "",
  codeName: "",
  productionTime: "20231012203040",
  level: "",
  pass: "",
  weight: "",
  codeClass: "",
});

const xrEfSelectChange = (e: any) => {
  console.log("🚀 ~ xrEfSelectChange", e);
};

// 画面配置信息
const efFormInfo = ref<{ [key: string]: any }>();
// xr-ef-form是否加载完成
const efFormIsReady = ref(false);
const f2Do = () => {
  console.log("queryCondition", queryCondition.value);
};
const f3PreDo = () => {
  mainGridDefaultColDef.value.editable = true;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(true);

  subGridDefaultColDef.value.editable = true;
  subGridApi.value.getStatusPanel("toolbarPanel").change(true);
};
const f3Do = () => {
  const mainGridToolbarPanel = mainGridApi.value.getStatusPanel("toolbarPanel");
  const hasChanges = mainGridToolbarPanel.hasChanges();
  console.log("hasChanges", hasChanges);
  if (!hasChanges) {
    message.warning("暂无变更的数据需要保存");
    console.log("getChangedData", mainGridToolbarPanel.getChangedData());
    return false;
  }
  console.log("getChangedData", mainGridToolbarPanel.getChangedData());
  // 保存
  mainGridToolbarPanel.saveChangedData((e: any) => {
    console.log("f3do-changeData", e.changedData);
    e.done();
  });
  mainGridDefaultColDef.value.editable = false;
  mainGridToolbarPanel.change(false);
  subGridDefaultColDef.value.editable = false;
  subGridApi.value.getStatusPanel("toolbarPanel").change(false);
};
const f3Cancel = () => {
  mainGridDefaultColDef.value.editable = false;
  mainGridApi.value.getStatusPanel("toolbarPanel").change(false);
};
// xr-ef-form完成初始化事件
const efFormReady = (e: any) => {
  // console.log("efFormReady", e);
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  console.log(props.parentInfo);
};
const onCellFocused = (params: any) => {
  // console.log("onCellFocused", params);
  if (!focusRowNode.value || focusRowNode.value.rowIndex !== params.rowIndex) {
    const rowNode = params.api.getModel().getRow(params.rowIndex);
    focusRowNode.value = rowNode;
    if (focusRowNode.value.data && !mainGridDefaultColDef.value.editable) {
      getSubGrid(focusRowNode.value.data);
    }
  }

  // 设置某个字段可新增，不可修改
  if (mainGridDefaultColDef.value.editable) {
    const rowNode = params.api.getModel().getRow(params.rowIndex);
    const index = mainGridColumnDefs.value.findIndex(
      (item) => item.field === "CODE_CLASS"
    );
    if (index !== -1) {
      mainGridColumnDefs.value[index].editable = !!rowNode.isNew;
    }
  }
};

const getSubGrid = (row: any) => {
  const subData = [
    {
      CODE: "123453234",
      UNIT: "A001",
      PROD_TIME: "20220908232425",
      WEIGHT: 78.9,
      LEVEL: "0",
      REMARK: "11",
      PASS: "0",
      REMARK1: "附件上传",
      REMARK2: "业务快捷链接",
      REMARK3: "节点实例状态",
      REMARK4: "非授权按钮",
    },
    {
      CODE: "885959494",
      UNIT: "A002",
      PROD_TIME: "20221008232425",
      WEIGHT: 20,
      LEVEL: "1",
      REMARK: "22",
      PASS: "0",
      REMARK1: "板坯位置",
      REMARK2: "打印备注",
      REMARK3: "缺陷位置",
      REMARK4: "取样标记",
    },
    {
      CODE: "483948393",
      UNIT: "A003",
      PROD_TIME: "20221109383800",
      WEIGHT: 87,
      LEVEL: "0",
      REMARK: "33",
      PASS: "1",
      REMARK1: "劳动力",
      REMARK2: "思考思考",
      REMARK3: "的力量大",
      REMARK4: "其他资源",
    },
    {
      CODE: "394859544",
      UNIT: "A004",
      PROD_TIME: "20220607454545",
      WEIGHT: 45,
      LEVEL: "0",
      REMARK: "44",
      PASS: "1",
      REMARK1: "批处理",
      REMARK2: "业务代码",
      REMARK3: "进度跟踪",
      REMARK4: "日志",
    },
  ];
  subGridRowData.value = subData.map((item) => {
    return {
      ...item,
      CODE_CLASS: row.CODE_CLASS,
      CODE: row.CODE_CLASS + "_" + item.CODE,
    };
  });
};

const codeClassValue = ref();
const getCodeClass = () => {
  EFUtility.getCodeClassValue("IPLAT4C", ["EX11"]).then((res) => {
    // console.log(res);
    codeClassValue.value = res.blocks["EX11"];
  });
};
// const mainGridRowData = ref([]);
const mainGridRowData = ref([
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
    REMARK2: "业务快捷链接",
    REMARK3: "节点实例状态",
    REMARK4: "非授权按钮",
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
    REMARK2: "打印备注",
    REMARK3: "缺陷位置",
    REMARK4: "取样标记",
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
    REMARK1: "劳动力",
    REMARK2: "思考思考",
    REMARK3: "的力量大",
    REMARK4: "其他资源",
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
    REMARK2: "业务代码",
    REMARK3: "进度跟踪",
    REMARK4: "日志",
  },
]);

const mainGridColumnDefs = ref([
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    pinned: isRTL() ? "right" : "left",
    lockPinned: true,
    editable: false,
    maxWidth: 40,
  },
  {
    field: "CODE_CLASS",
    headerName: $t("hCodeClass"),
    pinned: isRTL() ? "right" : "left",
    lockPinned: true,
    enableRowGroup: true,
    cellEditorParams: { maxLength: 20 },
  },
  {
    field: "UNIT",
    headerName: $t("hUnit"),
    enableRowGroup: true,
    cellEditorPopup: true,
    cellRenderer: undefined,
    refData: undefined,
    // cellRenderer: (params: any) => {
    //   // if (!params.data.UNIT) return "";
    //   const rowData = unitData.filter(
    //     (item: any) => item.code === params.value
    //   )[0];
    //   return rowData.code + '|' + rowData.desc;
    // },
    // refData: {A001: '机组A001', A002: '机组A002', A003: '机组A003', A004: '机组A004'},
    valueGetter: (params: any) => {
      if (!params.data.UNIT) return "";
      const rowData = unitData.filter(
        (item: any) => item.CODE === params.data.UNIT
      )[0];
      return rowData.CODE + "|" + rowData.DESC;
    },
    cellEditorSelector: (params: any) => {
      return {
        component: multiDropDownEditor,
        params: {
          dropDownParams: {
            columns: [
              { field: "CODE", headerName: "代码" },
              { field: "DESC", headerName: "描述" },
            ],
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
    headerName: $t("hExCode"),
    cellEditorPopup: true,
    // valueFormatter: (params: any) => {
    //   if (!params.value) return "";
    //   const rowData = codeClassValue.value.data.filter(
    //     (item: any) => item.CODE === params.value
    //   )[0];
    //   return rowData.CODE_DESC_1_CONTENT;
    // },
    cellEditorSelector: (params: any) => {
      const data = codeClassValue.value.data;
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
    headerName: $t("hExDesc"),
    cellDataType: "text",
  },
  {
    field: "EX_CODE_M",
    headerName: $t("hExCodeM"),
    cellEditorPopup: true,
    cellEditorPopupPosition: "under",
    cellEditorSelector: (params: any) => {
      const data = codeClassValue.value.data;
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
    headerName: $t("hProdTime"),
    enableRowGroup: true,
    cellEditor: dateEditor,
    valueGetter: (params: any) => {
      if (params.data.PROD_TIME) {
        const PROD_TIME = dayjs(params.data.PROD_TIME, "LLL");
        // return PROD_TIME.format('YYYY-MM-DD HH:mm:ss');
        return PROD_TIME.format("LL");
      } else {
        return dayjs().format("LL");
      }
    },
  },
]);

const mainGridRef = ref();
const focusRowNode = ref();
const editButtons = ref<any[]>([]);
const mainGridStatusBar = ref({
  statusPanels: [
    {
      statusPanel: agToolbarPanel,
      key: "toolbarPanel",
      align: "left",
      statusPanelParams: {
        // defaultButtons: ['export'],
        // 1.控制已有按钮显示隐藏 2.自定义已有按钮的事件 3.增加按钮
        // queryButtons: [
        //   'import',
        //   {
        //     name: 'export',
        //     click: () => {

        //     }
        //   }
        // ],
        // editButtons: ['add', 'copyAdd', 'save'],
        // editButtons: editButtons.value,
        options: () => {
          return {
            gridRef: mainGridRef.value,
            // exportData: mainGridRowData.value,
            exportConfig: {
              fileName: "mainGridExport",
            },
          };
        },
        save: (e: any) => {
          console.log("save-changedData", e.changedData);
          e.done();
        },
      },
    },
    // 有虚拟滚动时的配置
    { statusPanel: "agTotalAndFilteredRowCountComponent" },
  ],
});

// 单独新增操作
const customAdd = () => {
  if (!mainGridDefaultColDef.value.editable) {
    message.warning($t("toMaintain"));
    return false;
  }
  const toolbarPanel = mainGridApi.value.getStatusPanel("toolbarPanel");
  toolbarPanel.setEditButtons(["add"]);
};

// 单独修改操作
const customUpdate = () => {
  if (!mainGridDefaultColDef.value.editable) {
    message.warning($t("toMaintain"));
    return false;
  }
  const toolbarPanel = mainGridApi.value.getStatusPanel("toolbarPanel");
  toolbarPanel.setEditButtons(["save"]);

  // const newData = [{
  //   CODE_CLASS: "TE00",
  //   EX_CODE: "0",
  //   EX_CODE_M: "0,1",
  //   EX_DESC: "模拟电文111",
  //   LEVEL: "0",
  //   PASS: "0",
  //   PROD_TIME: "20220908232425",
  //   REMARK: "11",
  //   REMARK1: "附件上传",
  //   REMARK2: "业务快捷链接",
  //   REMARK3: "节点实例状态",
  //   REMARK4: "非授权按钮",
  //   UNIT: "A001",
  //   WEIGHT: 78.9
  // }];
  // mainGridApi.value.forEachNode(function(rowNode: any, index: any) {
  //   if (index === 0) {
  //     toolbarPanel.updateRow(rowNode, newData[0]);
  //   }
  // });
};

// 单独删除操作
const customDelete = () => {
  if (!mainGridDefaultColDef.value.editable) {
    message.warning($t("toMaintain"));
    return false;
  }
  const toolbarPanel = mainGridApi.value.getStatusPanel("toolbarPanel");
  toolbarPanel.setEditButtons(["delete", "save"]);
};

const mainGridApi = ref();
const onMainGridReady = (params: any) => {
  mainGridApi.value = params.api;
  params.api.setPopupParent(document.querySelector("body"));
  params.api.setFocusedCell(0, "CODE_CLASS");
};
const onFirstDataRendered = (params: any) => {
  // 只会自适应可见区域
  params.columnApi.autoSizeAllColumns();
  // params.columnApi.sizeColumnsToFit();
};

const mainGridDefaultColDef = ref({
  sortable: true,
  editable: false,
  filter: "agMultiColumnFilter",
  // filterParams: {
  //   filters: [
  //     {
  //       filter: "agDateColumnFilter", // agTextColumnFilter、agDateColumnFilteragNumberColumnFilter
  //       filterParams: { defaultOption: "startsWith" },
  //     },
  //     { filter: "agSetColumnFilter" },
  //   ],
  // },
  resizable: true,
});

const subGridRowData = ref<any[]>([]);
const subGridDefaultColDef = ref({
  sortable: true,
  editable: false,
  filter: "agMultiColumnFilter",
  // filterParams: {
  //   filters: [
  //     {
  //       filter: "agDateColumnFilter", // agTextColumnFilter、agDateColumnFilteragNumberColumnFilter
  //       filterParams: { defaultOption: "startsWith" },
  //     },
  //     { filter: "agSetColumnFilter" },
  //   ],
  // },
  resizable: true,
});
const subGridColumnDefs = ref([
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    pinned: isRTL() ? "right" : "left",
    lockPinned: true,
    editable: false,
    maxWidth: 40,
  },
  {
    field: "CODE_CLASS",
    headerName: $t("codeClass"),
    pinned: isRTL() ? "right" : "left",
    lockPinned: true,
    enableRowGroup: true,
  },
  {
    field: "CODE",
    headerName: $t("code"),
    enableRowGroup: true,
  },
  {
    field: "UNIT",
    headerName: $t("unit"),
    enableRowGroup: true,
  },
  {
    field: "PROD_TIME",
    headerName: $t("prodTime"),
    enableRowGroup: true,
  },
  {
    field: "WEIGHT",
    headerName: $t("weight"),
    cellDataType: "number",
    enableRowGroup: true,
  },
  {
    field: "LEVEL",
    headerName: $t("level"),
    enableRowGroup: true,
  },
  {
    field: "REMARK",
    headerName: $t("remark"),
    enableRowGroup: true,
  },
  {
    field: "PASS",
    headerName: $t("pass"),
    enableRowGroup: true,
  },
  {
    field: "REMARK1",
    headerName: $t("remark1"),
  },
  {
    field: "REMARK2",
    headerName: $t("remark2"),
  },
  {
    field: "REMARK3",
    headerName: $t("remark3"),
  },
  {
    field: "REMARK4",
    headerName: $t("remark4"),
  },
]);

const subGridStatusBar = ref({
  statusPanels: [
    {
      statusPanel: agToolbarPanel,
      key: "toolbarPanel",
      align: "left",
      statusPanelParams: {
        setAddDefault: () => {
          return {
            CODE_CLASS: focusRowNode.value?.data.CODE_CLASS,
          };
        },
        // addRow: () => {
        //   return {
        //     CODE_CLASS: focusRowNode.value?.data.CODE_CLASS,
        //   }
        // },
        save: (data: any) => {
          // console.log("changedData", data);
        },
        exportExcel: () => {
          // console.log('exportExcel');
        },
        importExcel: () => {},
      },
    },
    // 有虚拟滚动时的配置
    { statusPanel: "agTotalAndFilteredRowCountComponent" },
  ],
});

const subGridApi = ref();
const onSubGridReady = (params: any) => {
  subGridApi.value = params.api;
  params.api.setFocusedCell(0, "CODE_CLASS");
};
const onSubGridFirstDataRendered = (params: any) => {
  // 只会自适应可见区域
  params.columnApi.autoSizeAllColumns();
  // params.columnApi.sizeColumnsToFit();
};
onBeforeMount(() => {
  getCodeClass();
});
</script>

<style lang="scss">
.DEMOAG_rtl {
}
.DEMOAG_default {
}
.DEMOAG_zh {
  .addButton {
    background: #e45959;
    border-color: #e45959;
  }
}
.DEMOAG_en {
  .addButton {
    background: #1da47d;
    border-color: #1da47d;
  }
}
.DEMOAG_ar {
  .addButton {
    background: #bc0e5f;
    border-color: #bc0e5f;
  }
}
</style>
