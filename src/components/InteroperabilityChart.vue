<template>
    <div class="example">
        <!-- Breadcrumb Navigation - RTL -->
        <div class="breadcrumb" dir="rtl">
            <span v-for="(item, index) in breadcrumbs" :key="index" @click="navigateTo(index)"
                :class="{ 'active': index === breadcrumbs.length - 1 }">
                <span v-if="index > 0" class="separator"> / </span>
                {{ item }}
            </span>
        </div>

        <!-- Chart -->
        <apexcharts width="100%" height="600" type="bar" :options="currentOptions" :series="currentSeries"
            @dataPointSelection="handleDataPointSelection"></apexcharts>
    </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
    name: "Chart",
    components: {
        apexcharts: VueApexCharts,
    },
    data: function () {
        return {
            // داده‌های اولیه
            initialData: {
                categories: ["تهران", "اصفهان", "فارس"],
                series: [
                    {
                        name: "جمعیت",
                        data: [8700000, 5200000, 4900000],
                    },
                ],
            },
            // داده‌های سطح شهرستان
            cityData: {
                تهران: {
                    categories: ["شهریار", "ری", "دماوند", "شمیرانات"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [300000, 350000, 150000, 250000],
                        },
                    ],
                },
                اصفهان: {
                    categories: ["کاشان", "خمینی شهر", "شاهین شهر", "نجف آباد"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [400000, 300000, 250000, 350000],
                        },
                    ],
                },
                فارس: {
                    categories: ["شیراز", "مرودشت", "کازرون", "فسا"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [1800000, 150000, 120000, 110000],
                        },
                    ],
                },
            },
            // داده‌های سطح بخش
            districtData: {
                شهریار: {
                    categories: ["بخش مرکزی", "بخش چهاردانگه", "بخش رباط کریم"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [120000, 90000, 90000],
                        },
                    ],
                },
                ری: {
                    categories: ["بخش مرکزی", "بخش کهریزک", "بخش فشاپویه"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [150000, 100000, 100000],
                        },
                    ],
                },
                کاشان: {
                    categories: ["بخش مرکزی", "بخش قمصر", "بخش نیاسر"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [200000, 100000, 100000],
                        },
                    ],
                },
            },
            // داده‌های سطح دهستان
            villageData: {
                "بخش مرکزی شهریار": {
                    categories: ["دهستان جوقین", "دهستان فردوس", "دهستان سعیدآباد"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [40000, 40000, 40000],
                        },
                    ],
                },
                "بخش کهریزک ری": {
                    categories: ["دهستان کهریزک", "دهستان قلعه نو", "دهستان خاوران"],
                    series: [
                        {
                            name: "جمعیت",
                            data: [35000, 30000, 35000],
                        },
                    ],
                },
            },
            breadcrumbs: ["استان‌ها"], // مسیر navigation
            selectedItems: [], // موارد انتخاب شده
            baseChartOptions: {
                chart: {
                    id: "drilldown-chart",
                },
                yaxis: {
                    title: {
                        text: "جمعیت",
                    },
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        endingShape: "rounded",
                    },
                },
                dataLabels: {
                    enabled: false,
                },
            },
        };
    },
    computed: {
        currentOptions() {
            const currentLevel = this.selectedItems.length;
            let title = "استان‌ها";

            if (currentLevel === 1) title = `شهرستان‌های ${this.selectedItems[0]}`;
            else if (currentLevel === 2) title = `بخش‌های ${this.selectedItems[1]}`;
            else if (currentLevel === 3) title = `دهستان‌های ${this.selectedItems[2]}`;

            return {
                ...this.baseChartOptions,
                xaxis: {
                    categories: this.currentCategories,
                    title: {
                        text: title,
                    },
                },
            };
        },
        currentSeries() {
            const level = this.selectedItems.length;

            if (level === 0) return this.initialData.series;
            if (level === 1) return this.cityData[this.selectedItems[0]].series;
            if (level === 2) return this.districtData[this.selectedItems[1]].series;
            if (level === 3) return this.villageData[this.selectedItems[2]].series;

            return [];
        },
        currentCategories() {
            const level = this.selectedItems.length;

            if (level === 0) return this.initialData.categories;
            if (level === 1) return this.cityData[this.selectedItems[0]].categories;
            if (level === 2) return this.districtData[this.selectedItems[1]].categories;
            if (level === 3) return this.villageData[this.selectedItems[2]].categories;

            return [];
        },
    },
    methods: {
        handleDataPointSelection(event, chartContext, config) {
            const selectedIndex = config.dataPointIndex;
            const currentLevel = this.selectedItems.length;

            if (currentLevel === 0) {
                // انتخاب استان
                const selectedProvince = this.initialData.categories[selectedIndex];
                this.selectedItems = [selectedProvince];
                this.breadcrumbs = ["استان‌ها", selectedProvince];
            }
            else if (currentLevel === 1) {
                // انتخاب شهرستان
                const selectedCity = this.cityData[this.selectedItems[0]].categories[selectedIndex];
                this.selectedItems = [this.selectedItems[0], selectedCity];
                this.breadcrumbs = ["استان‌ها", this.selectedItems[0], selectedCity];
            }
            else if (currentLevel === 2) {
                // انتخاب بخش
                const selectedDistrict = this.districtData[this.selectedItems[1]].categories[selectedIndex];
                this.selectedItems = [this.selectedItems[0], this.selectedItems[1], selectedDistrict];
                this.breadcrumbs = ["استان‌ها", this.selectedItems[0], this.selectedItems[1], selectedDistrict];
            }
        },
        navigateTo(index) {
            this.selectedItems = this.selectedItems.slice(0, index);
            this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
        },
    },
};
</script>

<style>
.breadcrumb {
    margin-bottom: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    text-align: right;
    direction: rtl;
}

.breadcrumb span {
    cursor: pointer;
    padding: 5px;
    font-family: 'B Traffic';
}

.breadcrumb span:hover {
    text-decoration: underline;
    color: #42b983;
}

.breadcrumb span.active {
    font-weight: bold;
    color: #42b983;
    cursor: default;
}

.breadcrumb span.active:hover {
    text-decoration: none;
}

.separator {
    margin: 0 5px;
    color: #999;
    cursor: default;
}
</style>