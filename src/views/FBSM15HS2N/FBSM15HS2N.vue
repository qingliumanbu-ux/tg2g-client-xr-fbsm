<template>
    <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f5-do="F5_DO" @ready="efFormReady" @closeDialog="closeEfDialog"
        :in-dialog-form-name="openInDialog ? 'FBSM15HS2N' : null">
        <template v-if="initializeFlag === 1">
            <template v-if="initializeFlag === 1">
                <er-layout id="ErLayout_0Q3vcC6m" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
                    :allow-collapse="true"></er-layout>
                <v-splitter id="splitter_UhJLVdvB" class="default-theme" style=" height: 100%;">
                    <v-splitter-pane size="15">
                        <er-grid id="ErGrid_FBw2Y3Un" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                            @erGridReady="erGridMainReady" @focus-changed="gridviewMainFocusChanged">
                        </er-grid>
                    </v-splitter-pane>
                    <v-splitter-pane size="85">
                        <v-splitter id="splitter_hSBurdc2" class="default-theme" style=" height: 100%; padding: 5px;"
                            :horizontal="true" :key="splitterKey">
                            <v-splitter-pane size="33" v-if="showGrid1" key="grid1">
                                <div style="display: flex; height: 100%;">
                                    <!-- 左边固定标题 -->
                                    <div
                                        style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                                        <b>{{ s_id[0] }}</b>
                                    </div>
                                    <!-- 右边 Grid -->
                                    <div style="flex: 1;">
                                        <er-grid id="ErGrid_BHScL6Q5" :er-form-helper-prop="erFormHelper"
                                            :config-id="'gridView1'"
                                            :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                                            @erGridReady="erGrid1Ready">
                                        </er-grid>
                                    </div>
                                </div>
                            </v-splitter-pane>
                            <v-splitter-pane size="33" v-if="showGrid2" key="grid2">
                                <div style="display: flex; height: 100%;">
                                    <div
                                        style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                                        <b>{{ s_id[1] }}</b>
                                    </div>
                                    <!-- 右边 Grid -->
                                    <div style="flex: 1; ">
                                        <er-grid id="ErGrid_25uMrZ46" :er-form-helper-prop="erFormHelper"
                                            :config-id="'gridView2'"
                                            :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                                            @erGridReady="erGrid2Ready">
                                        </er-grid>
                                    </div>
                                </div>
                            </v-splitter-pane>
                            <v-splitter-pane size="33" v-if="showGrid3" key="grid3">
                                <div style="display: flex; height: 100%;">
                                    <!-- 左边固定标题 -->
                                    <div
                                        style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                                        <b>{{ s_id[2] }}</b>
                                    </div>
                                    <div style="flex: 1;">
                                        <er-grid id="ErGrid_nVOxMOyj" :er-form-helper-prop="erFormHelper"
                                            :config-id="'gridView3'"
                                            :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                                            @erGridReady="erGrid3Ready">
                                        </er-grid>
                                    </div>
                                </div>
                            </v-splitter-pane>

                        </v-splitter>
                    </v-splitter-pane>

                </v-splitter>
            </template>
        </template>
    </xr-ef-form>
</template>
<script lang="ts" src="./FBSM15HS2N.ts">
</script>

<style lang="scss">
@import './FBSM15HS2N.scss';
</style>