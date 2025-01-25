// postalCodeRequest.js
import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store

export function usePostalCodeRequest() {
    // Access the Pinia store
    const ipStore = useIPStore();

    // Use SERVER_HOST from the store
    const SERVER_HOST = ipStore.SERVER_HOST;

    // Define the tabs (if needed)
    const tabs = ref([
        "Postal Code Request Data", // Only one tab since we have a single table
    ]);

    // Define the headers for the table based on the query
    const headers = ref([
        [
            { text: "Ostantitle", value: "ostantitle" },
            { text: "Under 72", value: "under72" },
            { text: "Over 72", value: "over72" },
            { text: "Monthly Balance", value: "monthbalance" },
            { text: "Six Month Balance", value: "sixmonthbalance" },
            { text: "Current Month Archive", value: "currentmontharch" },
            { text: "Six Month Archive", value: "sixmontharch" },
            { text: "Column H", value: "column_H" },
            { text: "New Column", value: "new_column" },
            // { text: "Formula 1", value: "formula_1" },
            // { text: "Formula 2", value: "formula_2" },
            // { text: "Formula 3", value: "formula_3" },
            // { text: "Formula 4", value: "formula_4" },
            // { text: "Formula 5", value: "formula_5" },
            // { text: "Formula 6", value: "formula_6" },
            // { text: "Formula 7", value: "formula_7" },
            { text: "Formula 8", value: "formula_8" },
        ],
    ]);

    // Define the endpoint for fetching the table data
    const tabEndpoints = {
        0: `http://${SERVER_HOST}:3001/api/postalcode-request`, // Endpoint for the table data
    };

    return {
        tabs,
        headers,
        tabEndpoints,
    };
}