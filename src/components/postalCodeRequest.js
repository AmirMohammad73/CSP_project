// postalCodeRequest.js
import { ref } from 'vue'
import { useIPStore } from '../stores/app' // Import the Pinia store

export function usePostalCodeRequest () {
  // Access the Pinia store
  const ipStore = useIPStore()

  // Use SERVER_HOST from the store
  const SERVER_HOST = ipStore.SERVER_HOST

  // Define the tabs (if needed)
  const tabs = ref([
    'درخواستهای کدپستی' // Only one tab since we have a single table
  ])

  // Define the headers for the table based on the query
  const headers = ref([
    [
      { text: 'استان', value: 'ostantitle' },
      { text: 'زیر 72 ساعت', value: 'under72' },
      { text: 'بالای 72 ساعت', value: 'over72' },
      { text: 'مانده ماه', value: 'monthbalance' },
      { text: 'مانده 6 ماه', value: 'sixmonthbalance' },
      { text: 'آرشیو ماه جاری', value: 'currentmontharch' },
      { text: 'آرشیو 6 ماه', value: 'sixmontharch' },
      { text: 'ستون H', value: 'column_h' },
      { text: 'ستون جدید', value: 'new_column' },
      { text: 'فرمول 1', value: 'f1' },
      { text: 'فرمول 2', value: 'f2' },
      { text: 'فرمول 3', value: 'f3' },
      { text: 'فرمول 4', value: 'f4' },
      { text: 'فرمول 5', value: 'f5' },
      { text: 'فرمول 6', value: 'f6' },
      { text: 'فرمول 7', value: 'f7' },
      { text: 'فرمول 8', value: 'formula_8' }
    ]
  ])

  // Define the endpoint for fetching the table data
  const tabEndpoints = {
    0: `http://${SERVER_HOST}:3001/api/postalcode-request` // Endpoint for the table data
  }

  return {
    tabs,
    headers,
    tabEndpoints
  }
}
