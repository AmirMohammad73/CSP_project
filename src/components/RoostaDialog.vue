<!-- roostadialog.vue -->
<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="none"
        content-class="full-width-dialog">
        <v-card>
            <v-card-title class="text-h5">
                <div style="direction: rtl;">مشخصات روستاها</div>
            </v-card-title>

            <!-- Search Bar -->
            <v-card-text class="d-flex justify-end">
                <v-text-field v-model="searchTerm" variant="outlined" density="compact" hide-details clearable dir="rtl"
                    class="search-bar" prepend-inner-icon="mdi-magnify"></v-text-field>
            </v-card-text>

            <!-- Table -->
            <v-card-text class="table-container">
                <v-infinite-scroll :items="filteredRoostaData" @load="loadMoreRoostaData">
                    <v-table dir="rtl" height="70vh" fixed-header>
                        <thead>
                            <tr>
                                <th v-for="header in roostaHeaders" :key="header.key">
                                    {{ header.title }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in filteredRoostaData" :key="index">
                                <td v-for="header in roostaHeaders" :key="header.key">
                                    <template v-if="header.key === 'shenaseh_melli'">
                                        <v-text-field v-model="item[header.key]" variant="outlined" density="compact"
                                            hide-details
                                            :class="header.key === 'shenaseh_melli' ? 'wide-field-5x' : 'wide-field-3x'"></v-text-field>
                                    </template>
                                    <template v-else-if="header.key === 'amaliate_meydani_user_fullname'">
                                        <v-select v-model="item[header.key]" :items="usersList" item-title="full_name"
                                            item-value="user_id" variant="outlined" density="compact" hide-details
                                            :disabled="isAmaliyatDisabled(item)" class="text-center">
                                        </v-select>
                                    </template>
                                    <template v-else-if="header.key === 'dadeh_amaei_user_fullname'">
                                        <v-select v-model="item[header.key]" :items="dadehamaeiList"
                                            item-title="full_name" item-value="user_id" variant="outlined"
                                            density="compact" hide-details :disabled="isDadehAmaeiDisabled(item)"
                                            class="text-center">
                                        </v-select>
                                    </template>
                                    <template v-else-if="isBooleanColumn(header.key)">
                                        <v-checkbox v-model="item[header.key]" :true-value="true" :false-value="false"
                                            :disabled="!isEditableCheckbox(header.key, item)" hide-details
                                            density="compact"
                                            @change="handleCheckboxChange(item, header.key)"></v-checkbox>
                                    </template>
                                    <template v-else>
                                        {{ item[header.key] }}
                                    </template>
                                </td>
                            </tr>
                            <!-- Creative Loading Skeleton Rows -->
                            <template v-if="isLoading">
                                <tr v-for="i in 3" :key="'loading-' + i">
                                    <td v-for="header in roostaHeaders" :key="'skeleton-' + header.key">
                                        <div class="skeleton-loader"></div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </v-table>

                </v-infinite-scroll>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="saveRoostaData" :disabled="isSaveButtonDisabled">ذخیره تغییرات</v-btn>
                <v-btn color="error" @click="closeDialog">بستن</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { useIPStore } from '../stores/app';
import { useAuthStore } from '../stores/app';
export default {
    props: {
        modelValue: Boolean,
        roostaData: Array,
        roostaHeaders: Array,
        dataFirstItem: Object,
    },
    data() {
        return {
            originalData: [],
            visibleRoostaData: [],
            pageSize: 70,
            currentPage: 1,
            isLoading: false,
            searchTerm: '', // Search term data property
            initialCheckboxStates: {},
            usersList: [],
            dadehamaeiList: [],
            loadingUsers: false,
            // Add maps to store user name to ID mappings
            userNameToIdMap: new Map(),
            dadehAmaeiNameToIdMap: new Map()
        };
    },
    watch: {
        modelValue(newVal) {
            if (newVal) {
                this.searchTerm = '';
                this.originalData = JSON.parse(JSON.stringify(this.roostaData));
                this.loadInitialData();
                this.setInitialCheckboxStates(); // Add this line
                if (this.usersList.length === 0) {
                    this.fetchUsersList();
                }
                if (this.dadehamaeiList.length === 0) {
                    this.fetchDadehAmaeiList();
                }
            }
        },
    },

    computed: {
        filteredRoostaData() {
            if (!this.searchTerm) {
                return this.visibleRoostaData; // Return all data if no search term
            }
            const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
            return this.visibleRoostaData.filter(item => {
                return (
                    item.locationname.toLowerCase().includes(lowerCaseSearchTerm) ||
                    item.population_point_id.toString().includes(lowerCaseSearchTerm)
                );
            });
        },
        isSaveButtonDisabled() {
            return this.dataFirstItem === 'nazer';
        },
    },
    methods: {
        async fetchUsersList() {
            try {
                const ipStore = useIPStore();
                const authStore = useAuthStore();
                const SERVER_HOST = ipStore.SERVER_HOST;

                const response = await fetch(`${SERVER_HOST}/getostanusers`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users list');
                }

                const data = await response.json();
                this.usersList = data;
                // Update the name to ID mapping
                this.userNameToIdMap = new Map(
                    data.map(user => [user.full_name, user.user_id])
                );
            } catch (error) {
                console.error('Error fetching users list:', error);
                // می‌توانید پیام خطا به کاربر نشان دهید
            }
        },
        async fetchDadehAmaeiList() {
            try {
                const ipStore = useIPStore();
                const authStore = useAuthStore();
                const SERVER_HOST = ipStore.SERVER_HOST;

                const response = await fetch(`${SERVER_HOST}/getdadehamaeiusers`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users list');
                }

                const data = await response.json();
                this.dadehamaeiList = data;
                // Update the name to ID mapping
                this.dadehAmaeiNameToIdMap = new Map(
                    data.map(user => [user.full_name, user.user_id])
                );
            } catch (error) {
                console.error('Error fetching users list:', error);
                // می‌توانید پیام خطا به کاربر نشان دهید
            }
        },
        prepareForSave(data) {
            // Define special cases mapping
            const specialCases = {
                'نامشخص': '0',
                'نامشخص ': '0',
                'برون سپاری': '99999',
                'برون سپاری ': '99999',
                'نیروهای داخلی': '99998',
                'نیروهای داخلی ': '99998'
            };

            return data.map(item => {
                const newItem = { ...item };
                console.log(data);
                console.log(newItem);

                // Handle amaliate_meydani_user_fullname
                if (newItem.amaliate_meydani_user_fullname === null || newItem.amaliate_meydani_user_fullname === ' ') {
                    newItem.amaliate_meydani_user_fullname = null;
                } else if (specialCases[newItem.amaliate_meydani_user_fullname]) {
                    newItem.amaliate_meydani_user_fullname = specialCases[newItem.amaliate_meydani_user_fullname];
                } else if (typeof newItem.amaliate_meydani_user_fullname === 'string') {
                    const userId = this.userNameToIdMap.get(newItem.amaliate_meydani_user_fullname);
                    newItem.amaliate_meydani_user_fullname = userId || null;
                }

                // Handle dadeh_amaei_user_fullname
                if (newItem.dadeh_amaei_user_fullname === null || newItem.dadeh_amaei_user_fullname === ' ') {
                    newItem.dadeh_amaei_user_fullname = null;
                } else if (specialCases[newItem.dadeh_amaei_user_fullname]) {
                    newItem.dadeh_amaei_user_fullname = specialCases[newItem.dadeh_amaei_user_fullname];
                } else if (typeof newItem.dadeh_amaei_user_fullname === 'string') {
                    const userId = this.dadehAmaeiNameToIdMap.get(newItem.dadeh_amaei_user_fullname);
                    newItem.dadeh_amaei_user_fullname = userId || null;
                }

                return newItem;
            });
        },
        isAmaliyatDisabled(item) {
            const initialState = this.initialCheckboxStates[item.population_point_id];
            return initialState && initialState.amaliate_meydani_user_fullname !== null && initialState.amaliate_meydani_user_fullname !== undefined && initialState.amaliate_meydani_user_fullname !== ' ';
        },
        isDadehAmaeiDisabled(item) {
            const initialState = this.initialCheckboxStates[item.population_point_id];
            return initialState && initialState.dadeh_amaei_user_fullname !== null && initialState.dadeh_amaei_user_fullname !== undefined && initialState.dadeh_amaei_user_fullname !== ' ';
        },
        convertOldData() {
            this.visibleRoostaData.forEach(item => {
                if (item.amaliate_meydani_user_fullname === true) {
                    item.amaliate_meydani_user_fullname = "نامشخص";
                } else if (item.amaliate_meydani_user_fullname === false) {
                    item.amaliate_meydani_user_fullname = null;
                }
                if (item.dadeh_amaei_user_fullname === true) {
                    item.dadeh_amaei_user_fullname = "نامشخص";
                } else if (item.dadeh_amaei_user_fullname === false) {
                    item.dadeh_amaei_user_fullname = null;
                }
            });
        },
        handleCheckboxChange(item, key) {
            console.log(this.dataFirstItem);
            if (this.dataFirstItem === 'setad') {
                const checkboxes = ['bonyad_maskan', 'sayer_manabe', 'tarsim'];
                if (checkboxes.includes(key)) {
                    // Uncheck other checkboxes
                    checkboxes.forEach(checkbox => {
                        if (checkbox !== key) {
                            item[checkbox] = false;
                        }
                    });
                }
            }
            else if (this.dataFirstItem === 'QR') {
                const checkboxes = ['tolid_qr'];
                if (checkboxes.includes(key)) {
                    // Uncheck other checkboxes
                    checkboxes.forEach(checkbox => {
                        if (checkbox !== key) {
                            item[checkbox] = false;
                        }
                    });
                }
            }
            else if (this.dataFirstItem === 'nazer') {
                const checkboxes = [];
                if (checkboxes.includes(key)) {
                    // Uncheck other checkboxes
                    checkboxes.forEach(checkbox => {
                        if (checkbox !== key) {
                            item[checkbox] = false;
                        }
                    });
                }
            }
        },
        setInitialCheckboxStates() {
            this.initialCheckboxStates = this.roostaData.reduce((acc, item) => {
                acc[item.population_point_id] = {
                    amaliate_meydani_user_fullname: item.amaliate_meydani_user_fullname,
                    dadeh_amaei_user_fullname: item.dadeh_amaei_user_fullname
                };
                return acc;
            }, {});
        },
        isEditableCheckbox(key, item) {
            var editableColumns = [];
            if (this.dataFirstItem === 'setad') {
                editableColumns = [
                    'mokhtasat_rousta',
                    'mahdoudeh_rousta',
                ];
            } else if (this.dataFirstItem === 'QR') {
                editableColumns = [
                    'tolid_qr',
                ];
            } else if (this.dataFirstItem === 'nazer') {
                editableColumns = [];
            } else if (this.dataFirstItem !== 'manager') {
                editableColumns = [
                    'amaliate_meydani_user_fullname',
                    'dadeh_amaei_user_fullname',
                    'geocode',
                    'eslah_naghsheh',
                    'pelak_talfighi',
                ];
            }

            if (!editableColumns.includes(key)) {
                return false;
            }

            // برای سایر فیلدها، منطق قبلی حفظ شود
            const initialState = this.initialCheckboxStates[item.population_point_id];
            if (initialState && (key === 'pelak_talfighi')) {
                return !initialState[key];
            }

            return true;
        },
        isBooleanColumn(key) {
            const booleanColumns = [
                'bonyad_maskan',
                'sayer_manabe',
                'tarsim',
                'geocode',
                'eslah_naghsheh',
                'mokhtasat_rousta',
                'mahdoudeh_rousta',
                'tolid_qr',
                'pelak_talfighi',
            ];
            return booleanColumns.includes(key);
        },
        loadInitialData() {
            this.visibleRoostaData = this.roostaData.slice(0, this.pageSize);
            this.currentPage = 1;
            this.convertOldData();
        },
        async loadMoreRoostaData({ done }) {
            if (this.isLoading) return;

            this.isLoading = true;

            await new Promise(resolve => setTimeout(resolve, 500));

            const start = this.currentPage * this.pageSize;
            const end = start + this.pageSize;
            const nextPageData = this.roostaData.slice(start, end);

            if (nextPageData.length === 0) {
                done('empty');
                this.isLoading = false;
                return;
            }

            this.visibleRoostaData.push(...nextPageData);
            this.currentPage++;

            console.log(`Loaded ${nextPageData.length} new records. Current page: ${this.currentPage}`);

            done('ok');
            this.isLoading = false;
        },
        async saveRoostaData() {
            try {
                const ipStore = useIPStore();
                const authStore = useAuthStore();
                const SERVER_HOST = ipStore.SERVER_HOST;

                const modifiedRecords = this.visibleRoostaData.filter((record, index) => {
                    return !this.isEqual(record, this.originalData[index]);
                });

                if (modifiedRecords.length === 0) {
                    this.$emit('save-success', '<span dir="rtl">تغییری برای ذخیره وجود ندارد.</span>');
                    return;
                }
                console.log(modifiedRecords);
                // ✅ تبدیل داده‌ها قبل از ارسال به سرور
                const payload = this.prepareForSave(modifiedRecords);
                console.log(payload);
                const response = await fetch(`${SERVER_HOST}/api/locations/update-roosta`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to save roosta data');
                }

                this.originalData = JSON.parse(JSON.stringify(this.visibleRoostaData));
                this.$emit('save-success', '<span dir="rtl">اطلاعات با موفقیت ذخیره شد!</span>');
            } catch (error) {
                console.error('Error saving roosta data:', error);
                this.$emit('save-error', '<span dir="rtl">خطا در ذخیره اطلاعات!</span>');
            }
        },
        closeDialog() {
            this.$emit('update:modelValue', false);
        },
        isEqual(obj1, obj2) {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },
    },
};
</script>
<style scoped>
.search-bar {
    width: 25%;
    /* Set width to 1/4 of the available space */
    max-width: 300px;
    /* Optional: Set a maximum width */
}

/* Ensure the text inside the search bar is right-aligned */
.v-text-field input {
    text-align: right;
}

/* Other existing styles */
.skeleton-loader {
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.full-width-dialog {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
}

.table-container {
    max-height: 80vh;
    overflow-y: auto;
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

.text-h5 {
    font-family: 'B Traffic';
}

.v-btn {
    font-family: 'B Traffic';
    font-weight: bold;
}
</style>