<template>
    <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady" @closeDialog="closeEfDialog"
        :in-dialog-form-name="'FBSM15GS2N'">
        <template v-if="initializeFlag === 1">
            <template v-if="initializeFlag === 1">
                <er-layout id="ErLayout_0Q3vcC6m" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
                    :allow-collapse="true"></er-layout>
                <a-tabs id="AntTabs_A0UgIqg3" type="card" @change="handleTab1Change">
                    <a-tab-pane id="AntTabPane_xGWay564" key="tab1" tab="原料库存及成分">
                        <er-grid id="gridView1" :er-form-helper-prop="erFormHelper" :config-id="'gridView1'"
                            @erGridReady="erGrid1Ready">
                        </er-grid>
                    </a-tab-pane>
                    <a-tab-pane id="AntTabPane_8rJPIIpz" key="tab2" tab="工序基准成分">
                        <er-grid id="gridView2" :er-form-helper-prop="erFormHelper" :config-id="'gridView2'"
                            @erGridReady="erGrid2Ready" style=" height: 100%;">
                        </er-grid>
                    </a-tab-pane>
                    <a-tab-pane id="AntTabPane_ZqhNaB8Q" key="tab3" tab="原料总表">
                        <er-grid id="gridView3" :er-form-helper-prop="erFormHelper" :config-id="'gridView3'"
                            @erGridReady="erGrid3Ready">
                        </er-grid>
                    </a-tab-pane>
                    <a-tab-pane id="AntTabPane_24awUBrM" key="tab4" tab="可投重量">
                        <er-grid id="gridView4" :er-form-helper-prop="erFormHelper" :config-id="'gridView4'"
                            @erGridReady="erGrid4Ready">
                        </er-grid>
                    </a-tab-pane>
                </a-tabs>
            </template>
        </template>
    </xr-ef-form>
</template>
<script lang="ts" src="./FBSM15GS2N.ts">
</script>

<style lang="scss">
@import './FBSM15GS2N.scss';
</style>