// BSCIndices.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store

export function useBSCIndices() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "بهنگام سازی اطلاعات نشانی و ژئوکد نقاط شهری",
        "تامین و تولید لایه معابر شهری",
        "تعیین مختصات آبادی ها و تولید لایه گشت های روستایی",
        "تکمیل فرآیند طبقه بندی اطلاعات کارگاهی (ISIC)",
        "تامین نقشه پارسل بندی شده نقاط جغرافیایی",
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
    ]);

    // Use SERVER_HOST to construct the endpoints
    const tabEndpoints = {
        0: `${SERVER_HOST}/api/bsc/tab1`,
        1: `${SERVER_HOST}/api/bsc/tab2`,
        2: `${SERVER_HOST}/api/bsc/tab3`,
        3: `${SERVER_HOST}/api/bsc/tab4`,
        4: `${SERVER_HOST}/api/bsc/tab5`,
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}