// ruralOperationsMonitoring.js
import { ref } from "vue";

export function useRuralOperationsMonitoring() {
    const tabs = ref([
        "Map Status",
        "Update Status",
        "Geocode Status",
        "License Plate Status",
        "National ID",
    ]);

    const headers = ref([
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Bonyad Maskan", value: "bonyad_maskan" },
            { text: "Sayer Manabe", value: "sayer_manabe" },
            { text: "Tarsim", value: "tarsim" },
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
        0: "http://172.16.8.33:3001/api/data", // Map Status
        1: "http://172.16.8.33:3001/api/update", // Update Status
        2: "http://172.16.8.33:3001/api/geocode", // Geocode Status
        3: "http://172.16.8.33:3001/api/license-plate", // License Plate Status
        4: "http://172.16.8.33:3001/api/national-id", // National ID
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}