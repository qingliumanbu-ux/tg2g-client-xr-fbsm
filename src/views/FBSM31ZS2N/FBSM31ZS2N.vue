<template>
    <xr-ef-form @ready="efFormReady" @closeDialog="closeEfDialog" :in-dialog-form-name="'FBSM31ZS2N'"
        :show-close-button="false">
        <template v-if="showContent">
            <!-- 配料单主区域，分为5个区域 -->
            <div class="form-layout" @click="handleFormClick">
                <!-- 区域1：基本信息 + 操作按钮 (15%) -->
                <div class="area-1">
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
                                        <div class="info-label required">出钢记号</div>
                                        <div class="info-value">{{ form.stNo }}</div>
                                    </div>
                                </div>
                                <!-- 第二行：三列 -->
                                <div class="info-row">
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
                                <button class="btn btn-refresh" @click="refreshFormula">
                                    <span class="btn-icon">🔄</span> 刷新<br>数据
                                </button>
                                <button class="btn btn-secondary" @click="showProcessData">
                                    <span class="btn-icon">📊</span> 过程<br>数据
                                </button>
                                <button class="btn btn-secondary" @click="showStock">
                                    <span class="btn-icon">📦</span> 库存<br>查询
                                </button>
                                <button class="btn btn-secondary" @click="showHistory">
                                    <span class="btn-icon">📋</span> 导入<br>模板
                                </button>
                                <button class="btn btn-primary" @click="saveToTemplate">
                                    <span class="btn-icon">💾</span> 存为<br>模板
                                </button>

                                <button class="btn btn-success" @click="saveFormula">
                                    <span class="btn-icon">💾</span> 保存
                                </button>
                                <button class="btn btn-warning" @click="checkFormula">
                                    <span class="btn-icon">✅</span> 审核
                                </button>
                                <button class="btn btn-warning" @click="nocheckFormula">
                                    <span class="btn-icon">❎</span> 取消<br>审核
                                </button>
                                <button class="btn btn-info" @click="exportFormula">
                                    <span class="btn-icon">📤</span> 导出
                                </button>
                                <!--button class="btn btn-secondary" @click="printFormula">
                  <span class="btn-icon">🖨️</span> 打印
                </button-->
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
                                    <Spreadsheet ref="spreadsheetRefBOF" :initial-rows="6" :initial-columns="6"
                                        :row-height="22" :show-row-checkboxes="true"
                                        :non-selectable-row-labels="specialRowLabels" :column-width="columnWidthsBOF"
                                        :data="materialDataBOF" :protected-rows="protectedRowsBOF"
                                        :protected-columns="protectedColumnsBOF" :auto-height="true"
                                        :showColumnHeaders="false" :active="activeSpreadsheet === 'BOF'"
                                        @cell-update="handleCellUpdateBOF" @data-change="handleDataChangeBOF"
                                        @height-change="handleHeightChangeBOF"
                                        @activated="() => activateSpreadsheet('BOF')" />
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


// 特殊行标签，这些行不是物料数据行
const specialRowLabels = ['配料重量', '出钢重量', '备注'];


const columnWidthsBOF = ref<number[]>([
    200,  // 0: 物料名称
    0,   // 1: 库区
    60,   // 2: 重量(t)
    100,  // 3: 物料代码
    0,    // 4: 物料属性（隐藏）
    0     // 5: 物料收得率（隐藏）
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

// ========== BOF配料单数据 ==========
// BOF物料名称数据源
const materialDataSourceBOF: Ref<DataSourceItem[]> = ref([
    { seq_id: 'MAT301', name: '废钢', code: 'MAT301', category: '废钢', storageArea: '废钢区', back_c2: ' ', mat_yeild: 100 },
    { seq_id: 'MAT302', name: '铁水', code: 'MAT302', category: '铁水', storageArea: '铁水区', back_c2: ' ', mat_yeild: 100 },
]);

// 备注信息
const remarkInfoBOF = ref(' ');

// 收得率系数（初始化时加载）
// 数组结构：[重量收得率, C%收得率, Si%收得率, Mn%收得率, P%收得率, S%收得率, Cr%收得率, Ni%收得率, Mo%收得率, Cu%收得率, Co%收得率, Al%收得率, Nb%收得率, V%收得率, Ti%收得率, B%收得率, N%收得率, Ca%收得率]
const bofYieldRate = ref([1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]); // BOF收得率系数数组


//配料重量到出钢重量的收得率
const weightYield = ref([1, 1, 1, 1]);

// 表格高度变化处理


// 配料单类型
type FormulaType = 'BOF';

// 动态数据源定义
const storageAreaDataSourceBOF = ref<DataSourceItem[]>([]);
const middleCategoryDataSource = ref<DataSourceItem[]>([]);// 中类代码数据源
const processRouteDataSource = ref<DataSourceItem[]>([]);// 工艺路线数据源

// 数据源配置映射
const dataSourceConfigs = {
    BOF: {
        material: materialDataSourceBOF,
        storageArea: storageAreaDataSourceBOF
    }
};

// 辅助函数：创建物料名称单元格（带数据源）
const createMaterialNameCell = (value: string = '', formulaType: FormulaType = 'BOF'): CellData => {

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
const createStorageAreaCell = (value: string = '', formulaType: FormulaType = 'BOF'): CellData => {
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
        Mat_code: string;
        back_c2: string;
        mat_yeild: number;
    }>,
    clearExisting: boolean = true
) => {
    console.log(`开始添加物料数据到BOF配料单，数据行数：${data.length}`);

    // 创建BOF专用表头（6列）
    const createHeaderRow = (): CellData[] => {
        return [
            { value: '物料名称', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
            { value: '库区', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
            { value: '重量(t)', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
            { value: '物料代码', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
            { value: '物料属性', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true, style: { display: 'none' } },
            { value: '物料收得率', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true, style: { display: 'none' } }
        ];
    };

    // 初始化数据
    if (!target.value || target.value.length === 0) {
        target.value = [createHeaderRow()];
    }

    const currentData = [...target.value];
    let headerRow: CellData[];

    // 检查第一行是否是有效表头
    const firstRowFirstCellValue = currentData[0]?.[0]?.value;
    const isHeaderRow = typeof firstRowFirstCellValue === 'string' && firstRowFirstCellValue === '物料名称';

    if (isHeaderRow) {
        headerRow = currentData[0];
    } else {
        headerRow = createHeaderRow();
    }

    // BOF特殊行标签（只有这3个）
    const specialRowLabels = ['配料重量', '出钢重量', '备注'];

    // 识别并保存现有特殊行
    const specialRows: CellData[][] = [];
    for (let i = 0; i < currentData.length; i++) {
        if (i === 0 && isHeaderRow) continue;
        const firstCellValue = currentData[i][0]?.value;
        if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
            specialRows.push(currentData[i]);
        }
    }

    // 构建新数据
    const newDataRows: CellData[][] = [];
    newDataRows.push(headerRow);

    // 如不清空，保留现有数据行（非特殊行）
    if (!clearExisting) {
        const startIndex = isHeaderRow ? 1 : 0;
        for (let i = startIndex; i < currentData.length; i++) {
            const firstCellValue = currentData[i][0]?.value;
            if (typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue)) {
                continue;
            }
            newDataRows.push(currentData[i]);
        }
    }

    // 添加新数据行（6列结构）
    data.forEach(item => {
        const row: CellData[] = [
            {
                value: item.Mat_name,
                format: 'text',
                alignment: 'center',
                dataSource: {
                    data: materialDataSourceBOF.value,
                    displayField: 'name',
                    valueField: 'name',
                    searchable: true,
                    columns: ['back_c2', 'name', 'code'],
                    title: '选择物料'
                }
            },
            { value: item.StorageArea, format: 'text', alignment: 'center' },
            { value: String(item.Weight), format: 'number', alignment: 'right' },
            { value: item.Mat_code, format: 'text', alignment: 'center', isProtected: true },
            { value: item.back_c2 || '', format: 'text', alignment: 'center', style: { display: 'none' } },
            { value: String(item.mat_yeild || 100), format: 'number', alignment: 'right', style: { display: 'none' } }
        ];
        newDataRows.push(row);
    });

    // 添加特殊行（保持原有）
    specialRows.forEach(row => {
        newDataRows.push(row);
    });

    target.value = newDataRows;
    console.log(`BOF配料单数据更新完成，总行数：${newDataRows.length}`);
};


// 添加配料重量行（只计算重量列）
const addFormulaWeightRowBOF = () => {
    // 先移除现有的配料重量行（如果有）
    const existingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '配料重量');
    if (existingIndex !== -1) {
        materialDataBOF.value.splice(existingIndex, 1);
    }

    let totalWeight = 0;

    // 计算总重量（从第1行开始，跳过表头）
    for (let row = 1; row < materialDataBOF.value.length; row++) {
        const firstCellValue = materialDataBOF.value[row][0]?.value;
        // 跳过特殊行
        if (typeof firstCellValue === 'string' && ['配料重量', '出钢重量', '备注'].includes(firstCellValue)) {
            continue;
        }

        const weight = parseFloat(materialDataBOF.value[row][2]?.value) || 0;
        totalWeight += weight;
    }

    // 构建配料重量行（6列结构）
    const formulaWeightRow: CellData[] = [
        { value: '配料重量', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true },
        { value: totalWeight.toFixed(3), format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true, style: { display: 'none' } },
        { value: '', format: 'text', alignment: 'center', isProtected: true, style: { display: 'none' } }
    ];

    // 插入到备注行之前（或末尾）
    const remarkIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '备注');
    if (remarkIndex !== -1) {
        materialDataBOF.value.splice(remarkIndex, 0, formulaWeightRow);
    } else {
        materialDataBOF.value.push(formulaWeightRow);
    }
};

// 添加出钢重量行（配料重量 × 收得率）
const addSteelWeightRowBOF = () => {
    // 先移除现有的出钢重量行（如果有）
    const existingIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '出钢重量');
    if (existingIndex !== -1) {
        materialDataBOF.value.splice(existingIndex, 1);
    }

    // 查找配料重量行的总重量
    const formulaIndex = materialDataBOF.value.findIndex(row => row[0]?.value === '配料重量');
    if (formulaIndex === -1) {
        console.warn('未找到配料重量行，无法计算出钢重量');
        return;
    }

    const formulaWeight = parseFloat(materialDataBOF.value[formulaIndex][2]?.value) || 0;

    // 计算加权平均收得率（按重量加权）
    let totalWeight = 0;
    let totalYieldWeight = 0;

    for (let row = 1; row < materialDataBOF.value.length; row++) {
        const firstCellValue = materialDataBOF.value[row][0]?.value;
        if (typeof firstCellValue === 'string' && ['配料重量', '出钢重量', '备注'].includes(firstCellValue)) {
            continue;
        }

        const weight = parseFloat(materialDataBOF.value[row][2]?.value) || 0;
        const yieldRate = parseFloat(materialDataBOF.value[row][5]?.value) || 100; // 第5列是收得率

        totalWeight += weight;
        totalYieldWeight += weight * yieldRate;
    }

    // 平均收得率
    const avgYieldRate = totalWeight > 0 ? totalYieldWeight / totalWeight : 100;
    const steelWeight = formulaWeight * (avgYieldRate / 100);

    // 构建出钢重量行（6列结构）
    const steelWeightRow: CellData[] = [
        { value: '出钢重量', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true },
        { value: steelWeight.toFixed(3), format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true },
        { value: '', format: 'text', alignment: 'center', isProtected: true, style: { display: 'none' } },
        { value: `收得率:${avgYieldRate.toFixed(1)}%`, format: 'text', alignment: 'left', isProtected: true, style: { display: 'none' } }
    ];

    // 插入到配料重量行之后
    materialDataBOF.value.splice(formulaIndex + 1, 0, steelWeightRow);
};




const addRemarkRowBOF = () => {
    const remarkRow: CellData[] = [
        { value: '备注', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: remarkInfoBOF.value, format: 'text', alignment: 'left', colspan: 5 }  // 跨5列合并，可编辑
    ];
    materialDataBOF.value.push(remarkRow);
};


const protectedRowsBOF = computed(() => {
    const protectedRows: number[] = [0]; // 表头行
    for (let i = 0; i < materialDataBOF.value.length; i++) {
        const rowLabel = materialDataBOF.value[i][0]?.value;
        if (rowLabel === '配料重量' || rowLabel === '出钢重量') {
            protectedRows.push(i);
        }
    }
    return protectedRows;
});

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


const handleCellUpdateBOF = (row: number, col: number, value: any) => {
    if (row >= 0 && row < materialDataBOF.value.length && col >= 0 && col < materialDataBOF.value[row].length) {
        materialDataBOF.value[row][col].value = value;
        let needRecalculate = false;

        // 物料名称自动填充代码（第0列）
        if (col === 0 && row > 0) {
            const material = materialDataSourceBOF.value.find(item => item.name === value);
            if (material) {
                if (material.back_c2) materialDataBOF.value[row][1].value = material.back_c2;
                materialDataBOF.value[row][3].value = material.code || '';
                // 自动填充收得率（第5列）
                materialDataBOF.value[row][5].value = String(material.mat_yeild || 100);
                needRecalculate = true; // 标记需要重新计算
            }
        }

        // ========== 如果修改的是重量列（第2列）或收得率列（第5列），重新计算 ==========
        if (col === 2 || col === 5) {
            needRecalculate = true;
        }

        // ✅ 统一处理重新计算
        if (needRecalculate) {
            addFormulaWeightRowBOF();
            addSteelWeightRowBOF();
        }

        if (spreadsheetRefBOF.value) {
            spreadsheetRefBOF.value.setData(materialDataBOF.value);
        }
    }
};

// 辅助函数：确保数据行有正确的数据源配置
const ensureDataSourceConfig = (data: CellData[][]) => {
    if (!data || data.length === 0) return data;

    // BOF特殊行标签（只有这3个）
    const specialRowLabels = ['配料重量', '出钢重量', '备注'];

    // 从第1行开始（跳过表头）
    for (let row = 1; row < data.length; row++) {
        if (!data[row]) {
            data[row] = [];
        }

        // 检查是否是特殊行
        const firstCellValue = data[row][0]?.value;
        const isSpecialRow = typeof firstCellValue === 'string' && specialRowLabels.includes(firstCellValue);

        if (isSpecialRow) {
            continue; // 特殊行不需要数据源配置
        }

        // 确保行有6列
        while (data[row].length < 6) {
            data[row].push({ value: '', format: 'text', alignment: 'center' as TextAlign });
        }

        // 物料名称列（列0）- 添加数据源配置
        if (!data[row][0].dataSource) {
            const existingValue = data[row][0]?.value || '';
            data[row][0] = {
                value: existingValue,
                format: 'text',
                alignment: 'center' as TextAlign,
                dataSource: {
                    data: materialDataSourceBOF.value,
                    displayField: 'name',
                    valueField: 'name',
                    searchable: true,
                    columns: ['back_c2', 'name', 'code'],
                    title: '选择物料'
                }
            };
        }

        // ========== 修改：强制重量列（列2）右对齐 ==========
        if (data[row][2]) {
            data[row][2].alignment = 'right' as TextAlign;  // 改为 'right'
            if (!data[row][2].format) {
                data[row][2].format = 'number';
            }
        }
        // ===============================================

        // 物料代码列（列3）- 确保受保护
        if (!data[row][3].isProtected) {
            data[row][3].isProtected = true;
        }
        if (!data[row][3].alignment) {
            data[row][3].alignment = 'center' as TextAlign;
        }
    }

    return data;
};

// 数据变化处理


const handleDataChangeBOF = (data: CellData[][]) => {
    // 确保数据源配置正确
    const processedData = ensureDataSourceConfig(JSON.parse(JSON.stringify(data)));
    materialDataBOF.value = processedData;

    // 重新计算配料重量和出钢重量（当新增或删除行时）
    addFormulaWeightRowBOF();
    addSteelWeightRowBOF();

    // 更新表格数据
    if (spreadsheetRefBOF.value) {
        spreadsheetRefBOF.value.setData(materialDataBOF.value);
    }
};

const handleHeightChangeBOF = (height: number) => {
    //console.log('BOF表格高度变化:', height);
};

// 初始化
const formName = ref('FBSM31ZS2N');
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

            p_query();



            // initMaterialDataIF();
            // initMaterialDataEAF();
            // initMaterialDataBOF();
            // initMaterialDataAOD();

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

        query_material();
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
const loadAllSpreadsheetData = () => {
    //console.log('加载所有表格数据');

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
            PARENT: 'FBSM31ZS2N', // 标识父画面
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
            PARENT: 'FBSM31ZS2N', // 标识父画面
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
            PARENT: 'FBSM31ZS2N', // 标识父画面
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
            Mat_code: string;
            back_c2: string;
            mat_yeild: string;
        }> = [];

        if (!materialData || materialData.length <= 1) return result;

        for (let row = 1; row < materialData.length; row++) {
            // 跳过特殊行（配料重量、出钢重量、备注）
            const firstCellValue = materialData[row][0]?.value;
            if (typeof firstCellValue === 'string' && ['配料重量', '出钢重量', '备注'].includes(firstCellValue)) {
                continue;
            }

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
                Mat_code: getCellValue(3),
                back_c2: getCellValue(4),
                mat_yeild: getCellValue(5),
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
        Mat_code: String(item.Mat_code || ''),
        back_c2: String(item.back_c2 || ''),
        mat_yeild: Number(item.mat_yeild || 100)
    }));
};

const p_query = async () => {
    // 1. 组装查询入参：从现有form响应式数据中取核心条件（非空校验）

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
    const response = await erFormHelper.callService('fbsm31z_inq', inInfo);
    // 4. 关闭加载中提示
    // erFormHelper.closeMessageLoading();

    // 5. 核心：获取后台返回的完整数据数组（直接用，无需取[0]）
    //console.log('后台返回原始数据：', response.getBlock(0).data);
    const dataArray = response.getBlock(0).data || []; // 加||[]防止data为undefined
    // 初始化表格数据（清空原有数据）
    materialDataBOF.value = [];

    // 6. 关键校验：确保dataArray是数组（兜底，防止后台返回非数组）
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        erFormHelper.messageInfo('暂无配料单明细数据');
        loadAllSpreadsheetData(); // 即使无数据也刷新计算，避免表格异常
        return;
    }

    // 7. 按STATION_ID分组过滤+数据结构映射（统一字段名，修复原代码空格问题）

    // BOF炉（B）
    const BOF_LIST = dataArray
        .filter(item => item.STATION_ID === "B")
        .map(item => ({
            Mat_name: item.MAT_NAME || '',
            StorageArea: item.STOCK_NAME || '',
            Weight: item.WEIGHT || '',
            Mat_code: item.MAT_CODE || '',
            back_c2: item.BACK_C2 || '',
            mat_yeild: item.MAT_YEILD || 100
        }));

    // 各炉型数据统一转字符串
    const convertedBOF_LIST = convertDataToString(BOF_LIST);

    //备注信息赋值
    const dataArray2 = response.getBlock('REMARK').data || []; // 加||[]防止data为undefined
    //console.log('备注信息：', dataArray2);
    if (dataArray2.length > 0) {
        remarkInfoBOF.value = String(dataArray2[0]["BACK_BOF"]) || '';
    }

    // 8. 各炉型数据处理：清空→统一方法处理→加备注行（和IF逻辑完全一致，链路统一）

    // BOF炉（B）
    materialDataBOF.value = [];
    addMaterialDataFromSource(materialDataBOF, convertedBOF_LIST, true);

    // 检查后台返回的数据是否已经包含配料重量和出钢重量行
    const hasFormulaWeightRow = materialDataBOF.value.some(row => row[0]?.value === '配料重量');
    const hasSteelWeightRow = materialDataBOF.value.some(row => row[0]?.value === '出钢重量');

    // 只有后台返回的数据没有这两个行时才自动计算
    if (!hasFormulaWeightRow) {
        addFormulaWeightRowBOF();
    }
    if (!hasSteelWeightRow) {
        addSteelWeightRowBOF();
    }
    // 使用BOF专用的6列备注行，不用createRemarkRow（那是14列的）
    const remarkRow: CellData[] = [
        { value: '备注', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
        { value: remarkInfoBOF.value, format: 'text', alignment: 'left', colspan: 5 }  // 跨5列合并，可编辑
    ];
    materialDataBOF.value.push(remarkRow);

    // 9. 等待DOM更新后刷新表格计算（避免数据未渲染完成导致计算异常）
    await nextTick();
    loadAllSpreadsheetData();

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

    console.log('BOF物料数据源查询调用前ST_NO:', form.stNo);
    // 3. 调用后台查询接口
    const response = await erFormHelper.callService('fbsm31z_material_inq', inInfo);
    const bofData = response.getBlock(0).data || []; // 加||[]防止data为undefined

    console.log('BOF物料数据源返回:', response.getBlock(0));

    if (!Array.isArray(bofData) || bofData.length === 0) {
        // erFormHelper.messageInfo('暂无配料单明细数据');   
        return;
    }
    // 初始化表格数据（清空原有数据）
    // console.log('物料代码加载查询：', dataArray);


    materialDataSourceBOF.value = [];

    materialDataSourceBOF.value = bofData.map(item => ({
        seq_id: item.SEQ_ID || '',
        name: item.MAT_NAME || '',
        code: item.MAT_CODE || '',
        back_c2: item.BACK_C2 || '',
        mat_yeild: item.MAT_YEILD || 100
    }));

    console.log('BOF物料数据源加载成功:', materialDataSourceBOF.value);

};

const refreshFormula = async (e: any) => {
    p_query();
};

// 组件挂载时初始化
onMounted(() => {
    setTimeout(() => {
        if (!efFormIsReady.value) {
            console.log('111111111111efFormReady not called, initiainitlizing manually');
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
    min-height: 100px;
    /* 改为自动高度 */
    /* 最小高度 */
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
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
    margin-top: 8px;
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