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
    'درخواست‌های کدپستی' // Only one tab since we have a single table
  ])

  // Define the headers for the table based on the query
  const headers = ref([
    [
      { text: 'استان', value: 'استان' },
      { text: 'زیر ۷۲ ساعت', value: 'زیر_۷۲_ساعت' },
      { text: 'بالای ۷۲ ساعت', value: 'بالای_۷۲_ساعت' },
      { text: 'مانده ماه', value: 'مانده_ماه' },
      { text: 'مانده ۶ ماه', value: 'مانده_۶_ماه' },
      { text: 'عملکرد ماه جاری', value: 'عملکرد_ماه_جاری' },
      { text: 'عملکرد ۶ ماه', value: 'عملکرد_۶_ماه' },
      { text: 'ستون ح', value: 'ستون_ح' },
      { text: 'ستون جدید', value: 'ستون_جدید' },
      { text: 'فرمول ۱', value: 'فرمول_۱' },
      { text: 'فرمول ۲', value: 'فرمول_۲' },
      { text: 'فرمول ۳', value: 'فرمول_۳' },
      { text: 'فرمول ۴', value: 'فرمول_۴' },
      { text: 'فرمول ۵', value: 'فرمول_۵' },
      { text: 'فرمول ۶', value: 'فرمول_۶' },
      { text: 'فرمول ۷', value: 'فرمول_۷' },
      { text: 'فرمول ۸', value: 'فرمول_۸' }
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
