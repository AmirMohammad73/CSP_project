import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store

export function useGNAFCustomIndex() {
  // Access the Pinia store
  const ipStore = useIPStore();

  // Use SERVER_HOST from the store
  const SERVER_HOST = ipStore.SERVER_HOST;

  const tabs = ref(["شاخص اختصاصی GNAF"]);

  const headers = ref([
    [
      { text: "استان", value: "استان" },
      { text: "درصد پیشبینی روستایی", value: "درصد پیشبینی روستایی" },
      { text: "تحقق روستایی", value: "تحقق روستایی" },
      { text: "درصد پیشبینی شهری", value: "درصد پیشبینی شهری" },
      { text: "تحقق شهری", value: "تحقق شهری" },
    ]
  ]);

  // Use SERVER_HOST to construct the endpoints
  const tabEndpoints = {
    0: `${SERVER_HOST}/api/gnafindex`
  };

  return {
    tabs,
    headers,
    tabEndpoints
  };
}