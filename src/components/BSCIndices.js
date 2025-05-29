// BSCIndices.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store

export function useBSCIndices() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "تامین آخرین نقشه به روز پارسل بندی شده",
        "بهنگام سازی اطلاعات نشانی و ژئوکد اماکن ",
        "تامین لایه محدوده و حریم روستاها",
        "تعیین مختصات و ترسیم لایه گشت روستایی",
        "تامین و تولید لایه معابر و اجرای فرآیند ژئوکد معابر",
        "نام گذاری گذاری معابر بی نام",
        "ساماندهی پلاک ساختمان های فاقد پلاک",
        "نصب پلاک کدپستی ده رقمی (QR Code)",
        "دریافت برخط تغییرات اطلاعات نشانی و ساخت و ساز",
    ]);

    const headers = ref([
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        // Repeat for other tabs (same structure)
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
        [
            { text: "استان", value: "ostantitle" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
        ],
    ]);

    // Use SERVER_HOST to construct the endpoints
    const tabEndpoints = {
        0: `${SERVER_HOST}/api/bsc/tab10`,
        1: `${SERVER_HOST}/api/bsc/tab11`,
        2: `${SERVER_HOST}/api/bsc/tab12`,
        3: `${SERVER_HOST}/api/bsc/tab13`,
        4: `${SERVER_HOST}/api/bsc/tab14`,
        5: `${SERVER_HOST}/api/bsc/tab15`,
        6: `${SERVER_HOST}/api/bsc/tab16`,
        7: `${SERVER_HOST}/api/bsc/tab17`,
        8: `${SERVER_HOST}/api/bsc/tab18`,
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}