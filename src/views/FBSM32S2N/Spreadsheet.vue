<template>
  <div class="spreadsheet-container" @click="closeContextMenu" :class="{ 'spreadsheet-active': props.active }"
    tabindex="0">
    <!-- 工具栏 - 只保留清空表格和格式选择 -->
    <!-- <div class="spreadsheet-toolbar">
      <button @click="clearAll" class="toolbar-btn">清空表格</button>
      <select v-model="selectedCellFormat" @change="applyFormat" class="format-select">
        <option value="text">文本</option>
        <option value="number">数字</option>
      </select>
    </div> -->

    <!-- 电子表格 -->
    <div class="spreadsheet-wrapper" @scroll="handleScroll" ref="spreadsheetWrapper">
      <!-- 列头 -->
      <div v-if="showColumnHeaders" class="column-headers">
        <div class="corner-cell"></div>
        <div v-for="col in visibleColumns" :key="col" class="column-header"
          :style="{ width: getColumnWidth(col) + 'px' }" @click="selectColumn(col, $event)"
          @contextmenu.prevent="showColumnContextMenu(col, $event)"
          :class="{ 'protected-column': isProtectedColumn(col) }">
          {{ getColumnName(col) }}
          <span v-if="isProtectedColumn(col)" class="protected-badge">锁</span>
        </div>
      </div>

      <!-- 行和单元格 -->
      <div class="spreadsheet-content">
        <!-- 行头 -->
        <div class="row-headers">
          <div v-for="row in visibleRows" :key="row" class="row-header" :style="{ height: rowHeight + 'px' }"
            @click="handleRowHeaderClick(row, $event)" @contextmenu.prevent="showRowContextMenu(row, $event)" :class="{
              'protected-row': isProtectedRow(row),
              'selectable-row': isRowSelectable(row)
            }">
            <!-- 复选框 -->
            <div v-if="props.showRowCheckboxes && isRowSelectable(row)" class="row-checkbox"
              @click.stop="toggleRowSelection(row)">
              <span v-if="selectedRowsSet.has(row)" class="checkbox-checked">✓</span>
              <span v-else class="checkbox-unchecked">□</span>
            </div>
            <div v-else class="row-checkbox-placeholder"></div>
            <!-- 行号 -->
            <span class="row-number">{{ row + 1 }}</span>
            <span v-if="isProtectedRow(row)" class="protected-badge">锁</span>
          </div>
        </div>

        <!-- 单元格区域 -->
        <div class="cells-area" ref="cellsArea">
          <div v-for="row in visibleRows" :key="row" class="row" :style="{ height: rowHeight + 'px' }">
            <template v-for="col in visibleColumns" :key="col">
              <div v-if="!isCellHiddenByColspan(row, col)" class="cell" :class="{
                'cell-selected': isSelected(row, col),
                'cell-editing': isEditing(row, col),
                'cell-has-data': hasData(row, col),
                'protected-cell': isProtectedCell(row, col),
                'header-row': row === 0,
                'protected-header': row === 0 && isProtectedCell(row, col)
              }" :style="getCellStyle(row, col) as any" @click="handleCellClick(row, col, $event)"
                @dblclick="handleDblClick(row, col, $event)"
                @contextmenu.prevent="showCellContextMenu(row, col, $event)" :data-row="row" :data-col="col">
                <!-- 内容显示区域，双击可编辑 -->
                <div v-if="!isEditing(row, col)" class="cell-display">
                  {{ formatCellValue(row, col) }}
                </div>
                <!-- 编辑状态时显示input -->
                <input v-else ref="cellInput" class="cell-input" type="text" :value="editingValue" @input="handleInput"
                  @keydown="handleKeyDown" @blur="handleBlur" @compositionstart="handleCompositionStart"
                  @compositionupdate="handleCompositionUpdate" @compositionend="handleCompositionEnd"
                  @keydown.229="handleKeyDown229" :readonly="isProtectedCell(row, col)" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="showContextMenu" class="context-menu"
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }" @click.stop>
      <div class="context-menu-item" @click="handleContextMenuAction('addRow')">
        <span class="menu-icon">+</span> 在上方插入行
      </div>
      <div class="context-menu-item" @click="handleContextMenuAction('addRowBelow')">
        <span class="menu-icon">+</span> 在下方插入行
      </div>
      <div v-if="contextMenuType === 'row' || contextMenuType === 'cell'" class="context-menu-item"
        @click="handleContextMenuAction('removeRow')" :class="{ 'disabled': isSelectedProtectedRow }">
        <span class="menu-icon">-</span> 删除行
        <span v-if="isSelectedProtectedRow" class="menu-hint">(受保护)</span>
      </div>
      <!--div class="divider"></div>
      <div class="context-menu-item" @click="handleContextMenuAction('addColumn')">
        <span class="menu-icon">+</span> 在左侧插入列
      </div>
      <div class="context-menu-item" @click="handleContextMenuAction('addColumnRight')">
        <span class="menu-icon">+</span> 在右侧插入列
      </div>
      <div v-if="contextMenuType === 'column' || contextMenuType === 'cell'" class="context-menu-item"
        @click="handleContextMenuAction('removeColumn')" :class="{ 'disabled': isSelectedProtectedColumn }">
        <span class="menu-icon">-</span> 删除列
        <span v-if="isSelectedProtectedColumn" class="menu-hint">(受保护)</span>
      </div-->
      <div class="divider"></div>
      <div class="context-menu-item" @click="handleContextMenuAction('clearCell')">
        <span class="menu-icon">×</span> 清空单元格
      </div>
      <div class="context-menu-item" @click="handleContextMenuAction('copy')">
        <span class="menu-icon">⎘</span> 复制
      </div>
      <div class="context-menu-item" @click="handleContextMenuAction('paste')">
        <span class="menu-icon">📋</span> 粘贴
      </div>
    </div>
  </div>

  <!-- 数据源选择弹窗遮罩层 -->
  <div v-if="showDataSourceDialog" class="data-source-mask" @click="closeDataSourceDialog"></div>

  <!-- 数据源选择弹窗 -->
  <div v-if="showDataSourceDialog && dataSourceDialogConfig" class="data-source-dialog" @click.stop>
    <div class="data-source-header">
      <div class="data-source-title">{{ dataSourceDialogConfig.title || '选择数据' }}</div>
      <button class="data-source-close" @click="closeDataSourceDialog">×</button>
    </div>

    <!-- 搜索框 -->
    <div v-if="dataSourceDialogConfig.searchable !== false" class="data-source-search">
      <input type="text" v-model="dataSourceSearchText" placeholder="输入关键词搜索..." class="search-input"
        @keydown.enter="confirmDataSourceSelection" />
    </div>

    <!-- 数据列表 -->
    <div class="data-source-list">
      <!-- 表头 -->
      <div v-if="dataSourceDialogConfig.columns && dataSourceDialogConfig.columns.length > 0"
        class="data-source-table-header">
        <div class="table-header-row">
          <div v-for="(col, colIndex) in dataSourceDialogConfig.columns" :key="colIndex" class="table-header-cell">
            {{ col }}
          </div>
        </div>
      </div>

      <!-- 数据行 -->
      <div class="data-source-table-body">
        <div v-for="(item, index) in dataSourceFilteredData" :key="index" class="data-source-table-row"
          :class="{ 'selected': dataSourceSelectedItem === item }" @click="selectDataSourceItem(item)">
          <!-- 显示多个字段 -->
          <template v-if="dataSourceDialogConfig.columns && dataSourceDialogConfig.columns.length > 0">
            <div v-for="(col, colIndex) in dataSourceDialogConfig.columns" :key="colIndex" class="table-data-cell">
              <span class="cell-value">{{ item[col] || '' }}</span>
            </div>
          </template>
          <template v-else>
            <!-- 如果没有定义列，显示单列 -->
            <div class="table-data-cell single-column">
              <span class="cell-value">{{ item.label || item.id || '' }}</span>
            </div>
          </template>
        </div>
      </div>

      <div v-if="dataSourceFilteredData.length === 0" class="data-source-empty">
        未找到匹配的数据
      </div>
    </div>

    <!-- 手动输入区域 -->
    <div class="data-source-input">
      <div class="input-label">或手动输入:</div>
      <input type="text" v-model="dataSourceManualInput" class="manual-input" placeholder="输入自定义值"
        @keydown.enter="confirmDataSourceSelection" />
    </div>

    <!-- 操作按钮 -->
    <div class="data-source-actions">
      <button class="btn-cancel" @click="closeDataSourceDialog">取消</button>
      <button class="btn-confirm" @click="confirmDataSourceSelection">确定</button>
    </div>
  </div>

  <!-- 内联编辑弹窗遮罩层 -->
  <div v-if="showInlineEditDialog" class="inline-edit-mask" @click="closeInlineEditDialog"></div>

  <!-- 小型输入框（靠近单元格） -->
  <div v-if="showInlineEditDialog && inlineEditDialogCell" class="cell-edit-popup"
    :style="{ top: inlineEditDialogPosition.y + 'px', left: inlineEditDialogPosition.x + 'px' }" @click.stop>
    <div class="cell-edit-input-wrapper">
      <input type="text" v-model="inlineEditDialogValue" class="cell-edit-input" placeholder="输入值"
        @keydown.enter="confirmInlineEdit" @keydown.esc="closeInlineEditDialog" ref="inlineEditInputRef" autofocus />
      <div class="cell-edit-buttons">
        <button class="cell-edit-btn cell-edit-btn-cancel" @click="closeInlineEditDialog" title="取消">
          <span class="cell-edit-icon">×</span>
        </button>
        <button class="cell-edit-btn cell-edit-btn-confirm" @click="confirmInlineEdit" title="确认">
          <span class="cell-edit-icon">✓</span>
        </button>
      </div>
    </div>
    <div v-if="inlineEditDialogError" class="cell-edit-error">
      {{ inlineEditDialogError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  reactive,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  CSSProperties,
  PropType
} from 'vue';

// 定义样式类型
export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
export type FontWeight = string | number;

export interface DataSourceItem {
  [key: string]: any; // 数据源项，可以有多个字段
  id?: string | number; // 唯一标识符
  label?: string; // 显示文本
}

export interface DataSourceConfig {
  data: DataSourceItem[]; // 数据源数组
  displayField?: string; // 显示字段名（默认为第一列）
  valueField?: string; // 值字段名（默认为第一列）
  searchable?: boolean; // 是否可搜索
  columns?: string[]; // 显示的列名
  title?: string; // 弹窗标题
}

export interface CellData {
  value: any;
  format?: string;
  alignment?: TextAlign;
  fontWeight?: FontWeight;
  isProtected?: boolean;
  dataSource?: DataSourceConfig; // 新增：数据源配置
  style?: CSSProperties; // 新增：自定义样式
  colspan?: number; // 新增：跨列合并单元格
  rowspan?: number; // 新增：跨行合并单元格
  coolCoef?: number; // 新增：冷却系数（仅计算用，不显示）
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const props = withDefaults(defineProps<{
  initialRows?: number;
  initialColumns?: number;
  data?: CellData[][];
  rowHeight?: number;
  columnWidth?: number | number[];
  showAddHints?: boolean;
  protectedRows?: number[];
  protectedColumns?: number[];
  autoHeight?: boolean; // 新增：是否自动高度
  showColumnHeaders?: boolean; // 新增：是否显示列头
  active?: boolean; // 新增：是否激活状态
  nonSelectableRowLabels?: string[]; // 不可选行的标签列表（第一列的值）
  showRowCheckboxes?: boolean; // 是否显示行复选框
  selectedRows?: number[]; // 选中的行索引数组
}>(), {
  initialRows: 5,
  initialColumns: 5,
  data: () => [],
  rowHeight: 35,
  columnWidth: 120,
  showAddHints: false,
  protectedRows: () => [],
  protectedColumns: () => [],
  autoHeight: false, // 默认不自动高度
  showColumnHeaders: true, // 默认显示列头
  active: false, // 默认不激活
  nonSelectableRowLabels: () => ['配料成分', '出钢成分', '内控上限', '内控目标', '内控下限', '备注', '预溶液成分'], // 默认不可选行标签
  showRowCheckboxes: true, // 默认显示行复选框
  selectedRows: () => [] // 默认选中的行索引数组
});

const emit = defineEmits<{
  'cell-update': [row: number, col: number, value: any];
  'selection-change': [selection: Selection];
  'data-change': [data: CellData[][]];
  'protected-operation-attempt': [type: 'row' | 'column', indices: number[]];
  'height-change': [height: number]; // 新增：高度变化事件
  'activated': []; // 新增：组件被激活事件
  'update:selectedRows': [selectedRows: number[]]; // 新增：选中行更新事件
}>();

// 响应式数据
const data = ref<CellData[][]>([]);

// 行选中状态管理
const selectedRowsSet = ref<Set<number>>(new Set());

// 计算选中的行数组（用于emit）
const selectedRowsArray = computed(() => Array.from(selectedRowsSet.value).sort((a, b) => a - b));

// 检查行是否可选
const isRowSelectable = (row: number): boolean => {
  // 如果行索引无效或数据为空，返回false
  if (row < 0 || !data.value[row]) return false;

  // 表头行（第一行）不可选
  if (row === 0) return false;

  // 如果第一列的值在不可选标签列表中，则不可选
  const firstCellValue = data.value[row][0]?.value;
  if (typeof firstCellValue === 'string' && props.nonSelectableRowLabels.includes(firstCellValue)) {
    return false;
  }

  // 默认物料行可选
  return true;
};

// 切换行选中状态
const toggleRowSelection = (row: number) => {
  if (!isRowSelectable(row)) return;

  const newSet = new Set(selectedRowsSet.value);
  if (newSet.has(row)) {
    newSet.delete(row);
  } else {
    newSet.add(row);
  }
  selectedRowsSet.value = newSet;

  // 触发更新事件
  emit('update:selectedRows', selectedRowsArray.value);
};

// 同步props.selectedRows到内部状态
watch(() => props.selectedRows, (newSelectedRows) => {
  if (newSelectedRows && Array.isArray(newSelectedRows)) {
    selectedRowsSet.value = new Set(newSelectedRows);
  }
}, { immediate: true });
const selection = reactive<Selection>({
  startRow: 0,
  startCol: 0,
  endRow: 0,
  endCol: 0
});

// 防止事件循环的标志
const isSettingDataExternally = ref(false);

const editingCell = ref<{ row: number, col: number } | null>(null);
const editingValue = ref('');
const selectedCellFormat = ref('text');
const isStoppingEditing = ref(false); // 防止stopEditing重入的标志

// 右键菜单相关
const showContextMenu = ref(false);
const contextMenuPosition = reactive({ x: 0, y: 0 });
const contextMenuType = ref<'cell' | 'row' | 'column'>('cell');
const contextMenuTarget = reactive({ row: 0, col: 0 });

// 剪贴板
const clipboard = ref<any[]>([]);

// ========== 强制铺满画面：容器宽度监听 ==========
const containerWidth = ref(0);
let resizeObserver: any = null;
let resizeTimer: any = null;

const startResizeObserver = () => {
  if (!spreadsheetWrapper.value) return;

  let isProcessing = false; // 添加处理锁

  resizeObserver = new ResizeObserver((entries) => {
    if (isProcessing) return; // 如果正在处理，跳过

    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isProcessing = true;
      try {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          // 增加阈值到 10px，减少敏感度
          if (Math.abs(newWidth - containerWidth.value) > 10) {
            containerWidth.value = newWidth;
          }
        }
      } finally {
        // 延迟释放锁，确保渲染完成
        setTimeout(() => { isProcessing = false; }, 100);
      }
    }, 50); // 增加防抖时间到 200ms
  });

  resizeObserver.observe(spreadsheetWrapper.value);
  containerWidth.value = spreadsheetWrapper.value.clientWidth;
};

const stopResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
};

// ============================================

// 输入法相关变量
const isComposing = ref(false);
const compositionValue = ref('');
const pendingInputValue = ref('');

// 数据源弹窗相关
const showDataSourceDialog = ref(false);
const dataSourceDialogConfig = ref<DataSourceConfig | null>(null);
const dataSourceDialogCell = ref<{ row: number, col: number } | null>(null);
const dataSourceSearchText = ref('');
const dataSourceFilteredData = ref<DataSourceItem[]>([]);
const dataSourceSelectedItem = ref<DataSourceItem | null>(null);
const dataSourceManualInput = ref('');

// 内联编辑弹窗相关
const showInlineEditDialog = ref(false);
const inlineEditDialogCell = ref<{ row: number, col: number } | null>(null);
const inlineEditDialogValue = ref('');
const inlineEditDialogPosition = reactive({ x: 0, y: 0 });
const inlineEditDialogError = ref('');

// 单元格编辑原始值（用于ESC取消时恢复）
const originalEditingValue = ref('');


// 引用
const cellsArea = ref<HTMLElement>();
const cellInput = ref<HTMLInputElement[]>([]);
const spreadsheetWrapper = ref<HTMLElement>();
const currentInputElement = ref<HTMLInputElement | null>(null); // 当前编辑的输入框元素引用
const inlineEditInputRef = ref<HTMLInputElement>(); // 内联编辑输入框引用

// 计算列数
const columnCount = computed(() => {
  if (data.value.length === 0) return props.initialColumns;
  return Math.max(...data.value.map(row => row.length), props.initialColumns);
});

// 获取列宽
const getColumnWidth = (col: number): number => {
  if (!Array.isArray(props.columnWidth)) {
    return props.columnWidth as number;
  }

  //console.log('containerWidth',containerWidth);
  // 如果没有容器宽度（初始化时），先用原配置值
  if (containerWidth.value === 0) {
    return 0; // 返回0让CSS处理，或返回最小值
  }

  // 计算总权重（允许列宽为0，即隐藏列）
  const totalWeight = props.columnWidth.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  // 可用宽度 = 容器宽度 - 行号列宽度(50px)
  const availableWidth = Math.max(containerWidth.value - 50, 0);
  // 防止越界返回 NaN
  if (props.columnWidth[col] === undefined) {
    return 0;
  }
  const ratio = props.columnWidth[col] / totalWeight;

  // 计算列宽，不设最小限制，强制按比例铺满
  return availableWidth * ratio;
};

// 计算可见行和列
const visibleRows = computed(() => {
  const rowCount = Math.max(data.value.length, 1);
  return Array.from({ length: rowCount }, (_, i) => i);
});

const visibleColumns = computed(() => {
  return Array.from({ length: columnCount.value }, (_, i) => i);
});

// 计算总高度
const totalHeight = computed((): number => {
  if (!props.autoHeight) return 0;

  // 工具栏高度 (36px) + 列头高度 (28px，如果显示) + 行数 * 行高
  const toolbarHeight = 36;
  const columnHeaderHeight = props.showColumnHeaders ? 28 : 0;
  const rowCount = data.value.length || props.initialRows;
  const rowsHeight = rowCount * props.rowHeight;

  // 添加一些额外空间防止滚动条
  const extraSpace = 5;

  return toolbarHeight + columnHeaderHeight + rowsHeight + extraSpace;
});

// 更新容器高度
const updateContainerHeight = () => {
  if (!props.autoHeight || !totalHeight.value || totalHeight.value <= 0) return;

  nextTick(() => {
    if (spreadsheetWrapper.value) {
      spreadsheetWrapper.value.style.height = totalHeight.value + 'px';
      // 确保传递的是数字类型
      emit('height-change', totalHeight.value);
    }
  });
};

// 检查选中的行是否包含受保护的行
const isSelectedProtectedRow = computed(() => {
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);

  for (let row = startRow; row <= endRow; row++) {
    if (isProtectedRow(row)) {
      return true;
    }
  }
  return false;
});

// 检查选中的列是否包含受保护的列
const isSelectedProtectedColumn = computed(() => {
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  for (let col = startCol; col <= endCol; col++) {
    if (isProtectedColumn(col)) {
      return true;
    }
  }
  return false;
});

const selectedCells = computed(() => {
  const cells = [];
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push({ row, col });
    }
  }
  return cells;
});

// 检查行是否受保护
const isProtectedRow = (row: number): boolean => {
  return props.protectedRows.includes(row);
};

// 检查列是否受保护
const isProtectedColumn = (col: number): boolean => {
  return props.protectedColumns.includes(col);
};

// 检查单元格是否受保护
const isProtectedCell = (row: number, col: number): boolean => {
  if (row === 0) {
    return true;
  }

  const cell = getCellAt(row, col);
  return isProtectedRow(row) || isProtectedColumn(col) || (cell?.isProtected === true);
};

// 获取单元格样式
const getCellStyle = (row: number, col: number): CSSProperties => {
  const cell = getCellAt(row, col);
  const columnWidth = getColumnWidth(col);

  // 计算colspan单元格的总宽度
  let totalWidth = columnWidth;
  if (cell?.colspan && cell.colspan > 1) {
    totalWidth = columnWidth;
    for (let i = 1; i < cell.colspan; i++) {
      const nextWidth = getColumnWidth(col + i);
      if (!isNaN(nextWidth)) {
        totalWidth += nextWidth;
      }
    }
  }

  let baseStyle: CSSProperties;
  if (row === 0) {
    baseStyle = {
      width: totalWidth + 'px',
      textAlign: cell?.alignment || (col === 0 ? 'left' : 'center'),
      fontWeight: cell?.fontWeight || 'bold',
      backgroundColor: '#f0f7ff',
      color: '#1890ff',
      borderBottom: '2px solid #1890ff'
    };
  } else {
    baseStyle = {
      width: totalWidth + 'px',
      textAlign: cell?.alignment || (col === 0 ? 'left' : 'center'),
      fontWeight: cell?.fontWeight || 'normal',
      backgroundColor: isProtectedCell(row, col) ? '#f5f5f5' : 'white'
    };
  }

  // 合并自定义样式
  if (cell?.style) {
    return { ...baseStyle, ...cell.style } as CSSProperties;
  }

  return baseStyle as CSSProperties;
};

// 初始化数据
const initializeData = () => {
  console.log('initializeData called, props.data:', props.data);

  if (props.data && props.data.length > 0) {
    console.log('Using props.data:', props.data);
    data.value = JSON.parse(JSON.stringify(props.data));

    data.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell) {
          data.value[rowIndex][colIndex] = {
            value: '',
            format: 'text',
            alignment: 'left' as TextAlign
          };
          return;
        }

        if (!cell.format) {
          const value = cell.value;
          if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
            cell.format = 'number';
          } else {
            cell.format = 'text';
          }
        }

        if (!cell.alignment) {
          if (cell.format === 'number') {
            cell.alignment = 'right' as TextAlign;
          } else {
            cell.alignment = 'center' as TextAlign;
          }
        }

        if (rowIndex === 0) {
          cell.fontWeight = cell.fontWeight || 'bold';
          cell.alignment = cell.alignment || 'center' as TextAlign;
        }
      });
    });
  } else {
    console.log('Creating initial data');
    data.value = Array.from({ length: props.initialRows }, () =>
      Array.from({ length: props.initialColumns }, () => ({
        value: '',
        format: 'text',
        alignment: 'center' as TextAlign
      }))
    );
  }

  console.log('Initialized data:', data.value);

  // 初始化后更新高度
  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 获取单元格数据
const getCellAt = (row: number, col: number): CellData | null => {
  if (row >= data.value.length) return null;
  if (col >= data.value[row].length) return null;
  return data.value[row][col];
};

// 检查单元格是否被合并单元格隐藏（只检查colspan）
const isCellHiddenByColspan = (row: number, col: number): boolean => {
  // 检查左侧单元格是否有colspan覆盖到当前位置
  for (let c = 0; c < col; c++) {
    const cell = getCellAt(row, c);
    if (cell && cell.colspan && cell.colspan > 1) {
      // 如果左侧单元格的colspan覆盖到当前位置
      const spanEnd = c + (cell.colspan - 1);
      if (col <= spanEnd) {
        return true; // 当前单元格被左侧单元格的colspan覆盖
      }
    }
  }
  return false;
};

// 检查单元格是否有数据
const hasData = (row: number, col: number): boolean => {
  const cell = getCellAt(row, col);
  if (!cell) {
    return false;
  }

  const value = cell.value;
  return value !== '' && value !== null && value !== undefined;
};

// 获取单元格值
const getCellValue = (row: number, col: number) => {
  const cell = getCellAt(row, col);
  if (!cell) return '';
  return cell.value;
};

const formatCellValue = (row: number, col: number): string => {
  const cell = getCellAt(row, col);
  if (!cell) return '';

  const value = cell.value;
  if (value === null || value === undefined || value === '') return '';

  if (cell.format && cell.format.startsWith('number')) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return String(value);
    }

    if (Number.isInteger(num)) {
      return num.toLocaleString();
    }

    // 解析精度，格式如 'number:2' 或 'number:3'
    let precision = 2; // 默认精度
    if (cell.format.includes(':')) {
      const parts = cell.format.split(':');
      if (parts.length > 1) {
        const parsed = parseInt(parts[1], 10);
        if (!isNaN(parsed) && parsed >= 0) {
          precision = parsed;
        }
      }
    } else {
      // 旧格式 'number'，保持原有行为，最多4位小数
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      });
    }

    // 四舍五入到指定精度
    const rounded = Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
    // 检查四舍五入后是否为整数（考虑浮点数精度误差）
    const isIntegerAfterRounding = Math.abs(rounded - Math.round(rounded)) < 1e-10;

    // 使用指定精度格式化，如果四舍五入后是整数则不显示小数部分
    if (isIntegerAfterRounding) {
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      // 显示四舍五入后的值，保留指定小数位
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      });
    }
  }

  return String(value);
};

// 单元格单击处理
const handleCellClick = (row: number, col: number, event: MouseEvent) => {
  // console.log('单元格单击:', row, col);

  // 阻止事件冒泡，避免触发父级的点击事件
  event.stopPropagation();

  // 如果数据源弹窗打开，禁用其他操作
  if (showDataSourceDialog.value) {
    return;
  }

  ensureRowExists(row);
  ensureColumnExists(col);

  if (event.shiftKey) {
    selection.endRow = row;
    selection.endCol = col;
  } else {
    selection.startRow = selection.endRow = row;
    selection.startCol = selection.endCol = col;
    editingCell.value = null;
  }

  // 触发激活事件
  if (!props.active) {
    emit('activated');
  }

  emit('selection-change', { ...selection });
};

// 单元格双击处理
const handleDblClick = (row: number, col: number, event: MouseEvent) => {
  // console.log('单元格双击:', row, col);

  // 如果数据源弹窗打开，禁用其他操作
  if (showDataSourceDialog.value) {
    event.stopPropagation();
    return;
  }

  // 如果单元格受保护，不能编辑
  if (isProtectedCell(row, col)) {
    // console.log('单元格受保护，不能编辑');
    return;
  }

  selection.startRow = selection.endRow = row;
  selection.startCol = selection.endCol = col;

  // 检查是否需要激活组件
  if (!props.active) {
    // console.log('组件未激活，先触发激活事件');
    emit('activated');

    // 使用nextTick确保父组件有时间处理激活事件
    nextTick(() => {
      executeEditLogic(row, col, event);
    });
  } else {
    // 组件已经激活，直接执行编辑逻辑
    executeEditLogic(row, col, event);
  }

  emit('selection-change', { ...selection });
};


// 执行编辑逻辑的辅助函数
const executeEditLogic = (row: number, col: number, event: MouseEvent) => {
  // 检查单元格是否有数据源配置
  const cell = getCellAt(row, col);
  if (cell?.dataSource) {
    // 有数据源，弹出数据源选择弹窗
    openDataSourceDialog(row, col, event);
  } else {
    // 没有数据源，直接启动单元格编辑
    startEditing(row, col, event);
    //openInlineEditDialog(row, col, event);
  }
};

// 打开数据源选择弹窗
const openDataSourceDialog = (row: number, col: number, event: MouseEvent) => {
  // console.log('打开数据源选择弹窗:', row, col);

  const cell = getCellAt(row, col);
  if (!cell?.dataSource) return;

  // 设置弹窗配置
  dataSourceDialogConfig.value = cell.dataSource;
  dataSourceDialogCell.value = { row, col };
  dataSourceSearchText.value = '';
  dataSourceManualInput.value = cell.value || '';
  dataSourceSelectedItem.value = null;

  // 初始化筛选数据
  filterDataSourceData();

  // 显示弹窗
  showDataSourceDialog.value = true;

  event.stopPropagation();
};

// 打开内联编辑弹窗
const openInlineEditDialog = (row: number, col: number, event: MouseEvent) => {
  // console.log('打开内联编辑弹窗:', row, col);

  const cell = getCellAt(row, col);
  if (!cell) return;

  // 设置弹窗配置
  inlineEditDialogCell.value = { row, col };
  inlineEditDialogValue.value = cell.value || '';
  inlineEditDialogError.value = '';

  // 先不显示弹窗，等待DOM更新后再计算位置
  event.stopPropagation();

  // 使用nextTick确保DOM已更新
  nextTick(() => {
    // 计算弹窗位置（靠近单元格）
    calculateInlineEditDialogPosition(row, col, event);

    // 显示弹窗
    showInlineEditDialog.value = true;

    // 聚焦输入框
    nextTick(() => {
      if (inlineEditInputRef.value) {
        inlineEditInputRef.value.focus();
        inlineEditInputRef.value.select();
      }
    });
  });
};

// 计算小型输入框位置（靠近单元格）
const calculateInlineEditDialogPosition = (row: number, col: number, event?: MouseEvent) => {
  console.log('计算输入框位置，单元格:', row, col, '事件:', event ? '有' : '无');

  // 优先使用鼠标双击事件坐标（用户期望在双击位置附近）
  if (event) {
    console.log('优先使用事件坐标:', event.clientX, event.clientY);

    // 首先尝试从事件目标查找单元格和容器
    let targetCellElement: HTMLElement | null = null;

    // 从点击目标向上查找.cell元素
    let target: HTMLElement | null = event.target as HTMLElement;
    for (let i = 0; i < 5; i++) {
      if (!target) break;
      if (target.classList && target.classList.contains('cell')) {
        targetCellElement = target;
        break;
      }
      target = target.parentElement;
    }

    // 如果找到单元格元素，使用单元格位置（更精确）
    if (targetCellElement) {
      console.log('从事件目标找到单元格元素，使用单元格位置');
      const rect = targetCellElement.getBoundingClientRect();

      // 将输入框定位在单元格右下角，带有一点偏移
      let x = rect.right + 5;
      let y = rect.bottom + 5;

      const popupWidth = 200;
      const popupHeight = 60;

      // 如果右侧空间不足，显示在左侧
      if (x + popupWidth > window.innerWidth) {
        x = rect.left - popupWidth - 5;
        if (x < 10) x = window.innerWidth - popupWidth - 10;
      }

      // 如果底部空间不足，显示在上方
      if (y + popupHeight > window.innerHeight) {
        y = rect.top - popupHeight - 5;
        if (y < 10) y = window.innerHeight - popupHeight - 10;
      }

      // 确保在视口内
      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

      console.log('基于单元格的最终位置:', x, y);
      inlineEditDialogPosition.x = x;
      inlineEditDialogPosition.y = y;
      return;
    }

    // 如果没找到单元格，使用鼠标坐标
    console.log('未从事件目标找到单元格，使用鼠标坐标');
    let x = event.clientX + 10;
    let y = event.clientY + 10;

    const popupWidth = 200;
    const popupHeight = 60;

    // 确保在视口内
    x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

    console.log('基于事件坐标的最终位置:', x, y);
    inlineEditDialogPosition.x = x;
    inlineEditDialogPosition.y = y;
    return;
  }

  // 如果没有事件坐标，尝试查找单元格
  console.log('无事件坐标，尝试查找单元格元素');

  // 尝试在当前激活的组件内查找
  const activeContainer = document.querySelector('.spreadsheet-container.spreadsheet-active') as HTMLElement | null;
  const container = activeContainer || document.querySelector('.spreadsheet-container') as HTMLElement | null;

  let cellElement: HTMLElement | null = null;

  if (container) {
    console.log('找到spreadsheet容器，在容器内查找');
    const selector = `.cell[data-row="${row}"][data-col="${col}"]`;
    cellElement = container.querySelector(selector);
  }

  // 如果在容器内没找到，尝试全局查找
  if (!cellElement) {
    console.log('在容器内未找到，尝试全局查找');
    const globalSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
    cellElement = document.querySelector(globalSelector);
  }

  if (cellElement) {
    console.log('找到单元格元素:', cellElement);
    const rect = cellElement.getBoundingClientRect();
    console.log('单元格位置:', rect);

    // 检查矩形是否有效
    if (rect.width > 0 && rect.height > 0) {
      // 将输入框定位在单元格右下角，带有一点偏移
      let x = rect.right + 5;
      let y = rect.bottom + 5;

      const popupWidth = 200;
      const popupHeight = 60;

      console.log('基于单元格的初始位置:', x, y, '视口尺寸:', window.innerWidth, window.innerHeight);

      // 如果右侧空间不足，显示在左侧
      if (x + popupWidth > window.innerWidth) {
        console.log('右侧空间不足，调整到左侧');
        x = rect.left - popupWidth - 5;
        if (x < 10) x = window.innerWidth - popupWidth - 10;
      }

      // 如果底部空间不足，显示在上方
      if (y + popupHeight > window.innerHeight) {
        console.log('底部空间不足，调整到上方');
        y = rect.top - popupHeight - 5;
        if (y < 10) y = window.innerHeight - popupHeight - 10;
      }

      // 确保最小边距
      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

      console.log('基于单元格的最终位置:', x, y);
      inlineEditDialogPosition.x = x;
      inlineEditDialogPosition.y = y;
      return;
    } else {
      console.warn('单元格矩形无效（可能隐藏）');
    }
  } else {
    console.warn('未找到单元格元素');
  }

  // 备用方案：屏幕中央
  console.log('使用默认屏幕中央位置');
  inlineEditDialogPosition.x = window.innerWidth / 2 - 100;
  inlineEditDialogPosition.y = window.innerHeight / 2 - 30;
};
/*
  console.log('计算输入框位置，单元格:', row, col, '事件:', event ? '有' : '无');

  // 首先检查当前组件范围内的单元格
  const containerSelector = '.spreadsheet-container.spreadsheet-active, .spreadsheet-container:not(.spreadsheet-active):first-of-type';
  const spreadsheetContainer = document.querySelector(containerSelector) as HTMLElement;

  if (spreadsheetContainer) {
    console.log('找到spreadsheet容器:', spreadsheetContainer);

    // 在容器内部查找单元格
    const selector = `.cell[data-row="${row}"][data-col="${col}"]`;
    const cellElement = spreadsheetContainer.querySelector(selector) as HTMLElement;

    if (cellElement) {
      console.log('在容器内找到单元格元素:', cellElement);
      const rect = cellElement.getBoundingClientRect();
      console.log('单元格位置:', rect);

      // 检查矩形是否有效（元素可能隐藏或不在视口内）
      if (rect.width === 0 || rect.height === 0) {
        console.warn('单元格矩形无效（可能隐藏），使用备用位置');
        if (event) {
          console.log('使用事件坐标作为备用:', event.clientX, event.clientY);
          let x = event.clientX + 10;
          let y = event.clientY + 10;

          const popupWidth = 200;
          const popupHeight = 60;

          x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
          y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

          inlineEditDialogPosition.x = x;
          inlineEditDialogPosition.y = y;
          return;
        } else {
          console.log('使用默认屏幕中央位置作为备用');
          inlineEditDialogPosition.x = window.innerWidth / 2 - 100;
          inlineEditDialogPosition.y = window.innerHeight / 2 - 30;
          return;
        }
      }

      // 将输入框定位在单元格右下角，带有一点偏移
      let x = rect.right + 5;
      let y = rect.bottom + 5;

      // 输入框尺寸大约为 200x60（包含错误信息）
      const popupWidth = 1000;
      const popupHeight = 60;

      console.log('初始位置:', x, y, '视口尺寸:', window.innerWidth, window.innerHeight);

      // 如果右侧空间不足，显示在左侧
      if (x + popupWidth > window.innerWidth) {
        console.log('右侧空间不足，调整到左侧');
        x = rect.left - popupWidth - 5;
        // 如果左侧空间也不足，调整到视口内
        if (x < 10) x = window.innerWidth - popupWidth - 10;
      }

      // 如果底部空间不足，显示在上方
      if (y + popupHeight > window.innerHeight) {
        console.log('底部空间不足，调整到上方');
        y = rect.top - popupHeight - 5;
        // 如果上方空间也不足，调整到视口内
        if (y < 10) y = window.innerHeight - popupHeight - 10;
      }

      // 确保最小边距
      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

      console.log('最终位置:', x, y);
      inlineEditDialogPosition.x = x;
      inlineEditDialogPosition.y = y;
      return;
    } else {
      console.warn(`在容器内找不到单元格元素: ${selector}`);
    }
  } else {
    console.warn('找不到spreadsheet容器，尝试全局查找');
  }

  // 备用方案：全局查找单元格
  console.log('尝试全局查找.cell元素');
  const globalSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
  const globalCellElement = document.querySelector(globalSelector) as HTMLElement;

  if (!globalCellElement) {
    console.warn(`全局也找不到单元格元素: ${globalSelector}`);

    // 如果找不到单元格，尝试使用事件坐标
    if (event) {
      console.log('使用事件坐标:', event.clientX, event.clientY);
      let x = event.clientX + 10;
      let y = event.clientY + 10;

      const popupWidth = 200;
      const popupHeight = 60;

      // 确保在视口内
      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

      inlineEditDialogPosition.x = x;
      inlineEditDialogPosition.y = y;
      return;
    }

    // 如果也没有事件，默认在屏幕中央
    console.log('使用默认屏幕中央位置');
    inlineEditDialogPosition.x = window.innerWidth / 2 - 100;
    inlineEditDialogPosition.y = window.innerHeight / 2 - 30;
    return;
  }

  console.log('全局找到单元格元素:', globalCellElement);
  const rect = globalCellElement.getBoundingClientRect();
  console.log('单元格位置:', rect);

  // 检查矩形是否有效（元素可能隐藏或不在视口内）
  if (rect.width === 0 || rect.height === 0) {
    console.warn('单元格矩形无效（可能隐藏），使用备用位置');
    if (event) {
      console.log('使用事件坐标作为备用:', event.clientX, event.clientY);
      let x = event.clientX + 10;
      let y = event.clientY + 10;

      const popupWidth = 200;
      const popupHeight = 60;

      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

      inlineEditDialogPosition.x = x;
      inlineEditDialogPosition.y = y;
      return;
    } else {
      console.log('使用默认屏幕中央位置作为备用');
      inlineEditDialogPosition.x = window.innerWidth / 2 - 100;
      inlineEditDialogPosition.y = window.innerHeight / 2 - 30;
      return;
    }
  }

  // 将输入框定位在单元格右下角，带有一点偏移
  let x = rect.right + 5;
  let y = rect.bottom + 5;

  // 输入框尺寸大约为 200x60（包含错误信息）
  const popupWidth = 1000;
  const popupHeight = 60;

  console.log('初始位置:', x, y, '视口尺寸:', window.innerWidth, window.innerHeight);

  // 如果右侧空间不足，显示在左侧
  if (x + popupWidth > window.innerWidth) {
    console.log('右侧空间不足，调整到左侧');
    x = rect.left - popupWidth - 5;
    // 如果左侧空间也不足，调整到视口内
    if (x < 10) x = window.innerWidth - popupWidth - 10;
  }

  // 如果底部空间不足，显示在上方
  if (y + popupHeight > window.innerHeight) {
    console.log('底部空间不足，调整到上方');
    y = rect.top - popupHeight - 5;
    // 如果上方空间也不足，调整到视口内
    if (y < 10) y = window.innerHeight - popupHeight - 10;
  }

  // 确保最小边距
  x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
  y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));

  console.log('最终位置:', x, y);
  inlineEditDialogPosition.x = x;
  inlineEditDialogPosition.y = y;
*/


// 筛选数据源数据
const filterDataSourceData = () => {
  if (!dataSourceDialogConfig.value) {
    dataSourceFilteredData.value = [];
    return;
  }

  const searchText = dataSourceSearchText.value.toLowerCase();
  const data = dataSourceDialogConfig.value.data;

  if (!searchText) {
    dataSourceFilteredData.value = [...data];
    return;
  }

  // 根据显示字段进行筛选
  const displayField = dataSourceDialogConfig.value.displayField ||
    (dataSourceDialogConfig.value.columns?.[0] || 'label');

  dataSourceFilteredData.value = data.filter(item => {
    const displayValue = String(item[displayField] || item.label || '').toLowerCase();
    return displayValue.includes(searchText);
  });
};

// 显示单元格右键菜单
const showCellContextMenu = (row: number, col: number, event: MouseEvent) => {
  // console.log('显示单元格右键菜单:', row, col);

  // 如果数据源弹窗打开，禁用其他操作
  if (showDataSourceDialog.value) {
    event.stopPropagation();
    return;
  }

  selection.startRow = selection.endRow = row;
  selection.startCol = selection.endCol = col;

  showContextMenu.value = true;
  contextMenuPosition.x = event.clientX;
  contextMenuPosition.y = event.clientY;
  contextMenuType.value = 'cell';
  contextMenuTarget.row = row;
  contextMenuTarget.col = col;

  emit('selection-change', { ...selection });
};

// 显示行头右键菜单
const showRowContextMenu = (row: number, event: MouseEvent) => {
  // console.log('显示行头右键菜单:', row);

  // 如果数据源弹窗打开，禁用其他操作
  if (showDataSourceDialog.value) {
    event.stopPropagation();
    return;
  }

  selection.startRow = selection.endRow = row;
  selection.startCol = 0;
  selection.endCol = columnCount.value - 1;

  showContextMenu.value = true;
  contextMenuPosition.x = event.clientX;
  contextMenuPosition.y = event.clientY;
  contextMenuType.value = 'row';
  contextMenuTarget.row = row;
  contextMenuTarget.col = 0;

  emit('selection-change', { ...selection });
};

// 显示列头右键菜单
const showColumnContextMenu = (col: number, event: MouseEvent) => {
  // console.log('显示列头右键菜单:', col);

  // 如果数据源弹窗打开，禁用其他操作
  if (showDataSourceDialog.value) {
    event.stopPropagation();
    return;
  }

  selection.startCol = selection.endCol = col;
  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  showContextMenu.value = true;
  contextMenuPosition.x = event.clientX;
  contextMenuPosition.y = event.clientY;
  contextMenuType.value = 'column';
  contextMenuTarget.row = 0;
  contextMenuTarget.col = col;

  emit('selection-change', { ...selection });
};

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false;
};

// 处理右键菜单操作
const handleContextMenuAction = (action: string) => {
  // console.log('右键菜单操作:', action);

  switch (action) {
    case 'addRow':
      insertRowAbove();
      break;
    case 'addRowBelow':
      insertRowBelow();
      break;
    case 'removeRow':
      if (isSelectedProtectedRow.value) {
        alert('选中的行包含受保护的行，不能删除');
        emit('protected-operation-attempt', 'row', selectedCells.value.map(cell => cell.row));
        return;
      }
      removeSelectedRow();
      break;
    case 'addColumn':
      insertColumnLeft();
      break;
    case 'addColumnRight':
      insertColumnRight();
      break;
    case 'removeColumn':
      if (isSelectedProtectedColumn.value) {
        alert('选中的列包含受保护的列，不能删除');
        emit('protected-operation-attempt', 'column', selectedCells.value.map(cell => cell.col));
        return;
      }
      removeSelectedColumn();
      break;
    case 'clearCell':
      const hasProtectedCell = selectedCells.value.some(({ row, col }) => isProtectedCell(row, col));
      if (hasProtectedCell) {
        alert('选中的单元格包含受保护的单元格，不能清空');
        return;
      }
      removeSelected();
      break;
    case 'copy':
      copySelection();
      break;
    case 'paste':
      pasteSelection();
      break;
  }

  closeContextMenu();
};

const selectColumn = (col: number, event?: MouseEvent) => {
  // console.log('选择列:', col);

  if (event) {
    event.stopPropagation();
  }

  selection.startCol = selection.endCol = col;
  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  // 触发激活事件
  if (!props.active) {
    emit('activated');
  }

  emit('selection-change', { ...selection });
};


const handleRowHeaderClick = (row: number, event?: MouseEvent) => {
  if (event) {
    event.stopPropagation();
  }

  // 如果是可选行，则选择整行
  if (isRowSelectable(row)) {
    // 保持原有行选择行为
    selection.startRow = selection.endRow = row;
    selection.startCol = 0;
    selection.endCol = columnCount.value - 1;

    // 触发激活事件
    if (!props.active) {
      emit('activated');
    }

    emit('selection-change', { ...selection });
  } else {
    // 对于不可选行，仍然设置选择但可能不显示复选框
    selection.startRow = selection.endRow = row;
    selection.startCol = 0;
    selection.endCol = columnCount.value - 1;

    if (!props.active) {
      emit('activated');
    }

    emit('selection-change', { ...selection });
  }
};

const isSelected = (row: number, col: number): boolean => {
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
};

// 编辑操作
const startEditing = (row: number, col: number, event: MouseEvent) => {
  // console.log('开始编辑单元格:', row, col);

  // 先停止当前编辑状态（如果有的话）
  if (editingCell.value) {
    stopEditing();
  }

  ensureRowExists(row);
  ensureColumnExists(col);

  editingCell.value = { row, col };

  isComposing.value = false;
  compositionValue.value = '';
  pendingInputValue.value = '';

  const cell = getCellAt(row, col);
  const originalValue = cell?.value || '';
  editingValue.value = originalValue;
  originalEditingValue.value = originalValue;

  event.stopPropagation();

  nextTick(() => {
    setTimeout(() => {
      const cellIndex = row * columnCount.value + col;
      if (cellInput.value && cellInput.value[cellIndex]) {
        const element = cellInput.value[cellIndex] as HTMLInputElement;
        element.value = editingValue.value;
        element.focus({ preventScroll: true });
        element.select();
        currentInputElement.value = element; // 保存当前输入框引用
        // console.log('Cell input focused via ref array');
        return;
      }

      const editingCells = document.querySelectorAll('.cell-editing .cell-input');
      if (editingCells.length > 0) {
        const element = editingCells[0] as HTMLInputElement;
        element.value = editingValue.value;
        element.focus({ preventScroll: true });
        element.select();
        currentInputElement.value = element; // 保存当前输入框引用
        // console.log('Cell input focused via selector');
        return;
      }

      // console.error('Cell input element not found');
    }, 0);
  });
};

// 确保行存在
const ensureRowExists = (row: number) => {
  while (data.value.length <= row) {
    data.value.push([]);
  }
};

// 确保列存在
const ensureColumnExists = (col: number) => {
  data.value.forEach((rowData, rowIndex) => {
    while (rowData.length <= col) {
      rowData.push({
        value: '',
        format: 'text',
        alignment: 'center' as TextAlign
      });
    }
  });
};

// 处理输入事件
const handleInput = (event: Event) => {
  if (!editingCell.value) return;

  const target = event.target as HTMLInputElement;
  editingValue.value = target.value;

  if (isComposing.value) {
    pendingInputValue.value = target.value;
  }
};

// 处理输入法开始事件
const handleCompositionStart = () => {
  // console.log('Composition start');
  isComposing.value = true;
  compositionValue.value = '';
  pendingInputValue.value = '';
};

// 处理输入法更新事件
const handleCompositionUpdate = (event: CompositionEvent) => {
  if (isComposing.value && event.target) {
    const target = event.target as HTMLInputElement;
    compositionValue.value = event.data || '';
    pendingInputValue.value = target.value;
    // console.log('Composition update:', compositionValue.value, 'pending:', pendingInputValue.value);
  }
};

// 处理输入法结束事件
const handleCompositionEnd = (event: CompositionEvent) => {
  // console.log('Composition end:', event.data);

  if (!editingCell.value) return;

  const target = event.target as HTMLInputElement;
  editingValue.value = target.value;
  pendingInputValue.value = target.value;

  // console.log('Final value after composition:', editingValue.value);

  isComposing.value = false;
  compositionValue.value = '';
};

// 处理keydown.229事件
const handleKeyDown229 = (event: KeyboardEvent) => {
  // console.log('Keydown 229 (IME)');
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (!editingCell.value) return;

  const { row, col } = editingCell.value;

  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      event.stopPropagation();

      if (isComposing.value) {
        const target = event.target as HTMLInputElement;
        editingValue.value = target.value;
        isComposing.value = false;
        compositionValue.value = '';
        pendingInputValue.value = '';
      }

      stopEditing();

      if (selection.startRow < data.value.length - 1) {
        selection.startRow += 1;
        selection.endRow = selection.startRow;
      }

      nextTick(() => {
        emit('selection-change', { ...selection });
      });
      break;

    case 'Escape':
      event.preventDefault();
      event.stopPropagation();

      if (isComposing.value) {
        isComposing.value = false;
        compositionValue.value = '';
        pendingInputValue.value = '';
      } else {
        cancelEditing();
      }
      break;

    default:
      break;
  }
};

// 处理失去焦点事件
const handleBlur = (event: FocusEvent) => {
  if (editingCell.value) {
    if (isComposing.value) {
      const target = event.target as HTMLInputElement;
      editingValue.value = target.value;
      isComposing.value = false;
      compositionValue.value = '';
      pendingInputValue.value = '';
    }

    stopEditing();
  }
};

const cancelEditing = () => {
  // 保存当前编辑单元格的引用，防止在函数执行期间被修改
  const currentEditingCell = editingCell.value;
  if (currentEditingCell) {
    const { row, col } = currentEditingCell;

    // 恢复原始值
    ensureRowExists(row);
    ensureColumnExists(col);

    if (!data.value[row][col]) {
      data.value[row][col] = {
        value: '',
        format: 'text',
        alignment: 'center' as TextAlign
      };
    }

    // 使用保存的原始值恢复单元格
    const originalValue = originalEditingValue.value;
    const currentValue = data.value[row][col].value;
    data.value[row][col].value = originalValue;

    // 触发更新事件
    // 只有值实际改变时才触发 data-change
    if (currentValue !== originalValue && !isSettingDataExternally.value) {
      emit('data-change', data.value);
      emit('cell-update', row, col, originalValue);
    }

    // console.log('取消编辑，恢复原始值:', { row, col, originalValue });
  }

  editingCell.value = null;
  isComposing.value = false;
  compositionValue.value = '';
  pendingInputValue.value = '';
  currentInputElement.value = null;
  originalEditingValue.value = '';
};

const isEditing = (row: number, col: number): boolean => {
  if (!editingCell.value) {
    return false;
  }
  return editingCell.value.row === row && editingCell.value.col === col;
};

// 检查是否允许操作（数据源弹窗打开时不允许）
const isOperationAllowed = (): boolean => {
  if (showDataSourceDialog.value) {
    // console.log('数据源弹窗打开，操作被禁用');
    return false;
  }
  if (showInlineEditDialog.value) {
    // console.log('内联编辑弹窗打开，操作被禁用');
    return false;
  }
  return true;
};

// 工具栏操作
const addRow = () => {
  if (!isOperationAllowed()) return;
  const newRow: CellData[] = Array.from({ length: columnCount.value }, () => ({
    value: '',
    format: 'text',
    alignment: 'center' as TextAlign
  }));
  data.value.push(newRow);

  const newRowIndex = data.value.length - 1;
  selection.startRow = selection.endRow = newRowIndex;
  selection.startCol = 0;
  selection.endCol = columnCount.value - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  // 添加行后更新高度
  if (props.autoHeight) {
    updateContainerHeight();
  }
};

const addColumn = () => {
  if (!isOperationAllowed()) return;
  data.value.forEach(row => {
    row.push({
      value: '',
      format: 'text',
      alignment: 'center' as TextAlign
    });
  });

  const newColIndex = columnCount.value - 1;
  selection.startCol = selection.endCol = newColIndex;
  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 在选中行上方插入行
const insertRowAbove = () => {
  if (!isOperationAllowed()) return;
  const insertAt = Math.min(selection.startRow, selection.endRow);
  const newRow: CellData[] = Array.from({ length: columnCount.value }, () => ({
    value: '',
    format: 'text',
    alignment: 'center' as TextAlign
  }));

  data.value.splice(insertAt, 0, newRow);

  selection.startRow = selection.endRow = insertAt;
  selection.startCol = 0;
  selection.endCol = columnCount.value - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 在选中行下方插入行
const insertRowBelow = () => {
  if (!isOperationAllowed()) return;
  const insertAt = Math.max(selection.startRow, selection.endRow) + 1;
  const newRow: CellData[] = Array.from({ length: columnCount.value }, () => ({
    value: '',
    format: 'text',
    alignment: 'center' as TextAlign
  }));

  data.value.splice(insertAt, 0, newRow);

  selection.startRow = selection.endRow = insertAt;
  selection.startCol = 0;
  selection.endCol = columnCount.value - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 在选中列左侧插入列
const insertColumnLeft = () => {
  if (!isOperationAllowed()) return;
  const insertAt = Math.min(selection.startCol, selection.endCol);

  data.value.forEach(row => {
    row.splice(insertAt, 0, {
      value: '',
      format: 'text',
      alignment: 'center' as TextAlign
    });
  });

  selection.startCol = selection.endCol = insertAt;
  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 在选中列右侧插入列
const insertColumnRight = () => {
  if (!isOperationAllowed()) return;
  const insertAt = Math.max(selection.startCol, selection.endCol) + 1;

  data.value.forEach(row => {
    row.splice(insertAt, 0, {
      value: '',
      format: 'text',
      alignment: 'center' as TextAlign
    });
  });

  selection.startCol = selection.endCol = insertAt;
  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 删除选中行
const removeSelectedRow = () => {
  if (!isOperationAllowed()) return;
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);

  if (startRow < 0 || endRow >= data.value.length) {
    return;
  }

  for (let row = startRow; row <= endRow; row++) {
    if (isProtectedRow(row)) {
      alert(`第${row + 1}行是受保护的行，不能删除`);
      emit('protected-operation-attempt', 'row', [row]);
      return;
    }
  }

  const deleteCount = endRow - startRow + 1;
  data.value.splice(startRow, deleteCount);

  if (data.value.length > 0) {
    selection.startRow = selection.endRow = Math.min(startRow, data.value.length - 1);
  } else {
    selection.startRow = selection.endRow = 0;
    addRow();
  }

  selection.startCol = 0;
  selection.endCol = columnCount.value - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 删除选中列
const removeSelectedColumn = () => {
  if (!isOperationAllowed()) return;
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  if (startCol < 0 || endCol >= columnCount.value) {
    return;
  }

  for (let col = startCol; col <= endCol; col++) {
    if (isProtectedColumn(col)) {
      alert(`第${col + 1}列是受保护的列，不能删除`);
      emit('protected-operation-attempt', 'column', [col]);
      return;
    }
  }

  const deleteCount = endCol - startCol + 1;
  data.value.forEach(row => {
    row.splice(startCol, deleteCount);
  });

  if (columnCount.value > 0) {
    selection.startCol = selection.endCol = Math.min(startCol, columnCount.value - 1);
  } else {
    selection.startCol = selection.endCol = 0;
    addColumn();
  }

  selection.startRow = 0;
  selection.endRow = data.value.length - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

const removeSelected = () => {
  if (!isOperationAllowed()) return;
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (isProtectedCell(row, col)) {
        alert(`单元格${row + 1}-${col + 1}是受保护的，不能清空`);
        return;
      }
    }
  }

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      ensureRowExists(row);
      ensureColumnExists(col);

      data.value[row][col] = {
        value: '',
        format: 'text',
        alignment: 'center' as TextAlign
      };
    }
  }

  emit('data-change', data.value);

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

const clearAll = () => {
  if (!isOperationAllowed()) return;
  if (!confirm('确定要清空所有数据吗？受保护的行列不会被清空。')) {
    return;
  }

  data.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!isProtectedCell(rowIndex, colIndex)) {
        data.value[rowIndex][colIndex] = {
          value: '',
          format: 'text',
          alignment: 'center' as TextAlign
        };
      }
    });
  });

  selection.startRow = selection.endRow = 0;
  selection.startCol = selection.endCol = 0;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 复制选中内容
const copySelection = () => {
  if (!isOperationAllowed()) return;
  const startRow = Math.min(selection.startRow, selection.endRow);
  const endRow = Math.max(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const endCol = Math.max(selection.startCol, selection.endCol);

  clipboard.value = [];

  for (let row = startRow; row <= endRow; row++) {
    const rowData = [];
    for (let col = startCol; col <= endCol; col++) {
      if (data.value[row] && data.value[row][col]) {
        rowData.push({
          value: data.value[row][col].value,
          format: data.value[row][col].format
        });
      } else {
        rowData.push({ value: '' });
      }
    }
    clipboard.value.push(rowData);
  }

  // console.log('已复制到剪贴板:', clipboard.value);
};

// 粘贴内容
const pasteSelection = () => {
  if (!isOperationAllowed()) return;
  if (clipboard.value.length === 0) return;

  const startRow = selection.startRow;
  const startCol = selection.startCol;

  for (let row = 0; row < clipboard.value.length; row++) {
    for (let col = 0; col < clipboard.value[row].length; col++) {
      const targetRow = startRow + row;
      const targetCol = startCol + col;

      if (isProtectedCell(targetRow, targetCol)) {
        continue;
      }

      ensureRowExists(targetRow);
      ensureColumnExists(targetCol);

      const cellData = clipboard.value[row][col];
      data.value[targetRow][targetCol] = {
        value: cellData.value,
        format: cellData.format || 'text',
        alignment: 'center' as TextAlign
      };
    }
  }

  selection.endRow = startRow + clipboard.value.length - 1;
  selection.endCol = startCol + clipboard.value[0].length - 1;

  emit('data-change', data.value);
  emit('selection-change', { ...selection });

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

const applyFormat = () => {
  if (!isOperationAllowed()) return;
  selectedCells.value.forEach(({ row, col }) => {
    if (isProtectedCell(row, col)) {
      return;
    }

    ensureRowExists(row);
    ensureColumnExists(col);

    if (data.value[row] && data.value[row][col]) {
      data.value[row][col].format = selectedCellFormat.value;
    }
  });

  emit('data-change', data.value);

  if (props.autoHeight) {
    updateContainerHeight();
  }
};

// 辅助函数
const getColumnName = (col: number): string => {
  let result = '';
  let tempCol = col;

  while (tempCol >= 0) {
    result = String.fromCharCode(65 + (tempCol % 26)) + result;
    tempCol = Math.floor(tempCol / 26) - 1;
  }

  return result;
};

const handleScroll = () => {
  if (cellsArea.value) {
    // 可以在这里实现虚拟滚动，但现在我们先简单处理
  }
};

// 添加防抖标志
const isUpdatingFromProps = ref(false);
const updateTimeout = ref<NodeJS.Timeout | null>(null);

// 监听props.data变化
watch(() => props.data, (newData) => {
  // console.log('props.data changed:', newData);

  if (isUpdatingFromProps.value) {
    // console.log('忽略内部触发的更新');
    return;
  }

  if (newData && newData.length > 0) {
    if (updateTimeout.value) {
      clearTimeout(updateTimeout.value);
    }

    updateTimeout.value = setTimeout(() => {
      isUpdatingFromProps.value = true;

      data.value = JSON.parse(JSON.stringify(newData));

      data.value.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell.format) {
            const value = cell.value;
            if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
              cell.format = 'number';
            } else {
              cell.format = 'text';
            }
          }

          if (!cell.alignment) {
            if (cell.format === 'number') {
              cell.alignment = 'right' as TextAlign;
            } else {
              cell.alignment = 'center' as TextAlign;
            }
          }

          if (rowIndex === 0) {
            cell.fontWeight = cell.fontWeight || 'bold';
            cell.alignment = cell.alignment || 'center' as TextAlign;
          }
        });
      });

      // console.log('Updated internal data:', data.value);

      // 更新高度
      if (props.autoHeight) {
        updateContainerHeight();
      }

      setTimeout(() => {
        isUpdatingFromProps.value = false;
      }, 50);

    }, 50);
  }
}, { deep: true, immediate: true });

// 监听行数变化，更新高度
watch(() => data.value.length, () => {
  if (props.autoHeight) {
    updateContainerHeight();
  }
});

// 监听搜索文本变化，实时筛选数据
watch(dataSourceSearchText, () => {
  filterDataSourceData();
});

// 数据源弹窗相关函数
const selectDataSourceItem = (item: DataSourceItem) => {
  dataSourceSelectedItem.value = item;
  // 自动填充手动输入框
  const displayField = dataSourceDialogConfig.value?.displayField ||
    (dataSourceDialogConfig.value?.columns?.[0] || 'label');
  dataSourceManualInput.value = String(item[displayField] || item.label || '');
};

const confirmDataSourceSelection = () => {
  if (!dataSourceDialogCell.value || !dataSourceDialogConfig.value) return;

  const { row, col } = dataSourceDialogCell.value;
  let finalValue = dataSourceManualInput.value;

  // 如果选择了数据源项，使用值字段的值
  if (dataSourceSelectedItem.value) {
    const valueField = dataSourceDialogConfig.value.valueField ||
      (dataSourceDialogConfig.value.columns?.[0] || 'id');
    finalValue = dataSourceSelectedItem.value[valueField] ||
      dataSourceSelectedItem.value.id ||
      dataSourceManualInput.value;
  }

  // 更新单元格数据
  ensureRowExists(row);
  ensureColumnExists(col);

  if (!data.value[row][col]) {
    data.value[row][col] = {
      value: '',
      format: 'text',
      alignment: 'center' as TextAlign
    };
  }

  data.value[row][col].value = finalValue;

  // 触发更新事件
  emit('cell-update', row, col, finalValue);
  emit('data-change', data.value);

  // 关闭弹窗
  closeDataSourceDialog();
};

const closeDataSourceDialog = () => {
  showDataSourceDialog.value = false;
  dataSourceDialogConfig.value = null;
  dataSourceDialogCell.value = null;
  dataSourceSearchText.value = '';
  dataSourceFilteredData.value = [];
  dataSourceSelectedItem.value = null;
  dataSourceManualInput.value = '';
};

// 关闭内联编辑弹窗
const closeInlineEditDialog = () => {
  showInlineEditDialog.value = false;
  inlineEditDialogCell.value = null;
  inlineEditDialogValue.value = '';
  inlineEditDialogError.value = '';
};

// 验证单元格输入值
const validateCellValue = (value: string, cell: CellData | null): string => {
  if (!cell) return '';

  const trimmedValue = value.trim();

  if (cell.format === 'number') {
    // 数字格式验证
    if (trimmedValue === '') return ''; // 允许清空

    const num = parseFloat(trimmedValue);
    if (isNaN(num)) {
      return '请输入有效的数字';
    }

    // 检查是否为负数（如果允许负数的话）
    // 这里可以根据需要添加更多验证逻辑

    return ''; // 验证通过
  }

  // 文本格式，默认通过
  return '';
};

// 确认内联编辑
const confirmInlineEdit = () => {
  if (!inlineEditDialogCell.value) return;

  const { row, col } = inlineEditDialogCell.value;
  const cell = getCellAt(row, col);

  // 验证输入值
  const error = validateCellValue(inlineEditDialogValue.value, cell);
  if (error) {
    inlineEditDialogError.value = error;
    return;
  }

  // 更新单元格数据
  ensureRowExists(row);
  ensureColumnExists(col);

  if (!data.value[row][col]) {
    data.value[row][col] = {
      value: '',
      format: 'text',
      alignment: 'center' as TextAlign
    };
  }

  const finalValue = inlineEditDialogValue.value.trim();
  data.value[row][col].value = finalValue;

  // 触发更新事件
  emit('cell-update', row, col, finalValue);
  emit('data-change', data.value);

  // 关闭弹窗
  closeInlineEditDialog();
};

// 关闭数据源弹窗的点击事件处理函数
const closeDataSourceOnClick = () => {
  if (showDataSourceDialog.value) {
    closeDataSourceDialog();
  }
};

// 关闭内联编辑弹窗的点击事件处理函数
const closeInlineEditOnClick = () => {
  if (showInlineEditDialog.value) {
    closeInlineEditDialog();
  }
};

// 键盘快捷键支持
onMounted(() => {
  // console.log('Spreadsheet component mounted');
  initializeData();

  // 启动容器宽度监听（实现自适应列宽）
  nextTick(() => {
    startResizeObserver();

    // 强制触发一次宽度更新
    setTimeout(() => {
      if (spreadsheetWrapper.value) {
        const rect = spreadsheetWrapper.value.getBoundingClientRect();
        containerWidth.value = rect.width;
      }
    }, 0);
  });

  // 添加全局点击事件来关闭右键菜单
  document.addEventListener('click', closeContextMenu);

  // 添加全局点击事件来关闭数据源弹窗
  document.addEventListener('click', closeDataSourceOnClick);

  // 添加全局点击事件来关闭内联编辑弹窗
  document.addEventListener('click', closeInlineEditOnClick);

  document.addEventListener('keydown', (e) => {
    // 如果数据源弹窗打开，禁用键盘操作
    if (showDataSourceDialog.value) {
      // 只允许在数据源弹窗内使用Tab、Enter、Escape键
      if (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'Escape') {
        e.stopPropagation();
      }
      return;
    }

    // 如果内联编辑弹窗打开，禁用键盘操作
    if (showInlineEditDialog.value) {
      // 只允许在内联编辑弹窗内使用Tab、Enter、Escape键
      if (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'Escape') {
        e.stopPropagation();
      }
      return;
    }

    // 只有当前组件激活时才处理键盘事件
    if (!props.active) {
      return;
    }

    if (!editingCell.value) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (selection.startRow > 0) {
            selection.startRow -= 1;
            selection.endRow = selection.startRow;
            emit('selection-change', { ...selection });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (selection.startRow < data.value.length - 1) {
            selection.startRow += 1;
            selection.endRow = selection.startRow;
            emit('selection-change', { ...selection });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (selection.startCol > 0) {
            selection.startCol -= 1;
            selection.endCol = selection.startCol;
            emit('selection-change', { ...selection });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (selection.startCol < columnCount.value - 1) {
            selection.startCol += 1;
            selection.endCol = selection.startCol;
            emit('selection-change', { ...selection });
          }
          break;
        case 'Delete':
          e.preventDefault();
          removeSelected();
          break;
        case 'F2':
          e.preventDefault();
          if (selection.startRow === selection.endRow && selection.startCol === selection.endCol) {
            if (isProtectedCell(selection.startRow, selection.startCol)) {
              //alert('此单元格受保护，不能编辑');
              return;
            }
            startEditing(selection.startRow, selection.startCol, e as any);
          }
          break;
        //case 'Enter':(注释掉后解决弹出框enter卡顿)
        //e.preventDefault();
        //if (selection.startRow === selection.endRow && selection.startCol === selection.endCol) {
        //if (isProtectedCell(selection.startRow, selection.startCol)) {
        //alert('此单元格受保护，不能编辑');
        //return;
        //}
        //startEditing(selection.startRow, selection.startCol, e as any);
        //}
        //break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            copySelection();
          }
          break;
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            pasteSelection();
          }
          break;
        default:
          break;
      }
    }
  });
});

// 组件卸载前清理
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('click', closeDataSourceOnClick);
  document.removeEventListener('click', closeInlineEditOnClick);
  stopResizeObserver();
});

// 停止编辑
const stopEditing = () => {
  // 防止重入，避免死循环
  if (isStoppingEditing.value) {
    console.log('stopEditing: 防止重入调用');
    return;
  }
  isStoppingEditing.value = true;

  try {
    // 保存当前编辑单元格的引用，防止在函数执行期间被修改
    const currentEditingCell = editingCell.value;
    const originalValue = originalEditingValue.value;
    if (!currentEditingCell) {
      return;
    }

    const { row, col } = currentEditingCell;

    ensureRowExists(row);
    ensureColumnExists(col);

    if (!data.value[row][col]) {
      data.value[row][col] = {
        value: '',
        format: 'text',
        alignment: 'center' as TextAlign
      };
    }

    let finalValue = '';

    // 优先使用cellInput ref数组获取值（基于行列索引，更可靠）
    const cellIndex = row * columnCount.value + col;
    if (cellInput.value && cellInput.value[cellIndex]) {
      const inputElement = cellInput.value[cellIndex] as HTMLInputElement;
      if (inputElement) {
        finalValue = inputElement.value;
        // console.log('从cellInput ref数组获取值:', finalValue);
      }
    }

    // 如果cellInput没有值，尝试使用当前输入框元素引用
    if (!finalValue && currentInputElement.value) {
      finalValue = currentInputElement.value.value;
      // console.log('从currentInputElement获取值:', finalValue);
    }

    // 如果通过ref获取失败，尝试使用pendingInputValue或editingValue
    if (!finalValue) {
      if (pendingInputValue.value) {
        finalValue = pendingInputValue.value;
        // console.log('从pendingInputValue获取值:', finalValue);
      } else {
        finalValue = editingValue.value;
        // console.log('从editingValue获取值:', finalValue);
      }
    }

    finalValue = finalValue.trim();

    const cell = data.value[row][col];

    if (cell.format === 'number') {
      const num = parseFloat(finalValue);

      if (isNaN(num)) {
        // console.warn(`单元格[${row},${col}]输入的不是有效数字: "${finalValue}"`);
        finalValue = cell.value || '0';
      } else {
        finalValue = num.toString();
      }
    }

    data.value[row][col].value = finalValue;
    data.value[row][col].format = data.value[row][col].format || 'text';

    // 只在没有对齐属性时设置默认对齐方式
    if (!data.value[row][col].alignment) {
      if (data.value[row][col].format === 'number') {
        data.value[row][col].alignment = 'right' as TextAlign;
      } else {
        data.value[row][col].alignment = 'center' as TextAlign;
      }
    }

    if (row === 0) {
      data.value[row][col].fontWeight = data.value[row][col].fontWeight || 'bold';
      data.value[row][col].alignment = data.value[row][col].alignment || 'center' as TextAlign;
    }

    //console.log('10101010',cell.value,finalValue,originalValue);
    if (cell.value !== originalValue && !isSettingDataExternally.value) {
      emit('data-change', data.value);
      emit('cell-update', row, col, data.value[row][col].value);
    }

    editingCell.value = null;
    isComposing.value = false;
    compositionValue.value = '';
    pendingInputValue.value = '';
    currentInputElement.value = null;
    originalEditingValue.value = '';

    // console.log('Cell updated:', { row, col, value: data.value[row][col].value });

    // 编辑完成后更新高度
    if (props.autoHeight) {
      updateContainerHeight();
    }
  } finally {
    // 无论成功还是失败，都要重置重入标志
    isStoppingEditing.value = false;
  }
};

// 暴露方法给父组件
defineExpose({
  getData: () => data.value,
  setData: (newData: CellData[][]) => {
    // 设置外部数据更新标志，防止触发循环事件
    isSettingDataExternally.value = true;

    try {
      if (editingCell.value) {
        stopEditing();
      }

      data.value = JSON.parse(JSON.stringify(newData));

      data.value.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell.format) {
            const value = cell.value;
            if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
              cell.format = 'number';
            } else {
              cell.format = 'text';
            }
          }

          if (!cell.alignment) {
            if (cell.format === 'number') {
              cell.alignment = 'right' as TextAlign;
            } else {
              cell.alignment = 'center' as TextAlign;
            }
          }

          if (rowIndex === 0) {
            cell.fontWeight = cell.fontWeight || 'bold';
            cell.alignment = cell.alignment || 'center' as TextAlign;
          }
        });
      });

      // console.log('外部 setData 完成，不触发 data-change');

      // 设置数据后更新高度
      if (props.autoHeight) {
        updateContainerHeight();
      }

      setTimeout(() => {
        isUpdatingFromProps.value = false;
      }, 100);
    } finally {
      // 确保标志被重置
      isSettingDataExternally.value = false;
    }
  },
  clear: () => {
    clearAll();
  },
  cancelEditing: () => {
    cancelEditing();
  },
  forceStopEditing: () => {
    if (editingCell.value) {
      stopEditing();
    }
  },
  getSelectedData: () => {
    const result: any[] = [];
    selectedCells.value.forEach(({ row, col }) => {
      const cell = getCellAt(row, col);
      if (cell) {
        result.push({
          row,
          col,
          address: `${getColumnName(col)}${row + 1}`,
          value: getCellValue(row, col),
          rawValue: cell.value,
          format: cell.format
        });
      }
    });
    return result;
  },
  getSelectedRowsData: () => {
    const result: any[] = [];
    // 按行索引排序
    const sortedRows = Array.from(selectedRowsSet.value).sort((a, b) => a - b);

    sortedRows.forEach(row => {
      const rowData: any = { row };
      const cells: any[] = [];

      // 获取该行的所有单元格数据
      if (data.value[row]) {
        for (let col = 0; col < data.value[row].length; col++) {
          const cell = getCellAt(row, col);
          if (cell) {
            cells.push({
              col,
              value: getCellValue(row, col),
              rawValue: cell.value,
              format: cell.format
            });
          }
        }
      }

      rowData.cells = cells;
      result.push(rowData);
    });

    return result;
  },
  getSelectedRows: () => {
    // 返回选中的行索引数组
    return Array.from(selectedRowsSet.value).sort((a, b) => a - b);
  },
  addRow: () => addRow(),
  addColumn: () => addColumn(),
  removeSelectedRow: () => removeSelectedRow(),
  removeSelectedColumn: () => removeSelectedColumn(),
  getColumnWidths: () => {
    if (Array.isArray(props.columnWidth)) {
      return props.columnWidth;
    }
    return Array(columnCount.value).fill(props.columnWidth as number);
  },
  getColumnWidth: (col: number) => getColumnWidth(col),
  updateHeight: () => {
    if (props.autoHeight) {
      updateContainerHeight();
    }
  }
});
</script>

<style scoped>
.spreadsheet-container {
  font-family: 'Segoe UI', Arial, sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  /* 移除固定高度，改为自动高度 */
  height: auto;
  min-height: 100px;
  /* 最小高度，防止内容太少时表格太小 */
  max-height: 800px;
  /* 最大高度，防止内容太多时表格过大 */
  overflow: visible;
  /* 改为可见，让内容可以撑开容器 */
}

.spreadsheet-toolbar {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 6px 8px;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  min-height: 36px;
  flex-shrink: 0;
  /* 防止工具栏被压缩 */
}

.toolbar-btn {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  height: 28px;
}

.toolbar-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.toolbar-btn:nth-child(2),
.toolbar-btn:nth-child(4),
.toolbar-btn:nth-child(6) {
  background: #fff3f3;
  border-color: #ffcdd2;
  color: #d32f2f;
}

.toolbar-btn:nth-child(2):hover,
.toolbar-btn:nth-child(4):hover,
.toolbar-btn:nth-child(6):hover {
  background: #ffebee;
}

.format-select {
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: white;
  font-size: 13px;
  height: 28px;
}

.spreadsheet-wrapper {
  display: flex;
  flex-direction: column;
  overflow-y: visible;
  overflow-x: hidden;
  /* 禁止横向滚动 */
  height: auto;
  min-height: 100px;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  /* 关键：允许 flex 子元素收缩 [^5^] */
}

/* 原 .cells-area 样式，改为： */
.cells-area {
  overflow: visible;
  position: relative;
  height: auto;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  /* 关键：允许收缩到内容宽度以下 */
}

.column-headers {
  display: flex;
  border-bottom: 2px solid #ddd;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 28px;
  flex-shrink: 0;
  /* 防止列头被压缩 */
}

.corner-cell {
  width: 50px;
  border-right: 1px solid #ddd;
  background: #f8f9fa;
  min-height: 28px;
  flex-shrink: 0;
}

.column-header {
  height: 28px;
  /*min-width: 80px;*/
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  position: relative;
  font-size: 12px;
}

.column-header:hover {
  background: #e9ecef;
}

.column-header.protected-column {
  background: #fff8e1;
}

.row-headers {
  width: 50px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  position: sticky;
  left: 0;
  z-index: 5;
  flex-shrink: 0;
  /* 防止行头被压缩 */
}

.row-header {
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  user-select: none;
  /* 高度由内联样式控制，移除 min-height 避免冲突 */
  position: relative;
  font-size: 12px;
  flex-shrink: 0;
  /* 防止行头单元格被压缩 */
  padding: 0 4px;
  gap: 4px;
}

.row-header:hover {
  background: #e9ecef;
}

.row-header.protected-row {
  background: #fff8e1;
}

.protected-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  color: #ff9800;
  background: #fff3e0;
  padding: 1px 3px;
  border-radius: 2px;
  border: 1px solid #ffb74d;
}

/* 复选框样式 */
.row-checkbox {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: white;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1;
  transition: all 0.2s;
}

.row-checkbox:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.checkbox-checked {
  color: #007bff;
  font-weight: bold;
}

.checkbox-unchecked {
  color: transparent;
}

.row-checkbox-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.row-number {
  flex-grow: 1;
  text-align: center;
  font-weight: normal;
  color: #666;
  font-size: 11px;
}

.row-header.selectable-row:hover {
  background: #e3f2fd;
}

.spreadsheet-content {
  /* 移除 flex: 1，让高度自适应内容 */
  display: flex;
  overflow: visible;
  /* 改为可见 */
  position: relative;
  height: auto;
  /* 高度自适应 */
  flex-shrink: 0;
  /* 防止被压缩 */
}



.row {
  display: flex;
  flex-shrink: 0;
  /* 防止行被压缩 */
}

.cell {
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: cell;
  background: white;
  /*min-width: 80px;*/
  /* 高度由行的 height 控制，移除 min-height 避免冲突 */
  flex-shrink: 0;
  position: relative;
  user-select: none;
  display: flex;
  align-items: center;
  min-width: 0;
  /* 关键：允许单元格收缩 */
}

.cell:hover {
  background: #f5f9ff;
}

.cell-selected {
  background: #e3f2fd !important;
  border: 2px solid #2196f3 !important;
  padding: 0;
  z-index: 1;
}

.cell-editing {
  padding: 0;
  border: 2px solid #4caf50 !important;
  z-index: 2;
}

.cell-has-data {
  background-color: #f8fff8;
}

.cell.protected-cell {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.cell.protected-cell:hover {
  background-color: #eeeeee;
}

/* 添加表头行的特殊样式 */
.cell.header-row {
  background-color: #f0f7ff !important;
  color: #1890ff !important;
  font-weight: bold !important;
  border-bottom: 2px solid #1890ff !important;
}

.cell.protected-header {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%) !important;
  color: #1890ff !important;
  font-weight: bold !important;
  border-bottom: 2px solid #1890ff !important;
}

/* 确保表头内容可见 */
.cell-display {
  padding: 0 2px;
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  color: inherit;
  font-size: 13px;
}

/* 确保表头行的单元格不受保护样式影响 */
.cell.header-row.protected-cell,
.cell.protected-header {
  cursor: default !important;
}

.cell-input {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 0 2px;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  line-height: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: text;
  display: block;
  user-select: text;
  margin: 0;
  font-size: 13px;
}

.cell-editing .cell-input {
  background: #fff !important;
  color: #000 !important;
  outline: 2px solid #4caf50 !important;
  outline-offset: -2px;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 160px;
  padding: 4px 0;
  font-size: 13px;
}

.context-menu-item {
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.context-menu-item.disabled {
  color: #999;
  cursor: not-allowed;
}

.context-menu-item.disabled:hover {
  background: white;
}

.menu-icon {
  width: 16px;
  text-align: center;
  font-weight: bold;
}

.menu-hint {
  margin-left: auto;
  font-size: 11px;
  color: #ff9800;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 4px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .spreadsheet-toolbar {
    gap: 4px;
  }

  .toolbar-btn {
    padding: 3px 8px;
    font-size: 12px;
  }

  .cell {
    min-width: 70px;
  }

  .column-header {
    min-width: 70px;
  }

  .context-menu {
    min-width: 140px;
    font-size: 12px;
  }
}

/* 数据源选择弹窗遮罩层样式 */
.data-source-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  cursor: not-allowed;
}

.inline-edit-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1999;
  cursor: not-allowed;
}

/* 数据源选择弹窗样式 */
.data-source-dialog {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  min-width: 600px;
  max-width: 900px;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}

.data-source-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.data-source-title {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.data-source-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.data-source-close:hover {
  background: #e9ecef;
  color: #666;
}

.data-source-search {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.data-source-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: 300px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

/* 表格布局样式 */
.data-source-table-header {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-header-row {
  display: flex;
}

.table-header-cell {
  flex: 1;
  min-width: 80px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  text-align: left;
  border-right: 1px solid #dee2e6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-header-cell:last-child {
  border-right: none;
}

.data-source-table-body {
  flex: 1;
}

.data-source-table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.data-source-table-row:hover {
  background-color: #f8f9fa;
}

.data-source-table-row.selected {
  background-color: #e6f7ff;
}

.table-data-cell {
  flex: 1;
  min-width: 80px;
  padding: 8px 12px;
  font-size: 13px;
  color: #212529;
  border-right: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.table-data-cell:last-child {
  border-right: none;
}

.table-data-cell.single-column {
  min-width: 100%;
  border-right: none;
}

.cell-value {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-source-empty {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.data-source-input {
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.input-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.manual-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.manual-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.data-source-actions {
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-cancel:hover {
  background: #e8e8e8;
  color: #333;
}

.btn-confirm {
  background: #1890ff;
  color: white;
}

.btn-confirm:hover {
  background: #096dd9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .data-source-dialog {
    min-width: 280px;
    max-width: 90vw;
    max-height: 70vh;
  }

  .data-source-header,
  .data-source-search,
  .data-source-input,
  .data-source-actions {
    padding: 10px 12px;
  }

  .data-source-item {
    padding: 8px 12px;
  }
}

/* 激活状态的spreadsheet样式 */
.spreadsheet-container.spreadsheet-active {
  border: 2px solid #1890ff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
}

.spreadsheet-container.spreadsheet-active:focus {
  outline: none;
  border-color: #096dd9;
  box-shadow: 0 0 15px rgba(9, 109, 217, 0.4);
}

/* 小型单元格编辑输入框样式 */
.cell-edit-popup {
  position: fixed;
  background: white;
  border: 1px solid #4caf50;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 400px;
  max-width: 500px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-edit-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cell-edit-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  min-width: 120px;
}

.cell-edit-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.cell-edit-buttons {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.cell-edit-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
  padding: 0;
  background: #f5f5f5;
  color: #666;
}

.cell-edit-btn:hover {
  transform: translateY(-1px);
}

.cell-edit-btn-cancel:hover {
  background: #ffebee;
  color: #d32f2f;
}

.cell-edit-btn-confirm:hover {
  background: #e8f5e8;
  color: #388e3c;
}

.cell-edit-error {
  font-size: 11px;
  color: #d32f2f;
  padding: 2px 4px;
  background: #ffebee;
  border-radius: 2px;
  margin-top: 2px;
}
</style>