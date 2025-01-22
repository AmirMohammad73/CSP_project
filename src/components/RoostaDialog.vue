<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="none"
        content-class="full-width-dialog">
        <v-card>
            <v-card-title class="text-h5">
                <div style="direction: rtl;">مشخصات روستاها</div>
            </v-card-title>
            <v-card-text class="table-container">
                <v-table dir="rtl" class="sticky-header-table"
                    :style="{ '--sticky-header-bg': stickyHeaderBackgroundColor }">
                    <thead>
                        <tr>
                            <th v-for="header in roostaHeaders" :key="header.key" class="sticky-header">{{ header.title
                                }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in roostaData" :key="index">
                            <td v-for="header in roostaHeaders" :key="header.key">
                                <template v-if="header.key === 'shenaseh_melli'">
                                    <v-text-field v-model="item[header.key]" variant="outlined" density="compact"
                                        hide-details
                                        :class="header.key === 'shenaseh_melli' ? 'wide-field-5x' : 'wide-field-3x'"></v-text-field>
                                </template>
                                <template v-else-if="isBooleanColumn(header.key)">
                                    <v-checkbox v-model="item[header.key]" :true-value="true" :false-value="false"
                                        :disabled="!isEditableCheckbox(header.key)" hide-details
                                        density="compact"></v-checkbox>
                                </template>
                                <template v-else>
                                    {{ item[header.key] }}
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="saveRoostaData">ذخیره تغییرات</v-btn>
                <v-btn color="error" @click="closeDialog">بستن</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        modelValue: Boolean, // Use `modelValue` instead of `dialog`
        roostaData: Array,
        roostaHeaders: Array,
        stickyHeaderBackgroundColor: String,
    },
    data() {
        return {
            originalData: [], // Store the original data for comparison
        };
    },
    watch: {
        modelValue(newVal) {
            if (newVal) {
                // When the dialog opens, create a deep copy of the original data
                this.originalData = JSON.parse(JSON.stringify(this.roostaData));
            }
        },
    },
    methods: {
        isEditableCheckbox(key) {
            const editableColumns = [
                'amaliate_meydani',
                'dadeh_amaei',
                'geocode',
                'pelak_talfighi'
            ];
            return editableColumns.includes(key);
        },
        isBooleanColumn(key) {
            const booleanColumns = [
                'bonyad_maskan',
                'sayer_manabe',
                'tarsim',
                'amaliate_meydani',
                'dadeh_amaei',
                'geocode',
                'adam_tayid',
                'mokhtasat_rousta',
                'mahdoudeh_rousta',
                'tolid_qr',
                'pelak_talfighi',
            ];
            return booleanColumns.includes(key);
        },
        async saveRoostaData() {
            try {
                // Filter out only the modified records
                const modifiedRecords = this.roostaData.filter((record, index) => {
                    return !this.isEqual(record, this.originalData[index]);
                });

                if (modifiedRecords.length === 0) {
                    this.$emit('save-success', '<span dir="rtl">تغییری برای ذخیره وجود ندارد.</span>');
                    return;
                }

                // Send only the modified records to the server
                const response = await fetch('http://192.168.47.1:3001/api/locations/update-roosta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(modifiedRecords),
                });

                if (!response.ok) {
                    throw new Error('Failed to save roosta data');
                }

                // Update the original data to reflect the changes
                this.originalData = JSON.parse(JSON.stringify(this.roostaData));

                this.$emit('save-success', '<span dir="rtl">اطلاعات با موفقیت ذخیره شد!</span>');
            } catch (error) {
                console.error('Error saving roosta data:', error);
                this.$emit('save-error', '<span dir="rtl">خطا در ذخیره اطلاعات!</span>');
            }
        },
        closeDialog() {
            this.$emit('update:modelValue', false); // Emit event to close the dialog
        },
        isEqual(obj1, obj2) {
            // Helper function to compare two objects
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },
    },
};
</script>

<style scoped>
.full-width-dialog {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
}

.table-container {
    max-height: 70vh;
    overflow-y: auto;
}

.sticky-header-table {
    overflow: auto;
    height: 70vh;
}

.sticky-header-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
}

.sticky-header {
    position: sticky;
    top: 0;
    background-color: var(--sticky-header-bg);
    z-index: 1;
}

.v-table td {
    white-space: nowrap;
    padding: 8px;
    font-family: 'B Traffic', sans-serif;
}

.v-table th {
    white-space: nowrap;
    font-family: 'B Traffic', sans-serif;
    font-size: smaller;
}

.wide-field-5x {
    width: 115px;
}

.wide-field-3x {
    width: 70px;
}

.v-checkbox {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>