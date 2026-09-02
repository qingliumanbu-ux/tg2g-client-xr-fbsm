<template>
    <xr-ef-form @ready="efFormReady" :f2-do="F2_DO" :f3-do="F3_DO" :f4-do="F4_DO">
        <template v-if="initializeFlag === 1">
            <er-layout :er-form-helper-prop="erFormHelper" :config-id="'FBSM32CS2N_QUERY'"></er-layout>
            <v-splitter style="height: 100%;" class="default-theme">
                <v-splitter-pane size="70%">
                    <a-tabs type="card" style="margin: 0;height: 100%;">
                        <a-tab-pane key="tab1" tab="计划信息">
                            <er-grid :er-form-helper-prop="erFormHelper" :config-id="'FBSM32CS2N_INQ1'"
                                @focus-changed="FBSM32CS2N_INQ1FocusChanged" @erGridReady="erGrid1Ready">
                            </er-grid>
                        </a-tab-pane>
                    </a-tabs>
                </v-splitter-pane>
                <v-splitter-pane size="30%">
                    <a-tabs type="card" style="margin: 0;height: 100%;">
                        <!-- 替换原来的 a-tab-pane 内容 -->
                        <a-tab-pane key="tab1" tab="配料单明细(BOF)">
                            <div class="bof-table-wrapper" ref="bofTableWrapper">
                                <Spreadsheet ref="spreadsheetRefBOF" :initial-rows="6" :initial-columns="3"
                                    :row-height="22" :column-width="columnWidthsBOF" :data="materialDataBOF"
                                    :protected-rows="protectedRowsBOF" :protected-columns="protectedColumnsBOF"
                                    :auto-height="true" :showColumnHeaders="false" :active="true" :readonly="true"
                                    @cell-update="handleCellUpdateBOF" @data-change="handleDataChangeBOF" />
                            </div>
                        </a-tab-pane>
                    </a-tabs>
                </v-splitter-pane>
            </v-splitter>
        </template>
    </xr-ef-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, computed, nextTick, toRaw, Ref } from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfDialog from "EFX/xrEfDialog";
import EFUtility from "EFX/EFUtility";
import eBFR from "EBFR/eBFR";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';
import { ER } from 'ERX/Er';
import { EI } from 'EIX/ei';
import { SiUtils } from 'ERX/SiUtils';
import { FiUtils } from 'ERX/FiUtils';
import { PopFreeReturnInfo, PopQueryReturnInfo } from 'ERX/er-type';
import ErPopFree from 'ERX/ErPopFree';
import ErPopQuery from 'ERX/ErPopQuery';

// ===== 引入 Spreadsheet 组件=====
import Spreadsheet from './Spreadsheet.vue';
import type { CellData, DataSourceItem, TextAlign } from './Spreadsheet.vue';

export default {
    name: 'FBSM32CS2N'
};
</script>

<script lang="ts" setup>
// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{ [key: string]: any }>({});
const efFormIsReady = ref(false);

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
    efFormInfo.value = e.formInfo;
    efFormIsReady.value = true;
    formPartition.value = efFormInfo.value.formPartition;
    // 初始化低代码工具类
    initializePage();
};

const erGrid1Ready = () => {
    //efFormInfo.value = e.formInfo;
    efFormIsReady.value = true;
    formPartition.value = efFormInfo.value.formPartition;
    erFormHelper.setGridEditable(config_inq1.value, false);
    erFormHelper.setGridEditable(config_inq2.value, false);
    erFormHelper.setGridToolbarVisible(config_inq1.value, {
        addrow: false,
        copyrow: false,
        excel: false
    });
    erFormHelper.setGridToolbarVisible(config_inq2.value, {
        addrow: false,
        copyrow: false,
        excel: false
    });
    // 初始化低代码工具类
    initializePage();
};

const formName = 'FBSM32CS2N';
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = 'fbsm_form_get';
const config_query = ref('FBSM32CS2N_QUERY');
const config_inq1 = ref('FBSM32CS2N_INQ1');
const config_inq2 = ref('FBSM32CS2N_INQ2');

// ===== 添加响应式变量（在原有变量定义区域添加）=====
const spreadsheetRefBOF = ref<InstanceType<typeof Spreadsheet>>();
const bofTableWrapper = ref<HTMLElement>();
const materialDataBOF = ref<CellData[][]>([
    [
        { value: '物料名称', format: 'text' as const, fontWeight: 'bold', alignment: 'left' as TextAlign, isProtected: true },
        { value: '重量(t)', format: 'text' as const, fontWeight: 'bold', alignment: 'center' as TextAlign, isProtected: true },
        { value: '物料代码', format: 'text' as const, fontWeight: 'bold', alignment: 'center' as TextAlign, isProtected: true }
    ]
]);
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([]);

// 列宽配置（与FBSM31YS2N保持一致）
const columnWidthsBOF = ref<number[]>([
    180,  // 0: 物料名称
    60,   // 1: 重量(t)
    100,  // 2: 物料代码
]);

// 受保护行列配置
const protectedRowsBOF = computed(() => {
    const protectedRows: number[] = [0]; // 第0行是表头
    for (let i = 0; i < materialDataBOF.value.length; i++) {
        const rowLabel = materialDataBOF.value[i][0]?.value;
        if (rowLabel === '配料成分' || rowLabel === '出钢成分') {
            protectedRows.push(i);
        }
    }
    return protectedRows;
});
const protectedColumnsBOF = computed(() => []);



// 画面相关数据初始化
const initializePage = async () => {
    const initialResult = await erFormHelper.Initialize(formPartition.value, formName, '', initializeService);
    if (initialResult.flag >= 0) {
        // 画面工具类初始化成功后将画面渲染条件设置为1
        initializeFlag.value = 1;

        // 回调函数获取控件信息及设置定义事件等操作
        nextTick(() => {
            // 获取画面上的主要控件信息
        });
    } else {
        erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg + ']!');
    }
};

const p_query = async () => {
    console.log('进入查数据函数');
    const inInfo = new EI.EIInfo();
    inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock(config_query.value));
    const outInfo = await erFormHelper.callService('fbsm31c_inq', inInfo);
    if (outInfo.sys.status < 0) {
        erFormHelper.messageError('查询错误:' + outInfo.sys.msg);
        return;
    }
    if (outInfo.sys.status >= 0) {
        console.log(outInfo, '查数据outInfo');
        erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, config_inq1.value);
    }
}

// 创建固定表头
const createFixedHeaderRow = (): CellData[] => {
    const headers = ['物料名称', '重量(t)', '物料代码'];
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
const createMaterialRow = (row: any): CellData[] => {
    const numCell = (val: any): CellData => ({
        value: formatNumber(val),
        format: 'number',
        alignment: 'right',
        isProtected: true
    });

    return [
        { value: row.MAT_NAME || '', format: 'text', alignment: 'left', isProtected: true },
        numCell(row.WEIGHT),     // 重量
        { value: row.MAT_CODE || '', format: 'text', alignment: 'center', isProtected: true },
    ];
};

// 创建计算行
const createCalculatedRow = (row: any): CellData[] => {
    const baseStyle = { fontWeight: 'bold' as const, isProtected: true };
    const calcCell = (val: any, digits: number = 3): CellData => ({
        value: formatNumber(val, digits),
        format: 'number',
        alignment: 'right',
        ...baseStyle
    });

    return [
        { value: row.MAT_NAME || '', format: 'text', alignment: 'center', ...baseStyle },
        calcCell(row.WEIGHT, 3),  // 重量
        { value: row.MAT_CODE || '', format: 'text', alignment: 'center', ...baseStyle },
    ];
};

// 创建备注行 - 处理空值显示为空白
const createRemarkRow = (remark: string): CellData[] => {
    const displayRemark = remark && remark.trim() !== '' ? remark.trim() : ' '; // 空值显示为单个空格
    
    return [
        { 
            value: '备注', 
            format: 'text', 
            fontWeight: 'bold', 
            alignment: 'center', 
            isProtected: true 
        },
        { 
            value: displayRemark, 
            format: 'text', 
            alignment: 'left', 
            colspan: 2,  // 跨2列（重量+物料代码列）
            isProtected: true 
        },  
    ];
};

// 统一处理数值格式化
const formatNumber = (value: any, digits: number = 3): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return num.toFixed(digits);
};

// 构建BOF表格数据
const buildBOFTableData = (rows: any[], remark?: string): CellData[][] => {
    const result: CellData[][] = [createFixedHeaderRow()];

    // 处理物料行和计算行
    rows.forEach(row => {
        if (isCalculatedRow(row)) {
            result.push(createCalculatedRow(row));
        } else {
            result.push(createMaterialRow(row));
        }
    });

    // 【关键】总是添加备注行，没有内容就传空字符串
    result.push(createRemarkRow(remark || ''));

    return result;
};

// Spreadsheet事件处理（空实现即可，因为是只读）
const handleCellUpdateBOF = (row: number, col: number, value: any) => {
    // 只读模式，无需处理
};
const handleDataChangeBOF = (data: CellData[][]) => {
    materialDataBOF.value = data;
};

// 加载物料数据源
const loadMaterialDataSource = async (stNo: string) => {
    try {
        const inInfo = new EI.EIInfo();
        const block = inInfo.addBlock(new EI.EiBlock());
        block.addColumns('ST_NO');
        block.addRow({ ST_NO: stNo });
        
        const response = await erFormHelper.callService('fbsm15z_material_inq', inInfo);
        const dataArray = response.getBlock(0).data || [];
        
        materialDataSourceBOF.value = dataArray
            .filter((item: any) => item.STATION_ID === "B")
            .map((item: any) => ({
                seq_id: item.SEQ_ID || '',
                name: item.MAT_NAME || '',
                code: item.MAT_CODE || '',
                category: item.CATEGORY || ''
            }));
            
    } catch (error) {
        console.error('加载物料数据源失败:', error);
    }
};

const F2_DO = async (e: any) => {
    console.log("查询,start");
    p_query();
};
// F3 导出
const F3_DO = async (e: any) => {
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  if (!currentRow) {
    erFormHelper.messageWarning("请先选择左侧计划行");
    return;
  }

  const composeListNo = currentRow.COMPOSE_LIST_NO || "";
  const stNo = currentRow.ST_NO || "";

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

// F4 打印
const F4_DO = async (e: any) => {
  const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
  if (!currentRow) {
    erFormHelper.messageWarning("请先选择左侧计划行");
    return;
  }

  const composeListNo = currentRow.COMPOSE_LIST_NO || "";
  const stNo = currentRow.ST_NO || "";

  if (!composeListNo || !stNo) {
    erFormHelper.messageError("未获取到必要的打印参数（配料单号或出钢记号）!");
    return;
  }

  const reportParam = `@COMPOSE_LIST_NO@$$${composeListNo};;@ST_NO@$$${stNo}`;

  try {
    await eBFR.CallReportPDFFrom("FBSM32CS2N", reportParam, formPartition.value);
    erFormHelper.messageSuccess("打印请求已发送！");
  } catch (error) {
    console.error("打印报表时发生错误:", error);
    erFormHelper.messageError("打印失败，请检查参数或模板配置！");
  }
};
const FBSM32CS2N_INQ1FocusChanged = async (e: any) => {
    console.log('进入配料单查询函数，当前行:', e);
    
    // 1. 获取左侧当前行数据
    const currentRow = erFormHelper.getGridCurrentRow(config_inq1.value);
    if (!currentRow) {
        erFormHelper.messageWarning('请先选择计划行');
        // 清空表格但保留表头和备注行
        materialDataBOF.value = [createFixedHeaderRow(), createRemarkRow('')];
        return;
    }

    // 2. 组装查询参数
    const queryParams = {
        composeListNo: currentRow.COMPOSE_LIST_NO || "",
        stNo: currentRow.ST_NO || ""
    };

    if (!queryParams.composeListNo) {
        erFormHelper.messageInfo('当前计划行无配料单号');
        // 无配料单号时也显示空备注行
        materialDataBOF.value = [createFixedHeaderRow(), createRemarkRow('')];
        return;
    }

    // 3. 调用后台查询
    const inInfo = new EI.EIInfo();
    const block = inInfo.addBlock(new EI.EiBlock());
    block.addColumns('COMPOSE_LIST_NO', 'ST_NO', 'BACKLOG_EA', 'MATERIAL_CODE');
    block.addRow({
        COMPOSE_LIST_NO: queryParams.composeListNo,
        ST_NO: queryParams.stNo,
    });

    const outInfo = await erFormHelper.callService('fbsm31y_inq', inInfo);
    
    if (outInfo.sys.status < 0) {
        erFormHelper.messageError('查询配料单错误:' + outInfo.sys.msg);
        // 查询失败时也显示空备注行
        materialDataBOF.value = [createFixedHeaderRow(), createRemarkRow('')];
        return;
    }

    const dataArray = outInfo.getBlock(0).data || [];
    
    // 4. 获取备注数据（无论有无都继续）
    const remarkBlock = outInfo.getBlock('REMARK');
    const remarkData = remarkBlock.data[0] || {};
    const bofRemark = remarkData["BACK_BOF"]?.toString() || ''; // 取不到就是空字符串

    // 5. 筛选BOF数据
    const bofRows = dataArray.filter((item: any) => item.STATION_ID === "B");
    
    // 【关键】始终调用 buildBOFTableData，传入备注（可能为空）
    materialDataBOF.value = buildBOFTableData(bofRows, bofRemark);
};





onMounted(() => { });
</script>

<style lang="scss" scoped>
.bof-table-wrapper {
    height: 100%;
    width: 100%;
    overflow: auto;
}
.row-header.header-row-header {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
</style>