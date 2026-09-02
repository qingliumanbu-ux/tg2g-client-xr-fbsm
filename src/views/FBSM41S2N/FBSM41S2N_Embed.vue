<template>
  <div class="form-layout" @click="handleFormClick">
    <!-- 篮列表 -->
    <div v-for="(basket, index) in basketList" :key="basket.key" class="basket-section">
      <div class="basket-content">
        <!-- 左侧标题：横排显示"第X篮" -->
        <div class="basket-title">
          <div class="basket-title-text">第{{ basket.basketSeq }}篮</div>
        </div>
        <div class="table-container">
          <div class="spreadsheet-wrapper">
            <Spreadsheet :ref="(el: any) => setSpreadsheetRef(el, index)" :initial-rows="2"
              :initial-columns="columnWidths.length" :row-height="22" :column-width="columnWidths"
              :data="basket.data" :protected-rows="getProtectedRows(index)" :auto-height="true"
              :showColumnHeaders="false" :active="activeSpreadsheetIndex === index"
              :non-selectable-row-labels="['合计']" :show-basket-actions="true"
              @cell-update="(r: number, c: number, v: any, s?: any) => handleCellUpdate(index, r, c, v, s)"
              @data-change="(d: any) => handleDataChange(index, d)"
              @height-change="(h: number) => handleHeightChange(index, h)"
              @activated="activeSpreadsheetIndex = index"
              @menu-open="handleMenuOpen(index)"
              @add-basket="addBasket"
              @delete-basket="() => emitDeleteBasketRequest(index)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="basketList.length === 0" class="empty-state">
      暂无数据，请查询或新增篮
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Spreadsheet from './Spreadsheet.vue';
import type { CellData, DataSourceItem, TextAlign } from './Spreadsheet.vue';

// ==================== 类型定义 ====================
export interface RawMaterialRow {
  BUNKER_SEQ: string;
  BUNKER_NO: string;
  LAYER_NO: string;
  MAT_NAME: string;
  CAL_WEIGHT: string;
  ACT_WEIGHT: string;
  C_VALUE: string;
  SI_VALUE: string;
  MN_VALUE: string;
  P_VALUE: string;
  S_VALUE: string;
  CR_VALUE: string;
  NI_VALUE: string;
  MO_VALUE: string;
  CU_VALUE: string;
  CO_VALUE: string;
  MAT_CODE: string;
  LOT_NO: string;
  STOCK_NAME: string;
}

interface BasketItem {
  key: string;
  basketSeq: string;
  basketNo: string;
  data: CellData[][];
}

// ==================== Props & Emits ====================
const props = defineProps<{
  rawData?: RawMaterialRow[];
  materialDataSource?: DataSourceItem[];
  codeMap?: Map<string, string>;
  bunkerNoList?: DataSourceItem[];
}>();

const emit = defineEmits<{
  'update:rawData': [data: RawMaterialRow[]];
  'data-change': [data: CellData[][][]];
  'delete-basket-request': [index: number, basketSeq: string];
}>();

// ==================== 列配置 ====================
const columnWidths = [
  50,   // 0: BUNKER_NO
  45,   // 1: LAYER_NO
  180,  // 2: MAT_NAME
  60,   // 3: CAL_WEIGHT (配料重量)
  60,   // 4: ACT_WEIGHT
  45,   // 5: C%
  45,   // 6: Si%
  45,   // 7: Mn%
  50,   // 8: P%
  50,   // 9: S%
  45,   // 10: Cr%
  45,   // 11: Ni%
  45,   // 12: Mo%
  45,   // 13: Cu%
  45,   // 14: Co%
  90,   // 15: MAT_CODE
  90,   // 16: LOT_NO
  80,   // 17: STOCK_NAME
];

// ==================== 响应式数据 ====================
const basketList = ref<BasketItem[]>([]);
const activeSpreadsheetIndex = ref<number>(-1);
const spreadsheetRefs = ref<Map<number, InstanceType<typeof Spreadsheet>>>(new Map());

// 结构性变更标记（新增/删除篮等，不通过单元格背景色体现）
const dataModified = ref(false);

// ==================== 辅助函数 ====================
const createNumberCell = (value: string | number = '', alignment: TextAlign = 'right', isProtected = false): CellData => ({
  value: String(value),
  format: 'number',
  alignment,
  isProtected
});

const createNumberCell_1 = (value: string | number = '', alignment: TextAlign = 'right', isProtected = false): CellData => ({
  value: String(value),
  format: 'number:1',
  alignment,
  isProtected
});

const createBasketNoCell = (value: string = ''): CellData => {
  const dataSource = props.bunkerNoList || [];
  return {
    value,
    format: 'text',
    alignment: 'center' as TextAlign,
    dataSource: {
      data: dataSource,
      displayField: 'bunkerNo',
      valueField: 'bunkerNo',
      searchable: true,
      columns: ['bunkerNo'],
      title: '选择料篮号',
      dialogClass: 'data-source-dialog-narrow'
    }
  };
};

const createMaterialNameCell = (value: string = ''): CellData => {
  const dataSource = props.materialDataSource || [];
  return {
    value,
    format: 'text',
    alignment: 'left' as TextAlign,
    dataSource: {
      data: dataSource,
      displayField: 'name',
      valueField: 'name',
      searchable: true,
      columns: ['storageArea', 'name', 'code', 'batchNumber', 'weight', 'c', 'si', 'mn', 'p', 's', 'cr', 'ni', 'mo', 'cu', 'co'],
      title: '选择物料'
    }
  };
};

const createMaterialCodeCell = (value: string = ''): CellData => ({
  value,
  format: 'text',
  alignment: 'center' as TextAlign,
  isProtected: true
});

const createBatchNumberCell = (value: string = ''): CellData => ({
  value,
  format: 'text',
  alignment: 'center' as TextAlign,
  isProtected: true
});

// 创建表头行
const createHeaderRow = (): CellData[] => [
  { value: '篮号', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
  { value: '层号', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
  { value: '物料名称', format: 'text', fontWeight: 'bold', alignment: 'left', isProtected: true },
  { value: '配料重量', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
  { value: '实际重量', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
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
  { value: '库区', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
];

// 创建合计行
const createTotalRow = (): CellData[] => [
  { value: '合计', format: 'text', fontWeight: 'bold', alignment: 'center', isProtected: true },
  { value: '', code: '', format: 'text', alignment: 'center', isProtected: true },
  { value: '', format: 'text', alignment: 'center', isProtected: true },
  { value: '0', format: 'number:1', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:1', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:3', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '0', format: 'number:2', fontWeight: 'bold', alignment: 'right', isProtected: true },
  { value: '', format: 'text', alignment: 'center', isProtected: true },
  { value: '', format: 'text', alignment: 'center', isProtected: true },
  { value: '', format: 'text', alignment: 'center', isProtected: true },
];

// 创建空数据行
const createEmptyRow = (basketNo: string): CellData[] => [
  createBasketNoCell(basketNo),
  { value: '', format: 'text', alignment: 'center' },
  createMaterialNameCell(''),
  createNumberCell_1('', 'right', true), // 配料重量受保护
  createNumberCell_1(''),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createNumberCell('', 'right', true),
  createMaterialCodeCell(''),
  createBatchNumberCell(''),
  { value: '', format: 'text', alignment: 'center', isProtected: true },
];

// 将原始行转换为CellData行
const rawRowToCellRow = (row: RawMaterialRow): CellData[] => [
  createBasketNoCell(row.BUNKER_NO),
  { value: row.LAYER_NO, format: 'text', alignment: 'center' },
  createMaterialNameCell(row.MAT_NAME),
  createNumberCell_1(row.CAL_WEIGHT, 'right', true), // 配料重量受保护
  createNumberCell_1(row.ACT_WEIGHT),
  createNumberCell(row.C_VALUE, 'right', true),
  createNumberCell(row.SI_VALUE, 'right', true),
  createNumberCell(row.MN_VALUE, 'right', true),
  createNumberCell(row.P_VALUE, 'right', true),
  createNumberCell(row.S_VALUE, 'right', true),
  createNumberCell(row.CR_VALUE, 'right', true),
  createNumberCell(row.NI_VALUE, 'right', true),
  createNumberCell(row.MO_VALUE, 'right', true),
  createNumberCell(row.CU_VALUE, 'right', true),
  createNumberCell(row.CO_VALUE, 'right', true),
  createMaterialCodeCell(row.MAT_CODE),
  createBatchNumberCell(row.LOT_NO),
  { value: props.codeMap?.get(row.STOCK_NAME) || row.STOCK_NAME, code: row.STOCK_NAME, format: 'text', alignment: 'center', isProtected: true },
];

// ==================== 数据转换 ====================
const buildBasketList = (rawData: RawMaterialRow[]): BasketItem[] => {
  if (!rawData || rawData.length === 0) return [];

  // 按 BUNKER_SEQ 分组
  const groups = new Map<string, RawMaterialRow[]>();
  for (const row of rawData) {
    const seq = String(row.BUNKER_SEQ || '1');
    if (!groups.has(seq)) groups.set(seq, []);
    groups.get(seq)!.push(row);
  }

  // 按 BUNKER_SEQ 排序
  const sortedSeqs = Array.from(groups.keys()).sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const result: BasketItem[] = [];
  for (const seq of sortedSeqs) {
    const rows = groups.get(seq)!;
    const cellRows: CellData[][] = [];

    // 表头
    cellRows.push(createHeaderRow());

    // 数据行：第一行设置rowspan覆盖所有数据行
    rows.forEach((row, idx) => {
      const cellRow = rawRowToCellRow(row);
      if (idx === 0 && rows.length > 1) {
        cellRow[0].rowspan = rows.length;
      }
      cellRows.push(cellRow);
    });

    // 合计行
    cellRows.push(createTotalRow());
    recalculateTotalRow(cellRows);

    result.push({
      key: `basket-${seq}-${Date.now()}`,
      basketSeq: seq,
      basketNo: rows[0]?.BUNKER_NO || '',
      data: cellRows
    });
  }

  return result;
};

// ==================== 计算合计行 ====================
const recalculateTotalRow = (data: CellData[][]): void => {
  const totalRowIndex = data.findIndex(row => row[0]?.value === '合计');
  if (totalRowIndex === -1) return;

  let totalCalWeight = 0;
  let totalActWeight = 0;
  const weightedSums = new Array(10).fill(0); // 对应列 5~14 的加权值

  for (let row = 1; row < data.length; row++) {
    if (row === totalRowIndex) continue;
    const firstCell = data[row][0]?.value;
    if (firstCell === '合计') continue;

    const calWeightStr = data[row][3]?.value;
    const actWeightStr = data[row][4]?.value;
    const calWeight = parseFloat(calWeightStr) || 0;
    const actWeight = parseFloat(actWeightStr) || 0;

    totalCalWeight += calWeight;
    totalActWeight += actWeight;

    if (actWeight > 0) {
      // 列 5~14 (C%~Co%) => 加权索引 0~9
      for (let col = 5; col <= 14; col++) {
        const val = parseFloat(data[row][col]?.value) || 0;
        weightedSums[col - 5] += actWeight * val;
      }
    }
  }

  // 更新合计行
  data[totalRowIndex][3].value = totalCalWeight.toFixed(1);
  data[totalRowIndex][4].value = totalActWeight.toFixed(1);

  // 列 5~14
  for (let col = 5; col <= 14; col++) {
    const avg = totalActWeight > 0 ? (weightedSums[col - 5] / totalActWeight) : 0;
    const precision = (col === 8 || col === 9) ? 3 : 2; // P%, S% 保留3位
    data[totalRowIndex][col].value = avg.toFixed(precision);
  }
};

// ==================== 受保护行 ====================
const getProtectedRows = (basketIndex: number): number[] => {
  const basket = basketList.value[basketIndex];
  if (!basket) return [0];
  const protectedRows: number[] = [0]; // 表头
  for (let i = 1; i < basket.data.length; i++) {
    if (basket.data[i][0]?.value === '合计') {
      protectedRows.push(i);
    }
  }
  return protectedRows;
};

// ==================== Spreadsheet Ref 管理 ====================
const setSpreadsheetRef = (el: any, index: number) => {
  if (el) {
    spreadsheetRefs.value.set(index, el);
  }
};

// ==================== 事件处理 ====================
const handleCellUpdate = (basketIndex: number, row: number, col: number, value: any, selectedItem?: DataSourceItem) => {
  const basket = basketList.value[basketIndex];
  if (!basket) return;

  if (row >= 0 && row < basket.data.length && col >= 0 && col < basket.data[row].length) {
    basket.data[row][col].value = value;

    // 标记修改
    const cell = basket.data[row][col];
    if (cell) {
      cell.style = { ...(cell.style || {}), backgroundColor: 'lightgreen' };
    }

    // 物料名称列更新时自动填充
    if (col === 2 && row > 0) {
      const material = selectedItem || findMaterialByName(value);
      if (material) {
        // 确保当前行有足够的列数，防止访问越界
        while (basket.data[row].length < columnWidths.length) {
          basket.data[row].push({ value: '', format: 'text', alignment: 'center' as TextAlign });
        }
        if (material.storageArea) basket.data[row][17].value = material.storageArea;
        if (material.storageAreaCode !== undefined) basket.data[row][17].code = material.storageAreaCode;
        else if (material.storageArea !== undefined) basket.data[row][17].code = material.storageArea;
        if (material.code) basket.data[row][15].value = material.code;
        if (material.batchNumber) basket.data[row][16].value = material.batchNumber;
        if (material.c !== undefined) basket.data[row][5].value = material.c;
        if (material.si !== undefined) basket.data[row][6].value = material.si;
        if (material.mn !== undefined) basket.data[row][7].value = material.mn;
        if (material.p !== undefined) basket.data[row][8].value = material.p;
        if (material.s !== undefined) basket.data[row][9].value = material.s;
        if (material.cr !== undefined) basket.data[row][10].value = material.cr;
        if (material.ni !== undefined) basket.data[row][11].value = material.ni;
        if (material.mo !== undefined) basket.data[row][12].value = material.mo;
        if (material.cu !== undefined) basket.data[row][13].value = material.cu;
        if (material.co !== undefined) basket.data[row][14].value = material.co;

        const ref = spreadsheetRefs.value.get(basketIndex);
        if (ref) ref.setData(basket.data);
      }
    }

    // BUNKER_NO列修改时，同步更新basketNo和所有数据行
    if (col === 0 && row > 0) {
      basket.basketNo = value;
      for (let r = 1; r < basket.data.length; r++) {
        if (basket.data[r][0]?.value === '合计') continue;
        basket.data[r][0].value = value;
      }
      const ref = spreadsheetRefs.value.get(basketIndex);
      if (ref) ref.setData(basket.data);
    }

    // 重量或成分变化时重新计算合计
    if (row > 0 && (col === 3 || col === 4 || (col >= 5 && col <= 14))) {
      recalculateTotalRow(basket.data);
      const ref = spreadsheetRefs.value.get(basketIndex);
      if (ref) ref.setData(basket.data);
    }

    emitDataChange();
  }
};

const handleDataChange = (basketIndex: number, newData: CellData[][]) => {
  const basket = basketList.value[basketIndex];
  if (!basket) return;

  dataModified.value = true; // Spreadsheet 内部增删行列等结构性变更
  basket.data = newData;
  recalculateTotalRow(basket.data);

  // 重新设置数据源配置
  ensureDataSourceConfig(basket.data);

  // 重新处理rowspan：清除旧rowspan，找到第一个数据行重新设置
  let firstDataRow = -1;
  let dataRowCount = 0;
  for (let row = 1; row < basket.data.length; row++) {
    if (basket.data[row][0]?.value === '合计') continue;
    if (firstDataRow === -1) firstDataRow = row;
    dataRowCount++;
    delete basket.data[row][0].rowspan;
  }
  if (firstDataRow > 0 && dataRowCount > 1) {
    basket.data[firstDataRow][0].rowspan = dataRowCount;
  }

  // 确保所有行都有正确的列数，并统一数字列格式为右对齐
  const targetColCount = columnWidths.length;
  const numberCols = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  for (let row = 0; row < basket.data.length; row++) {
    while (basket.data[row].length < targetColCount) {
      basket.data[row].push({ value: '', format: 'text', alignment: 'center' as TextAlign });
    }
    for (const col of numberCols) {
      if (col < basket.data[row].length && basket.data[row][col]) {
        const cell = basket.data[row][col];
        if (cell.value !== '' && cell.value !== null && cell.value !== undefined) {
          const num = parseFloat(String(cell.value));
          if (!isNaN(num)) {
            if (!cell.format || cell.format === 'text') cell.format = 'number';
            cell.alignment = 'right' as TextAlign;
          }
        }
      }
    }
  }

  // 同步BUNKER_NO值：以第一个数据行的当前值为准，同步到所有数据行
  if (firstDataRow > 0) {
    const basketNo = String(basket.data[firstDataRow][0]?.value || basket.basketNo);
    for (let row = 1; row < basket.data.length; row++) {
      if (basket.data[row][0]?.value === '合计') continue;
      basket.data[row][0].value = basketNo;
    }
    basket.basketNo = basketNo;
  }

  const ref = spreadsheetRefs.value.get(basketIndex);
  if (ref) ref.setData(basket.data);

  emitDataChange();
};

const handleHeightChange = (basketIndex: number, height: number) => {
  // 高度变化处理（如需可通知父组件）
};

const handleMenuOpen = (openedIndex: number) => {
  // 关闭其他 Spreadsheet 实例的右键菜单
  spreadsheetRefs.value.forEach((ref, idx) => {
    if (idx !== openedIndex && ref) {
      ref.closeContextMenu?.();
    }
  });
};

const handleFormClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const isSpreadsheetClick = target.closest('.spreadsheet-container') !== null;
  if (!isSpreadsheetClick) {
    activeSpreadsheetIndex.value = -1;
    spreadsheetRefs.value.forEach(ref => ref.forceStopEditing?.());
  }
};

// ==================== 数据源配置 ====================
const ensureDataSourceConfig = (data: CellData[][]) => {
  if (!data || data.length === 0) return;
  for (let row = 1; row < data.length; row++) {
    if (!data[row]) continue;
    const firstCell = data[row][0]?.value;
    if (firstCell === '合计') continue;

    while (data[row].length < columnWidths.length) {
      data[row].push({ value: '', format: 'text', alignment: 'center' as TextAlign });
    }

    // 料篮号列
    if (!data[row][0].dataSource) {
      data[row][0] = createBasketNoCell(data[row][0]?.value || '');
    }
    // 物料名称列
    if (!data[row][2].dataSource) {
      data[row][2] = createMaterialNameCell(data[row][2]?.value || '');
    }
    // 配料重量列保护
    if (!data[row][3].isProtected) {
      data[row][3].isProtected = true;
    }
    // 物料代码列保护
    if (!data[row][15].isProtected) {
      data[row][15].isProtected = true;
    }
    // 元素列保护（C%~Co%）
    for (let col = 5; col <= 14; col++) {
      if (!data[row][col].isProtected) {
        data[row][col].isProtected = true;
      }
    }
    // 批次号列保护
    if (!data[row][16].isProtected) {
      data[row][16].isProtected = true;
    }
    // 库区列保护
    if (!data[row][17].isProtected) {
      data[row][17].isProtected = true;
    }
  }
};

// ==================== 物料查找 ====================
const findMaterialByName = (materialName: string): DataSourceItem | null => {
  const dataSource = props.materialDataSource || [];
  return dataSource.find(item => item.name === materialName) || null;
};

const emitDeleteBasketRequest = (index: number) => {
  const basketSeq = basketList.value[index]?.basketSeq || '';
  emit('delete-basket-request', index, basketSeq);
};

// ==================== 新增/删除篮 ====================
const addBasket = () => {
  // 计算新的篮序号
  let maxSeq = 0;
  for (const basket of basketList.value) {
    const seq = parseInt(basket.basketSeq, 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }
  const newSeq = String(maxSeq + 1);

  const cellRows: CellData[][] = [];
  cellRows.push(createHeaderRow());
  cellRows.push(createEmptyRow(''));
  cellRows.push(createTotalRow());

  recalculateTotalRow(cellRows);

  // 确保新增篮的数据结构完整（补齐列数、重置数据源等）
  ensureDataSourceConfig(cellRows);

  basketList.value.push({
    key: `basket-${newSeq}-${Date.now()}`,
    basketSeq: newSeq,
    basketNo: '',
    data: cellRows
  });

  dataModified.value = true;
  emitDataChange();
};

const deleteBasket = async (index: number) => {
  if (index < 0 || index >= basketList.value.length) return;

  // 注意：实际确认弹窗由父组件通过 erFormHelper.messageConfirm 处理
  // 这里先删除，父组件可以在调用前做确认
  basketList.value.splice(index, 1);

  // 重新编排剩余篮的序号
  basketList.value.forEach((basket, idx) => {
    const newSeq = String(idx + 1);
    if (basket.basketSeq !== newSeq) {
      basket.basketSeq = newSeq;
    }
  });

  // 重建refs映射
  spreadsheetRefs.value.clear();

  dataModified.value = true;
  emitDataChange();
};

// 带确认的删除（供父组件使用）
const deleteBasketWithConfirm = async (index: number, confirmFn: (msg: string) => Promise<boolean>) => {
  if (index < 0 || index >= basketList.value.length) return false;
  const basketSeq = basketList.value[index].basketSeq;
  const confirmed = await confirmFn(`确认删除第${basketSeq}篮？`);
  if (confirmed) {
    deleteBasket(index);
    return true;
  }
  return false;
};

// ==================== 修改检测 ====================
const hasDataChange = (): boolean => {
  if (dataModified.value) return true;
  for (const basket of basketList.value) {
    for (let row = 1; row < basket.data.length; row++) {
      if (basket.data[row][0]?.value === '合计') continue;
      for (let col = 0; col < basket.data[row].length; col++) {
        if (basket.data[row][col]?.style?.backgroundColor === 'lightgreen') {
          return true;
        }
      }
    }
  }
  return false;
};

// ==================== 数据导出 ====================
const emitDataChange = () => {
  const allData = basketList.value.map(b => b.data);
  emit('data-change', allData);
};

const getAllDataAsRaw = (): RawMaterialRow[] => {
  const result: RawMaterialRow[] = [];
  for (const basket of basketList.value) {
    const basketSeq = basket.basketSeq;
    let layerNo = 1;
    for (let row = 1; row < basket.data.length; row++) {
      if (basket.data[row][0]?.value === '合计') continue;
      result.push({
        BUNKER_SEQ: basketSeq,
        BUNKER_NO: String(basket.data[row][0]?.value || ''),
        LAYER_NO: String(layerNo),
        MAT_NAME: String(basket.data[row][2]?.value || ''),
        CAL_WEIGHT: String(basket.data[row][3]?.value || ''),
        ACT_WEIGHT: String(basket.data[row][4]?.value || ''),
        C_VALUE: String(basket.data[row][5]?.value || ''),
        SI_VALUE: String(basket.data[row][6]?.value || ''),
        MN_VALUE: String(basket.data[row][7]?.value || ''),
        P_VALUE: String(basket.data[row][8]?.value || ''),
        S_VALUE: String(basket.data[row][9]?.value || ''),
        CR_VALUE: String(basket.data[row][10]?.value || ''),
        NI_VALUE: String(basket.data[row][11]?.value || ''),
        MO_VALUE: String(basket.data[row][12]?.value || ''),
        CU_VALUE: String(basket.data[row][13]?.value || ''),
        CO_VALUE: String(basket.data[row][14]?.value || ''),
        MAT_CODE: String(basket.data[row][15]?.value || ''),
        LOT_NO: String(basket.data[row][16]?.value || ''),
        STOCK_NAME: String(basket.data[row][17]?.code || basket.data[row][17]?.value || ''),
      });
      layerNo++;
    }
  }
  return result;
};

// ==================== 监听 ====================
watch(() => props.rawData, (newData) => {
  if (newData) {
    basketList.value = buildBasketList(newData);
    dataModified.value = false; // 重新加载数据后重置变更标记
  }
}, { immediate: true, deep: true });

// ==================== 暴露方法 ====================
defineExpose({
  addBasket,
  deleteBasket,
  deleteBasketWithConfirm,
  getAllDataAsRaw,
  getBasketList: () => basketList.value,
  recalculateAllTotals: () => {
    basketList.value.forEach(basket => recalculateTotalRow(basket.data));
  },
  hasDataChange
});
</script>

<style lang="scss" scoped>
.form-layout {
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: auto;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.basket-section {
  height: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.basket-content {
  flex: 1;
  display: flex;
  gap: 8px;
  overflow: visible;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.basket-title {
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 0 0 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.basket-title-text {
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 8px;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: auto;
  min-width: 0;
  padding: 4px;
}

.spreadsheet-wrapper {
  flex: 1;
  border-radius: 4px;
  overflow: visible;
  height: auto;
  width: 100%;
  min-width: 0;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .basket-content {
    flex-direction: column;
  }

  .basket-title {
    width: 100%;
    height: 36px;
    border-radius: 4px 4px 0 0;
  }

  .basket-title-text {
    writing-mode: horizontal-tb;
    padding: 8px 15px;
  }
}
</style>
