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
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amalkard", value: "amalkard" },
            { text: "Dirkard", value: "dirkard" },
            { text: "Barnameh Diff", value: "barnameh_diff" },
        ],
        // Repeat for other tabs (same structure)
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amalkard", value: "amalkard" },
            { text: "Dirkard", value: "dirkard" },
            { text: "Barnameh Diff", value: "barnameh_diff" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amalkard", value: "amalkard" },
            { text: "Dirkard", value: "dirkard" },
            { text: "Barnameh Diff", value: "barnameh_diff" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amalkard", value: "amalkard" },
            { text: "Dirkard", value: "dirkard" },
            { text: "Barnameh Diff", value: "barnameh_diff" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amalkard", value: "amalkard" },
            { text: "Dirkard", value: "dirkard" },
            { text: "Barnameh Diff", value: "barnameh_diff" },
        ],
    ]);

    // Use SERVER_HOST to construct the endpoints
    const tabEndpoints = {
        0: `http://${SERVER_HOST}:3001/api/bsc/tab1`,
        1: `http://${SERVER_HOST}:3001/api/bsc/tab2`,
        2: `http://${SERVER_HOST}:3001/api/bsc/tab3`,
        3: `http://${SERVER_HOST}:3001/api/bsc/tab4`,
        4: `http://${SERVER_HOST}:3001/api/bsc/tab5`,
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}