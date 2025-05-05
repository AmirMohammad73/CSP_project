// interoperabilityTaskForce.js
import { ref } from "vue";
import { useIPStore } from "../stores/app";

export function useInteroperabilityTaskForce() {
    const ipStore = useIPStore();
    const SERVER_HOST = ipStore.SERVER_HOST;

    const tabs = ref([
        "تکمیل داده ها",
        "بهبود کیفیت داده ها",
        "توسعه پایگاه داده ها",
        "دریافت API از سایر دستگاهها"
    ]);

    const headers = ref([
        [
            { text: "عملیات", value: "amaliat" },
            { text: "سال", value: "سال" },
            { text: "اقدامات", value: "eghdamat" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
            { text: "واحد سنجش", value: "vahede_sanjesh" },
            { text: "متولی", value: "motevali" },
            { text: "تحقق", value: "tahaghog" },
        ],
        [
            { text: "عملیات", value: "amaliat" },
            { text: "سال", value: "سال" },
            { text: "اقدامات", value: "eghdamat" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
            { text: "واحد سنجش", value: "vahede_sanjesh" },
            { text: "متولی", value: "motevali" },
            { text: "تحقق", value: "tahaghog" },
        ],
        [
            { text: "عملیات", value: "amaliat" },
            { text: "سال", value: "سال" },
            { text: "اقدامات", value: "eghdamat" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
            { text: "واحد سنجش", value: "vahede_sanjesh" },
            { text: "متولی", value: "motevali" },
            { text: "تحقق", value: "tahaghog" },
        ],
        [
            { text: "عملیات", value: "amaliat" },
            { text: "سال", value: "سال" },
            { text: "اقدامات", value: "eghdamat" },
            { text: "عملکرد", value: "amalkard" },
            { text: "دیرکرد", value: "dirkard" },
            { text: "برنامه", value: "barnameh_diff" },
            { text: "واحد سنجش", value: "vahede_sanjesh" },
            { text: "متولی", value: "motevali" },
            { text: "تحقق", value: "tahaghog" },
        ],

    ]);
    const tabEndpoints = {
        0: `${SERVER_HOST}/api/interoperability-task-force/dc`,
        1: `${SERVER_HOST}/api/interoperability-task-force/dqi`,
        2: `${SERVER_HOST}/api/interoperability-task-force/dbd`,
        3: `${SERVER_HOST}/api/interoperability-task-force/dapi`
    };

    return {
        tabs,
        headers,
        tabEndpoints
    };
}
