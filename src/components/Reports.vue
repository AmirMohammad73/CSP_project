<template>
    <v-container class="rtl">
        <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
                <v-card class="pa-4" elevation="2">
                    <v-select v-model="selectedItems" :items="items" item-title="name" item-value="name"
                        label="انتخاب استانها" multiple chips closable-chips clearable :loading="loading"
                        :error-messages="error" @update:modelValue="handleSelectionChange">
                        <template v-slot:selection="{ item, index }">
                            <v-chip v-if="index < 2" class="ma-1" color="primary">
                                {{ item.title }}
                            </v-chip>
                            <span v-if="index === 2" class="text-grey text-caption mx-2">
                                (+{{ selectedItems.length - 2 }} آیتم دیگر)
                            </span>
                        </template>

                        <template v-slot:item="{ item, props }">
                            <v-list-item v-bind="props">
                                <template v-slot:prepend="{ isSelected }">
                                    <v-checkbox-btn :model-value="isSelected" color="primary" />
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>
                    <v-btn color="primary" @click="exportToExcel" class="mt-4" :loading="exporting"
                        :disabled="selectedItems.length === 0">
                        Export to Excel
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const items = ref([])
const selectedItems = ref([])
const loading = ref(false)
const exporting = ref(false)
const error = ref('')

const fetchItems = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch('http://192.168.47.1:3001/ostans')
        const data = await response.json()
        items.value = data.map((location, index) => ({
            id: index + 1,
            name: location.ostantitle,
        }))
    } catch (err) {
        error.value = 'خطا در دریافت داده‌ها'
        console.error('Error fetching items:', err)
    } finally {
        loading.value = false
    }
}

const handleSelectionChange = () => {
    // Handle any additional logic when selection changes
}

const exportToExcel = async () => {
    exporting.value = true
    try {
        const response = await fetch('http://192.168.47.1:3001/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedItems: selectedItems.value }),
        })

        const data = await response.json()

        const transformedData = data.map(row => {
            const newRow = { ...row }
            for (const key in newRow) {
                if (newRow[key] === true) {
                    newRow[key] = '✔'
                } else if (newRow[key] === false) {
                    newRow[key] = ''
                }
            }
            return newRow
        })

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
        ]

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Items')

        const excelFileName = 'Selected_Items.xlsx'
        XLSX.writeFile(workbook, excelFileName)
    } catch (err) {
        error.value = 'خطا در صادرات به اکسل'
        console.error('Error exporting to Excel:', err)
    } finally {
        exporting.value = false
    }
}

onMounted(() => {
    fetchItems()
})
</script>

<style scoped>
.rtl {
    direction: rtl;
    text-align: right;
}

.v-select {
    width: 100%;
    max-width: 500px;
}

.v-card {
    border-radius: 12px;
}

.v-btn {
    width: 100%;
    max-width: 200px;
}
</style>