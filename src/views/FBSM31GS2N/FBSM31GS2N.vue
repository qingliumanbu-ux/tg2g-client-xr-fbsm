<template>
    <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady" @closeDialog="closeEfDialog"
        :in-dialog-form-name="'FBSM31GS2N'">
        <template v-if="initializeFlag === 1">
            <template v-if="initializeFlag === 1">
                <er-layout id="ErLayout_0Q3vcC6m" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
                    :allow-collapse="true"></er-layout>
                <a-tabs id="AntTabs_A0UgIqg3" type="card" @change="handleTab1Change">
                    <a-tab-pane id="AntTabPane_xGWay564" key="tab1" tab="计划数据">
                        <er-grid id="gridView1" :er-form-helper-prop="erFormHelper" :config-id="'gridView1'"
                            @erGridReady="erGrid1Ready">
                        </er-grid>
                    </a-tab-pane>
                    <a-tab-pane id="AntTabPane_8rJPIIpz" key="tab2" tab="物料数据">
                        <er-grid id="gridView2" :er-form-helper-prop="erFormHelper" :config-id="'gridView2'"
                            @erGridReady="erGrid2Ready" style=" height: 100%;">
                        </er-grid>
                    </a-tab-pane>
                    <a-tab-pane id="AntTabPane_ZqhNaB8Q" key="tab3" tab="投料限制数据">
                        <er-grid id="gridView3" :er-form-helper-prop="erFormHelper" :config-id="'gridView3'"
                            @erGridReady="erGrid3Ready">
                        </er-grid>
                    </a-tab-pane>
                </a-tabs>
            </template>
        </template>
    </xr-ef-form>
</template>
<script lang="ts" src="./FBSM31GS2N.ts">
</script>

<style lang="scss">
@import './FBSM31GS2N.scss';
</style>
