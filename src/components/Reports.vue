<template>
    <v-container class="rtl">
        <v-row>
            <v-col cols="12" md="6">
                <v-select v-model="selectedItems" :items="items" item-title="name" item-value="name"
                    label="انتخاب آیتم‌ها" multiple chips closable-chips clearable>
                    <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index < 2">
                            {{ item.title }}
                        </v-chip>
                        <span v-if="index === 2" class="text-grey text-caption mx-2">
                            (+{{ selectedItems.length - 2 }} آیتم دیگر)
                        </span>
                    </template>

                    <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props">
                            <template v-slot:prepend="{ isSelected }">
                                <v-checkbox-btn :model-value="isSelected" />
                            </template>
                        </v-list-item>
                    </template>
                </v-select>

                <div class="mt-4">
                    <strong>استانهای انتخاب شده:</strong>
                    {{ selectedItems.join(', ') }}
                </div>

                <v-btn color="primary" @click="exportToExcel" class="mt-4">
                    Export to Excel
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const items = ref([]) // The items will be fetched from the server
const selectedItems = ref([])

// Function to fetch data from the server
const fetchItems = async () => {
    try {
        const response = await fetch('http://172.16.8.33:3001/ostans')
        const data = await response.json()
        // Map the fetched data to match the structure expected by the component
        items.value = data.map((location, index) => ({
            id: index + 1, // Generate a unique ID for each item
            name: location.ostantitle,
        }))
    } catch (error) {
        console.error('Error fetching items:', error)
    }
}

// Fetch data when the component is mounted
onMounted(() => {
    fetchItems()
})

// Function to export data to Excel
const exportToExcel = async () => {
    try {
        // Send selected items to the server
        const response = await fetch('http://172.16.8.33:3001/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedItems: selectedItems.value }),
        });

        const data = await response.json();

        // Transform data: Replace TRUE with ✔ and FALSE with blank
        const transformedData = data.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
                if (newRow[key] === true) {
                    newRow[key] = '✔'; // Replace TRUE with ✔
                } else if (newRow[key] === false) {
                    newRow[key] = ''; // Replace FALSE with blank
                }
            }
            return newRow;
        });

        // Create Excel file
        const worksheetData = [
            [
                'استان',
                'شهرستان',
                'بخش',
                'دهستان',
                'روستا',
                'population_point_id',
                'بنیاد مسکن',
                'سایر منابع',
                'ترسیم',
                'عملیات میدانی',
                'داده آمائی',
                'اصلاح نقشه و ارسال',
                'ژئوکد',
                'مختصات روستا',
                'محدوده روستا',
                'تاریخ',
                'تعداد مکان ژئوکد شده',
                'تعداد مکان بهنگام شده',
                'تعداد ساختمان',
                'تعداد مکان بهنگام شده',
                'تعداد ساختمان ژئوکد شده',
                'تایید و بارگذاری',
                'تعداد پارسلها',
            ],
            ...transformedData.map(row => Object.values(row)),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Items');

        const excelFileName = 'Selected_Items.xlsx';
        XLSX.writeFile(workbook, excelFileName);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
};
</script>

<style scoped>
/* Add RTL styling */
.rtl {
    direction: rtl;
    text-align: right;
}

.v-select {
    width: 300px;
}
</style>