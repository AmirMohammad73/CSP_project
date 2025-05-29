// urbanOperationsMonitoring.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store
export function useUrbanOperationsMonitoring() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "تامین آخرین نقشه به روز پارسل بندی شده",
        "بهنگام سازی اطلاعات نشانی و ژئوکد اماکن باقی مانده",
        "تامین لایه محدوده و حریم شهرها و تطبیق مرزگشت های پستی",
        "تامین لایه محلات",
        "تامین و تولید لایه معابر و اجرای فرآیند ژئوکد معابر",
        "نام گذاری معابر بی نام",
        "ساماندهی پلاک ساختمان های فاقد پلاک",
        "نصب پلاک کدپستی ده رقمی (QR Code)",
        "سرویس دریافت اطلاعات پروانه ساخت و پایانکار در شهر مرکز استان",
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
        0: `${SERVER_HOST}/api/bsc/tab1`,
        1: `${SERVER_HOST}/api/bsc/tab2`,
        2: `${SERVER_HOST}/api/bsc/tab3`,
        3: `${SERVER_HOST}/api/bsc/tab4`,
        4: `${SERVER_HOST}/api/bsc/tab5`,
        5: `${SERVER_HOST}/api/bsc/tab6`,
        6: `${SERVER_HOST}/api/bsc/tab7`,
        7: `${SERVER_HOST}/api/bsc/tab8`,
        8: `${SERVER_HOST}/api/bsc/tab9`,
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}