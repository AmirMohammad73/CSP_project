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
            { text: "استان", value: "place" },
            { text: "بنیاد مسکن", value: "bonyad_maskan" },
            { text: "سایر منابع", value: "sayer_manabe" },
            { text: "ترسیم", value: "tarsim" },
        ],
        [
            { text: "استان", value: "place" },
            { text: "عملیات میدانی", value: "amaliate_meydani" },
            { text: "داده آمائی", value: "dadeh_amaei" },
            { text: "اصلاح و ارسال", value: "eslah_naghsheh" },
            { text: "مجموع", value: "total" },
        ],
        [
            { text: "استان", value: "place" },
            { text: "اصلاح نقشه", value: "eslah_naghsheh" },
            { text: "تایید و بارگذاری", value: "tayid_va_bargozari" },
            { text: "ژئوکد", value: "daryafte_naghsheh" },
            { text: "مجموع", value: "total" },
        ],
        [
            { text: "استان", value: "place" },
            { text: "QR تولید", value: "tolid_qr" },
            { text: "نصب پلاک", value: "pelak_talfighi" },
            { text: "مجموع", value: "total" },
        ],
        [
            { text: "استان", value: "place" },
            { text: "شناسه ملی", value: "shenaseh_melli" },
            { text: "مجموع", value: "total" },
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