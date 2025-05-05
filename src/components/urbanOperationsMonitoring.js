// urbanOperationsMonitoring.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store
export function useUrbanOperationsMonitoring() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "بروزرسانی نقشه پارسل",
        "تکمیل مکانی سازی (ژئوکد ساختمان/پلاک)",
        "تامین نقشه لایه معابر",
        "مکانی سازی (ژئوکد) معابر",
        "تولید لایه بلوک شهری و تطبیق با مرکز آمار",
        "تامین لایه نقشه محدوده",
        "بهنگام سازی اطلاعات اماکن",
        "ساماندهی ساختمان های بدون پلاک",
        "ساماندهی معابر فاقد نام",
        "ساماندهی نام و مرز قانونی محلات شهری و ژئوکد محله",
        "استاندارد سازی نشانی اماکن",
        "تطبیق محدوده گشت های پستی و محدوده",
    ]);

    const headers = ref([
        [
            { text: "استان", value: "استان" },
            { text: "بنیاد مسکن", value: "بنیاد مسکن" },
            { text: "سایر منابع", value: "سایر منابع" },
            { text: "ترسیم", value: "ترسیم" },
        ],
        [
            { text: "استان", value: "استان" },
            { text: "عملیات میدانی", value: "عملیات میدانی" },
            { text: "داده آمائی", value: "داده آمائی" },
            { text: "اصلاح و ارسال", value: "اصلاح و ارسال" },
            { text: "مجموع", value: "مجموع روستاها" },
        ],
        [
            { text: "استان", value: "استان" },
            { text: "اصلاح نقشه", value: "اصلاح نقشه" },
            { text: "تایید و بارگذاری", value: "تایید و بارگذاری" },
            { text: "ژئوکد", value: "ژئوکد" },
            { text: "مجموع", value: "مجموع روستاها" },
        ],
        [
            { text: "استان", value: "استان" },
            { text: "QR تولید", value: "تولید QR" },
            { text: "نصب پلاک", value: "نصب پلاک" },
            { text: "مجموع", value: "مجموع روستاها" },
        ],
        [
            { text: "استان", value: "استان" },
            { text: "شناسه ملی", value: "شناسه ملی" },
            { text: "مجموع", value: "مجموع" },
        ],
    ]);

    const tabEndpoints = {
        0: `${SERVER_HOST}/api/data`, // Map Status
        1: `${SERVER_HOST}/api/update`, // Update Status
        2: `${SERVER_HOST}/api/geocode`, // Geocode Status
        3: `${SERVER_HOST}/api/license-plate`, // License Plate Status
        4: `${SERVER_HOST}/api/national-id`, // National ID
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}