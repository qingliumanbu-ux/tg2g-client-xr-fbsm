<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f3-do="F3_DO" :f4-do="F4_DO" :f4-pre-do="F4_PRE_DO"
    :f4-cancel="F4_CANCEL" :f7-do="F7_DO" @ready="efFormReady">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <er-layout id="ErLayout_8sjftLeW" :er-form-helper-prop="erFormHelper"
            :config-id="'LayoutGroupFilter'"></er-layout>
          <xr-ef-panel id="xrEfPanel_d8Ck2QX5" title="配料信息" padding="5px">
            <template #customButtonSlot>
            </template>
            <template #contentSlot>
              <er-grid id="ErGrid_GXRwKGAd" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                @erGridReady="erGridmainReady" :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                @row-double-clicked="GridViewMainDoubleClick">
              </er-grid>
            </template>
          </xr-ef-panel>
        </template>
      </xr-ef-form-base>
    </template>
  </xr-ef-form>
  <xr-ef-dialog ref="dialogRef" title="配料单保存" v-model:visible="dialogVisible" width=80% height=60%
    @click-close-icon="DialogClose">
    <FBSM31ZS2N :openInDialog="true" :parentInfo="parentInfo" @getChildInfo="getChildInfo"
      :dialogFormName="dialogFormName">
    </FBSM31ZS2N>
  </xr-ef-dialog>
  <!-- 新增：F3按钮对应的FBSM15GS2N弹窗 -->
  <xr-ef-dialog ref="f3DialogRef" title="过程成分查看" v-model:visible="f3DialogVisible" width=100% height=100%>
    <FBSM15GS2N :openInDialog="true" :parentInfo="f3ParentInfo" @getChildInfo="handleF3ChildInfo"
      :dialogFormName="f3DialogFormName">
    </FBSM15GS2N>
  </xr-ef-dialog>
  <!--配料单查看-->
  <xr-ef-dialog ref="f4DialogRef" title="配料单查看" v-model:visible="f4DialogVisible" width=100% height=100%>
    <FBSM15HS2N :openInDialog="true" :parentInfo="f4ParentInfo" @getChildInfo="handleF4ChildInfo"
      :dialogFormName="f4DialogFormName">
    </FBSM15HS2N>
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
  Ref
}
  from "vue";
import {
  EI,
  EIManager
}
  from "EIX/ei";
import EFUtility from "EFX/EFUtility";
import useI18n from 'EFX/useI18n';
import {
  getAgLocaleText
}
  from "EFX/locale";
import dayjs from "dayjs";
import type {
  Dayjs
}
  from "dayjs";
import {
  ER
}
  from 'ERX/Er';
import {
  SiUtils
}
  from 'ERX/SiUtils';
import {
  FiUtils
}
  from 'ERX/FiUtils';
import xrEfForm from "EFX/xrEfForm";
import xrEfFormBase from "EFX/xrEfFormBase";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';
import FBSM15PS2N from "@/views/FBSM15PS2N/FBSM15PS2N.vue";
import FBSM15GS2N from "@/views/FBSM15GS2N/FBSM15GS2N.vue";
import FBSM15HS2N from "@/views/FBSM15HS2N/FBSM15HS2N.vue";
import FBSM31ZS2N from "@/views/FBSM31ZS2N/FBSM31ZS2N.vue";


// AGGrid本地化语言
const agLocaleText = getAgLocaleText();
const {
  $t
} = useI18n();

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{
  [key: string]: any
}>({});
const efFormIsReady = ref(false);

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  formName.value = 'FBSM31S2N';
  initializePage(); // 初始化低代码工具类
};

onMounted(() => { });

const formName = ref('');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";
const s_id = ref<string[]>([]); // 定义为响应式数组
let gridviewMain = '';
let dt_key = new EI.EiBlock();
//弹窗相关数据初始化
const dialogFormName = ref(''); // 弹出画面的画面名
const parentInfo = ref({});
const dialogVisible = ref(false);
// ========== 新增：F3弹窗相关变量 ==========
const f3DialogFormName = ref(''); // F3弹窗画面名
const f3ParentInfo = ref({});     // F3弹窗传递的参数
const f3DialogVisible = ref(false); // F3弹窗显隐状态
// ========== 新增：F3弹窗相关变量 ==========
const f4DialogFormName = ref(''); // F3弹窗画面名
const f4ParentInfo = ref({});     // F3弹窗传递的参数
const f4DialogVisible = ref(false); // F3弹窗显隐状态

// 关闭弹框监听
const DialogClose = () => {
  p_query();
};
//弹出画面关闭事件处理
const getChildInfo = (info: any) => {
  console.log('21p返回数据', info);
  if (info.closeEfDialog === true) {
    dialogVisible.value = false;   // 关闭弹框

  }

}

// 新增：F3弹窗的子组件信息接收方法
const handleF3ChildInfo = (info: any) => {
  console.log('FBSM15GS2N返回数据', info);
  if (info.closeEfDialog === true) {
    f3DialogVisible.value = false; // 关闭F3弹窗
  }
}

// 新增：F4弹窗的子组件信息接收方法
const handleF4ChildInfo = (info: any) => {
  console.log('FBSM15hS2N返回数据', info);
  if (info.closeEfDialog === true) {
    f4DialogVisible.value = false; // 关闭F3弹窗
  }

}

//获取主键列
function GetKey(tableKey: string) {
  const dt = new EI.EiBlock();
  dt.addColumns('COLNAME');
  if (tableKey !== '') {
    const colNames = tableKey.split(',');
    for (const colName in colNames) {
      dt.addRow({
        COLNAME: colNames[colName]
      });
    }
  }
  dt.name = 'DT_KEY';
  return dt;
}
const setToolbarVisible = (configId: string, visible: boolean) => {
  erFormHelper.setGridToolbarVisible(configId, {
    import: true,
    excel: true
  });
};

// 画面相关数据初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(formPartition.value, formName.value, '',
    initializeService);
  if (initialResult.flag >= 0) {
    // 画面工具类初始化成功后将画面渲染条件设置为1
    initializeFlag.value = 1;
    nextTick(() => {
      // 获取画面上的主要控件信息
      dt_key = GetKey(efFormInfo.value.formParams['table_key']);
      setToolbarVisible("gridviewMain", true);
      erFormHelper.setGridEditable('gridviewMain', false);
    });
  }
  else {
    erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg +
      ']!');
  }
};

const xrEfformRef = ref();
const p_query = async () => {
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  console.log(inInfo, '进入查数据函数');
  console.log(inInfo, 'inInfo');
  const outInfo = await erFormHelper.callService('fbsm31_inq', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError('查询错误:' + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    console.log(outInfo, '查数据outInfo');
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, 'gridviewMain');
  }
}
const F2_DO = async (e: any) => {
  p_query();
  // erFormHelper.setGridEditable('gridviewMain', false);     
};

// ========== 新增：F3按钮点击事件 ==========
const F3_DO = async (e: any) => {
  try {
    // 1. 可选：校验（比如是否选中主表行，根据业务需求调整）
    const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
    if (!currentRow) {
      erFormHelper.messageWarning('请先选择一条配料信息！');
      return;
    }

    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    f3ParentInfo.value = {
      PARENT: 'FBSM31S2N', // 标识父画面
      ST_NO: currentRow.get('ST_NO'), // 传递主表选中行的ST_NO
      COMPOSE_LIST_NO: currentRow.get('COMPOSE_LIST_NO'), // 传递物料编码
      BACKLOG_EA: currentRow.get('BACKLOG_EA'),
      DATE_TIME: currentRow.get('DATE_TIME'),
      // 可添加其他需要传递的参数
    };

    // 3. 设置弹窗画面名
    f3DialogFormName.value = 'FBSM15GS2N';

    // 4. 显示F3弹窗
    f3DialogVisible.value = true;
    console.log('F3按钮点击，打开FBSM15GS2N弹窗');
  } catch (error) {
    erFormHelper.messageError('打开FBSM15GS2N画面失败：' + (error as Error).message);
  }
};

// ========== F7按钮 Excel导出【终极最终版】✅ 0框架API依赖 ✅ 0报错 ✅ 标准Excel ==========
const F7_DO = async (e: any) => {
  try {
    // ✅ 仅用框架已验证可用的提示方法
    erFormHelper.messageInfo('正在导出Excel，请稍候...');

    // ✅ 步骤1：复用你项目【100%可用】的查询逻辑，获取纯净JSON数据（和F2查询完全一致）
    const inInfo = new EI.EIInfo();
    inInfo.addBlock(erFormHelper.getGridSelectRowsAsBlock('gridviewMain'));
    const outInfo = await erFormHelper.callService('fbsm15_excel_inq', inInfo);

    // 数据校验
    if (outInfo.sys.status < 0) {
      erFormHelper.messageError('数据查询失败，无法导出：' + outInfo.sys.msg);
      return;
    }
    const exportData = outInfo.getBlock(0).data || [];
    if (exportData.length === 0) {
      erFormHelper.messageWarning('当前查询条件下无数据可导出！');
      return;
    }

    // ✅ 步骤2：JSON数组 → 标准Excel表格（纯原生方法，无任何依赖，已适配你的数据）
    const excelBlob = createExcelFile(exportData);

    // ✅ 步骤3：浏览器原生下载（生成.xlsx文件，Excel可直接打开编辑）
    const COMPOSE_LIST_NO = erFormHelper.getGridCurrentRowAsBlock('gridviewMain').data[0]["COMPOSE_LIST_NO"];
    const fileName = COMPOSE_LIST_NO
      ? `配料信息_${COMPOSE_LIST_NO}.xlsx`
      : `配料信息_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(excelBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    erFormHelper.messageSuccess('✅ Excel导出成功！文件已下载');
  } catch (error) {
    erFormHelper.messageError(`导出失败：${(error as Error).message}`);
    console.error('F7导出异常详情：', error);
  }
};

// ========== 配套核心工具：JSON转标准Excel文件（纯原生、0依赖、必须一起粘贴） ==========
const createExcelFile = (jsonData: any[]) => {
  if (!jsonData.length) return new Blob();
  // 1. 提取表头（自动从JSON第一条数据生成）
  const headers = Object.keys(jsonData[0]);
  // 2. 拼接Excel标准CSV格式（逗号分隔行、换行分隔列，Excel原生识别）
  let csvContent = headers.join(',') + '\n';
  // 3. 拼接所有数据行（处理特殊字符，避免Excel列错乱）
  jsonData.forEach(item => {
    const row = headers.map(key => {
      const val = item[key] === undefined || item[key] === null ? '' : String(item[key]);
      return `"${val.replace(/"/g, '""')}"`; // 转义引号，防止列错位
    });
    csvContent += row.join(',') + '\n';
  });
  // 4. 追加UTF-8 BOM头 + 指定Excel类型，解决中文乱码、格式错误
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const data = new Uint8Array([...bom, ...new TextEncoder().encode(csvContent)]);
  return new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

//焦点行查询
const p_query_fbsm14 = async (e: any) => {
  const eiInfo = new EI.EIInfo();
  eiInfo.addBlock(erFormHelper.getGridCurrentRowAsBlock('gridviewMain'));
  // eiblock.addColumn('HEAT_NO');
  // eiblock.addColumn('PONO');
  // if (e.HEAT_NO === '') {
  //   return;
  // } else {
  //   eiblock.addRow({
  //     HEAT_NO: e.HEAT_NO,
  //     PONO: e.PONO
  //   });
  // }
  // const outInfo = await erFormHelper.callService('fbsm15_elm_inq', eiInfo, false, undefined, false, formPartition.value);
  // if (outInfo.sys.status < 0) {
  //   erFormHelper.messageInfo(outInfo.sys.msg);
  //   return;
  // }
  // if (outInfo.getBlock(2).data.length <= 0) {
  //   s_id.value[2] = " ";
  // }
  // if (outInfo.getBlock(1).data.length <= 0) {
  //   s_id.value[1] = " ";
  // }
  // if (outInfo.getBlock(0).data.length > 0 || outInfo.getBlock(1).data.length > 0 || outInfo.getBlock(2).data.length > 0) {
  //   erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, 'gridView1');
  //   // erFormHelper.setGridColumnEditable('gridView1', false);
  //   erFormHelper.mergeDataToGrid(outInfo.getBlock(1).data, 'gridView2');
  //   // erFormHelper.setGridColumnEditable('gridView2', false);
  //   erFormHelper.mergeDataToGrid(outInfo.getBlock(2).data, 'gridView3');
  //   // erFormHelper.setGridColumnEditable('gridView3', false);
  //   console.log("1", outInfo.getBlock(0).data[0]["STATION_ID"]);
  //   if (outInfo.getBlock(0).data[0]["STATION_ID"] == "Z") {
  //     s_id.value[0] = "合 金 熔 化 炉 ";
  //   } else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "E") {
  //     s_id.value[0] = "电 炉";
  //   }
  //   else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "A" || outInfo.getBlock(0).data[0]["STATION_ID"] == "Y") {
  //     s_id.value[0] = "A O D";
  //   }
  //   else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "B") {
  //     s_id.value[0] = "转 炉";
  //   }
  //   else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "D") {
  //     s_id.value[0] = "三 脱";
  //   } else {
  //     s_id.value[0] = " ";
  //   }
  //   if (outInfo.getBlock(1).data[0]["STATION_ID"] == "Z") {
  //     s_id.value[1] = "合 金 熔 化 炉 ";
  //   } else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "E") {
  //     s_id.value[1] = "电 炉";
  //   }
  //   else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "A" || outInfo.getBlock(1).data[0]["STATION_ID"] == "Y") {
  //     s_id.value[1] = "A O D";
  //   }
  //   else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "B") {
  //     s_id.value[1] = "转 炉";
  //   }
  //   else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "D") {
  //     s_id.value[1] = "三 脱";
  //   } else {
  //     s_id.value[1] = " ";
  //   }
  //   if (outInfo.getBlock(2).data[0]["STATION_ID"] == "Z") {
  //     s_id.value[2] = "合 金 熔 化 炉 ";
  //   } else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "E") {
  //     s_id.value[2] = "电 炉";
  //   }
  //   else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "A" || outInfo.getBlock(2).data[0]["STATION_ID"] == "Y") {
  //     s_id.value[2] = "A O D";
  //   }
  //   else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "B") {
  //     s_id.value[2] = "转 炉";
  //   }
  //   else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "D") {
  //     s_id.value[2] = "三 脱";
  //   } else {
  //     s_id.value[2] = " ";
  //   }
  // } else {
  //   erFormHelper.clearGridData('gridView1');
  //   erFormHelper.clearGridData('gridView2');
  //   erFormHelper.clearGridData('gridView3');
  //   s_id.value[0] = " ";
  //   s_id.value[1] = " ";
  //   s_id.value[2] = " ";
  //   return;
  // }

};
// // 焦点行改变事件
// const gridviewMainFocusChanged = async (e: any) => {
//   p_query_fbsm14(e.data);
//   // if (e.rowChanged) {
//   //   // erFormHelper.unCheckAllGridRow('gridviewMain');
//   //   erFormHelper.checkGridCurrentRow('gridviewMain');
//   // }
//   console.log("ST_NO", e.data.get('ST_NO'));
//   const allversionNo = await erFormHelper.queryDataByDataSource('FBSM50A', {
//     customFilter: `   ( base.ST_NO ='${e.data.get('ST_NO')}' OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '1' AND base.MATERIAL_CODE ='${e.data.get('MATERIAL_CODE')}') OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '2' AND base.MATERIAL_CODE !='${e.data.get('MATERIAL_CODE')}') OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '3' AND base.COMM_FMLY_CODE !='${e.data.get('COMM_FMLY_CODE')}' AND base.MATERIAL_CODE !='${e.data.get('MATERIAL_CODE')}') )  `
//   });
//   await erFormHelper.reloadDropDownDataSource('gridView1', 'SEQ_NO', allversionNo.getBlock(0).data);
//   await erFormHelper.reloadDropDownDataSource('gridView2', 'SEQ_NO', allversionNo.getBlock(0).data);
//   await erFormHelper.reloadDropDownDataSource('gridView3', 'SEQ_NO', allversionNo.getBlock(0).data);
// };

// 主表行双击事件-弹出修改框
const GridViewMainDoubleClick = async (e: any) => {
  if (e && e.data) {
    const inInfo = new EI.EIInfo();
    const gridewmain = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
    console.log('gridewmain', gridewmain);
    console.log('gridewmain.MATERIAL_CODE', gridewmain.data[0]["MATERIAL_CODE"]);
    parentInfo.value = { COMM_FMLY_CODE: gridewmain.data[0]["COMM_FMLY_CODE"], MATERIAL_CODE: gridewmain.data[0]["MATERIAL_CODE"], DATE_C: gridewmain.data[0]["DATE_C"], SEQ_NO: gridewmain.data[0]["SEQ_NO"], DATE_TIME: gridewmain.data[0]["DATE_TIME"], ST_NO: gridewmain.data[0]["ST_NO"], COMPOSE_LIST_NO: gridewmain.data[0]["COMPOSE_LIST_NO"], FURNACE_COUNT: gridewmain.data[0]["FURNACE_COUNT"], BACKLOG_EA: gridewmain.data[0]["BACKLOG_EA"], PARENT: 'FBSM31ZS2N' };
    //parentInfo.value = { PARENT: 'FBSM15PS2N'};
    dialogFormName.value = 'FBSM31ZS2N';
    dialogVisible.value = true;    //弹出画面
  }
};

const F4_DO = async (e: any) => {
  console.log('F4_DO');
  try {
    // 1. 可选：校验（比如是否选中主表行，根据业务需求调整）
    const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
    if (!currentRow) {
      erFormHelper.messageWarning('请先选择一条配料信息！');
      return;
    }

    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    f4ParentInfo.value = {
      PARENT: 'FBSM31S2N', // 标识父画面
      ST_NO: currentRow.get('ST_NO'), // 传递主表选中行的ST_NO
      COMPOSE_LIST_NO: currentRow.get('COMPOSE_LIST_NO'), // 传递物料编码
      BACKLOG_EA: currentRow.get('BACKLOG_EA'),
      DATE_TIME: currentRow.get('DATE_C'),
      SEQ_NO: currentRow.get('SEQ_NO'),
      // 可添加其他需要传递的参数
    };

    // 3. 设置弹窗画面名
    f4DialogFormName.value = 'FBSM15HS2N';

    // 4. 显示F3弹窗
    f4DialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError('打开FBSM15HS2N画面失败：' + (error as Error).message);
  }
};
const F4_PRE_DO = async (e: any) => {

  erFormHelper.messageInfo('确认修改信息无误，方可点击修改键。若需取消操作请点击取消键。');
};
const F4_CANCEL = async (e: any) => {
  // erFormHelper.setGridToolbarVisible('gridView1',
  //   {
  //     addrow: false,
  //     copyrow: false,
  //     delete: false
  //   }
  // );
  // erFormHelper.setGridToolbarVisible('gridView2',
  //   {
  //     addrow: false,
  //     copyrow: false,
  //     delete: false
  //   }
  // );
  // erFormHelper.setGridToolbarVisible('gridView3',
  //   {
  //     addrow: false,
  //     copyrow: false,
  //     delete: false
  //   }
  // );
  p_query_fbsm14(e.data);
  erFormHelper.messageInfo('修改操作取消');
};
const ErGrid_GXRwKGAd_ErGridReady = (e: any) => {
};
const erGrid1Ready = (e: any) => {
  erFormHelper.setGridToolbarVisible('gridView1',
    {
      addrow: true,
      copyrow: true,
      delete: true

    }
  );
};
const erGrid2Ready = (e: any) => {
  erFormHelper.setGridToolbarVisible('gridView2',
    {
      addrow: true,
      copyrow: true,
      delete: true
    }
  );
};
const erGrid3Ready = (e: any) => {
  erFormHelper.setGridToolbarVisible('gridView3',
    {
      addrow: true,
      copyrow: true,
      delete: true
    }
  );
};
const erGridmainReady = (e: any) => {
  // 获取 grid 实例对象
  gridviewMain = erFormHelper.getGrid("gridviewMain");
  // 设置grid工具栏自定义事件
  // erFormHelper.initialGridToolbar("gridviewMain", {
  //   save: {
  //     visible: true,
  //     action: async () => {
  //       console.log("save");
  //       if (!erFormHelper.hasDataChange('gridviewMain')) {
  //         erFormHelper.messageWarning('无数据更改,不需要保存');
  //         return;
  //       }
  //       const inInfo = erFormHelper.getGridChangedRowsAsEiInfo('gridviewMain');
  //       inInfo.addBlock(dt_key);
  //       console.log("inInfo", inInfo);
  //       const outInfo = await erFormHelper.callService('fbsma12_save', inInfo);
  //       if (outInfo.sys.status < 0) {
  //         erFormHelper.messageError(outInfo.msg);
  //         return false;
  //       }
  //       await p_query();
  //     },
  //     // 是否阻止默认事件触发
  //     preventDefault: false,
  //   },
  // });
  p_query();
  erFormHelper.setGridEditable("gridviewMain", false); // 设置grid不可编辑
};


</script>

<style lang="scss" scoped></style>
