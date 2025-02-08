// ruralOperationsMonitoring.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store
export function useRuralOperationsMonitoring() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "وضعیت نقشه",
        "وضعیت بهنگام سازی",
        "وضعیت ژئوکد",
        "وضعیت پلاک",
        "وضعیت شناسه ملی",
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
        0: `http://${SERVER_HOST}:3001/api/data`, // Map Status
        1: `http://${SERVER_HOST}:3001/api/update`, // Update Status
        2: `http://${SERVER_HOST}:3001/api/geocode`, // Geocode Status
        3: `http://${SERVER_HOST}:3001/api/license-plate`, // License Plate Status
        4: `http://${SERVER_HOST}:3001/api/national-id`, // National ID
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}