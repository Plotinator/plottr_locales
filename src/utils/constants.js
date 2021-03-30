import { Platform } from 'react-native'

// migration version
export const MIGRATION_VERSION = '2021.2.8'

// RCE
export const RCE_URL = 'https://plottr-web-rce.vercel.app/'
// export const RCE_URL = Platform.select({android: 'http://10.0.2.2:3000', ios: 'http://localhost:3000'})

// timeline cells
export const CELL_WIDTH = 175
export const CELL_HEIGHT = 93
export const LEFT_COLUMN_WIDTH = 150
// export const SKIP_VERIFICATION_DURATION = 2000; // 24 hours in seconds
export const SKIP_VERIFICATION_DURATION = 86400; // 24 hours in seconds

// licensing
export const USER_KEY = '@user_info'
export const SKIP_VERIFICATION_KEY = '@skip_verification'
export const BASE_URL = 'https://my.plottr.com'
export const OLD_PRODUCT_IDS = [12772, 12768, 11325, 11538, 14460, 29035]
export const PRO_PRODUCT_IDS = [33345, 33347]
export const SALES_PRODUCT_IDS = [...OLD_PRODUCT_IDS, ...PRO_PRODUCT_IDS]
export const LICENSE_PRODUCT_IDS = {mac:'11321', windows: '11322', pro: '33345', life: '33347'}
export const TESTR_EMAIL = 'special_tester_email@getplottr.com'
export const TESTR_CODE = 735373
export const AVAILABLE_SUBSCRIPTIONS_SKU = ['PlottrProdMonthlySub', 'PlottrProdYearlySub']
export const AVAILABLE_PRODUCTS_SKU = AVAILABLE_SUBSCRIPTIONS_SKU
