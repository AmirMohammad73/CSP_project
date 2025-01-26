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
            { text: "استان", value: "ostantitle" },
            { text: "بنیاد مسکن", value: "bonyad_maskan" },
            { text: "سایر منابع", value: "sayer_manabe" },
            { text: "ترسیم", value: "tarsim" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Amaliate Meydani", value: "amaliate_meydani" },
            { text: "Dadeh Amaei", value: "dadeh_amaei" },
            { text: "Eslah Naghsheh", value: "eslah_naghsheh" },
            { text: "Total", value: "total" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Eslah Naghsheh", value: "eslah_naghsheh" },
            { text: "Tayid va Bargozari", value: "tayid_va_bargozari" },
            { text: "Daryafte Naghsheh", value: "daryafte_naghsheh" },
            { text: "Total", value: "total" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Tolid QR", value: "tolid_qr" },
            { text: "Pelak Talfighi", value: "pelak_talfighi" },
            { text: "Total", value: "total" },
        ],
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Shenaseh Melli", value: "shenaseh_melli" },
            { text: "Total", value: "total" },
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