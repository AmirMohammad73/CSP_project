import { ref } from "vue";
import { useIPStore } from "../stores/app"; // Import the Pinia store

export function useGNAFCustomIndex() {
  // Access the Pinia store
  const ipStore = useIPStore();

  // Use SERVER_HOST from the store
  const SERVER_HOST = ipStore.SERVER_HOST;

  const tabs = ref(["شاخص سفارشی GNAF"]);

  const headers = ref([
    [
      { text: "Ostantitle", value: "ostantitle" },
      { text: "P_Roosta_Diff", value: "p_roosta_diff" },
      { text: "T_Roosta", value: "t_roosta" },
      { text: "P_Shahr_Diff", value: "p_shahr_diff" },
      { text: "T_Shahr", value: "t_shahr" },
    ]
  ]);

  // Use SERVER_HOST to construct the endpoints
  const tabEndpoints = {
    0: `http://${SERVER_HOST}:3001/api/gnafindex`
  };

  return {
    tabs,
    headers,
    tabEndpoints
  };
}