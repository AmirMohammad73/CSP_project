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
      { text: 'رسیدگی شده زیر 72 ساعت', value: 'زیر_۷۲_ساعت' },
      { text: 'رسیدگی شده بالای 72 ساعت', value: 'بالای_۷۲_ساعت' },
      { text: 'مانده ماه جاری', value: 'مانده_ماه' },
      { text: 'مانده ماههای قبل (شش ماهه)', value: 'مانده_۶_ماه' },
      { text: 'آرشیو مورد تایید ماه جاری', value: 'عملکرد_ماه_جاری' },
      { text: 'آرشیو مورد تایید ماههای قبل', value: 'عملکرد_۶_ماه' },
      { text: 'مجموع درخواست های ماه جاری', value: 'ستون_ح' },
      { text: 'درصد رسیدگی به موقع به درخواست ها', value: 'ستون_جدید' },
      { text: 'امتیاز شاخص 1 (3 امتیاز)', value: 'فرمول_۱' },
      { text: 'درصد رسیدگی موفق به درخواست ها', value: 'فرمول_۲' },
      { text: 'امتیاز شاخص 2 (2 امتیاز)', value: 'فرمول_۳' },
      { text: 'درصد بلاتکیف ماه جاری', value: 'فرمول_۴' },
      { text: 'امتیاز شاخص 3 (1-امتیاز)', value: 'فرمول_۵' },
      { text: 'درصد بلاتکیف تجمعی (شش ماهه)', value: 'فرمول_۶' },
      { text: 'امتیاز شاخص 4 (2- امتیاز)', value: 'فرمول_۷' },
      { text: 'مجموع امتیاز', value: 'فرمول_۸' }
    ]
  ])

  // Define the endpoint for fetching the table data
  const tabEndpoints = {
    0: `${SERVER_HOST}/api/postalcode-request` // Endpoint for the table data
  }

  return {
    tabs,
    headers,
    tabEndpoints
  }
}
