/**
 * 240-hour visa-free transit rules.
 *
 * IMPORTANT: immigration rules change. This data is a best-effort snapshot
 * reviewed 2026-09-17 and MUST be verified against the National Immigration
 * Administration (NIA) before relying on it. The eligibility checker always
 * tells users to confirm with official sources.
 */

export interface TransitPort {
  id: string;
  label: string;
  city: string;
  allowedArea: string;
}

export interface VisaRules {
  lastReviewed: string;
  sourceUrl: string;
  /** 55-country list per the NIA announcement of 2025-07-04 (Indonesia added 2025-06-12). */
  eligibleCountries: string[];
  ports: TransitPort[];
  /** Minimum passport validity required, in months (NIA: at least 3 months validity). */
  passportValidityMonths: number;
  /** Maximum transit stay in hours. */
  maxStayHours: number;
}

export const visaRules: VisaRules = {
  lastReviewed: '2026-09-17',
  sourceUrl: 'https://en.nia.gov.cn/',
  // Verify against the official NIA list. This is the 55-country list
  // published by the NIA on 2025-07-04 (Indonesia added 2025-06-12).
  eligibleCountries: [
    // Europe (40)
    'Albania',
    'Austria',
    'Belarus',
    'Belgium',
    'Bosnia and Herzegovina',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Monaco',
    'Montenegro',
    'Netherlands',
    'North Macedonia',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Serbia',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'Ukraine',
    'United Kingdom',
    // Americas (6)
    'Argentina',
    'Brazil',
    'Canada',
    'Chile',
    'Mexico',
    'United States',
    // Oceania (2)
    'Australia',
    'New Zealand',
    // Asia (7)
    'Brunei',
    'Indonesia',
    'Japan',
    'Qatar',
    'Singapore',
    'South Korea',
    'United Arab Emirates',
  ],
  // 65 designated ports across 24 provinces, autonomous regions, and
  // municipalities per the NIA policy interpretation (2025-07-04).
  // Verify the complete list against the NIA before publishing.
  ports: [
    // Beijing (2)
    { id: 'beijing', label: 'Beijing Capital (PEK)', city: 'Beijing', allowedArea: 'Beijing municipality' },
    { id: 'beijing-daxing', label: 'Beijing Daxing (PKX)', city: 'Beijing', allowedArea: 'Beijing municipality' },
    // Tianjin (2)
    { id: 'tianjin', label: 'Tianjin Binhai (TSN)', city: 'Tianjin', allowedArea: 'Tianjin municipality' },
    { id: 'tianjin-port', label: 'Tianjin Port (passenger)', city: 'Tianjin', allowedArea: 'Tianjin municipality' },
    // Hebei (2)
    { id: 'shijiazhuang', label: 'Shijiazhuang Zhengding (SJW)', city: 'Shijiazhuang', allowedArea: 'Hebei province' },
    { id: 'qinhuangdao-port', label: 'Qinhuangdao Port (passenger)', city: 'Qinhuangdao', allowedArea: 'Hebei province' },
    // Liaoning (3)
    { id: 'shenyang', label: 'Shenyang Taoxian (SHE)', city: 'Shenyang', allowedArea: 'Liaoning province' },
    { id: 'dalian', label: 'Dalian Zhoushuizi (DLC)', city: 'Dalian', allowedArea: 'Liaoning province' },
    { id: 'dalian-port', label: 'Dalian Port (passenger)', city: 'Dalian', allowedArea: 'Liaoning province' },
    // Shanghai (3)
    { id: 'shanghai', label: 'Shanghai Pudong (PVG)', city: 'Shanghai', allowedArea: 'Shanghai municipality' },
    { id: 'shanghai-hongqiao', label: 'Shanghai Hongqiao (SHA)', city: 'Shanghai', allowedArea: 'Shanghai municipality' },
    { id: 'shanghai-port', label: 'Shanghai Port (passenger)', city: 'Shanghai', allowedArea: 'Shanghai municipality' },
    // Jiangsu (4)
    { id: 'nanjing', label: 'Nanjing Lukou (NKG)', city: 'Nanjing', allowedArea: 'Jiangsu province' },
    { id: 'sunan-shuofang', label: "Su'nan Shuofang (WUX)", city: 'Wuxi', allowedArea: 'Jiangsu province' },
    { id: 'yangzhou-taizhou', label: 'Yangzhou Taizhou (YTY)', city: 'Yangzhou', allowedArea: 'Jiangsu province' },
    { id: 'lianyungang-port', label: 'Lianyungang Port (passenger)', city: 'Lianyungang', allowedArea: 'Jiangsu province' },
    // Zhejiang (6)
    { id: 'hangzhou', label: 'Hangzhou Xiaoshan (HGH)', city: 'Hangzhou', allowedArea: 'Zhejiang province' },
    { id: 'ningbo', label: 'Ningbo Lishe (NGB)', city: 'Ningbo', allowedArea: 'Zhejiang province' },
    { id: 'wenzhou', label: 'Wenzhou Longwan (WNZ)', city: 'Wenzhou', allowedArea: 'Zhejiang province' },
    { id: 'yiwu', label: 'Yiwu Airport (YIW)', city: 'Yiwu', allowedArea: 'Zhejiang province' },
    { id: 'wenzhou-port', label: 'Wenzhou Port (passenger)', city: 'Wenzhou', allowedArea: 'Zhejiang province' },
    { id: 'zhoushan-port', label: 'Zhoushan Port (passenger)', city: 'Zhoushan', allowedArea: 'Zhejiang province' },
    // Anhui (2)
    { id: 'hefei', label: 'Hefei Xinqiao (HFE)', city: 'Hefei', allowedArea: 'Anhui province' },
    { id: 'huangshan', label: 'Huangshan Tunxi (TXN)', city: 'Huangshan', allowedArea: 'Anhui province' },
    // Fujian (5)
    { id: 'fuzhou', label: 'Fuzhou Changle (FOC)', city: 'Fuzhou', allowedArea: 'Fujian province' },
    { id: 'xiamen', label: 'Xiamen Gaoqi (XMN)', city: 'Xiamen', allowedArea: 'Fujian province' },
    { id: 'quanzhou', label: 'Quanzhou Jinjiang (JJN)', city: 'Quanzhou', allowedArea: 'Fujian province' },
    { id: 'wuyishan', label: 'Wuyishan Airport (WUS)', city: 'Wuyishan', allowedArea: 'Fujian province' },
    { id: 'xiamen-port', label: 'Xiamen Port (passenger)', city: 'Xiamen', allowedArea: 'Fujian province' },
    // Shandong (5)
    { id: 'jinan', label: 'Jinan Yaoqiang (TNA)', city: 'Jinan', allowedArea: 'Shandong province' },
    { id: 'qingdao', label: 'Qingdao Jiaodong (TAO)', city: 'Qingdao', allowedArea: 'Shandong province' },
    { id: 'yantai', label: 'Yantai Penglai (YNT)', city: 'Yantai', allowedArea: 'Shandong province' },
    { id: 'weihai', label: 'Weihai Dashuipo (WEH)', city: 'Weihai', allowedArea: 'Shandong province' },
    { id: 'qingdao-port', label: 'Qingdao Port (passenger)', city: 'Qingdao', allowedArea: 'Shandong province' },
    // Henan (1)
    { id: 'zhengzhou', label: 'Zhengzhou Xinzheng (CGO)', city: 'Zhengzhou', allowedArea: 'Henan province' },
    // Hubei (1)
    { id: 'wuhan', label: 'Wuhan Tianhe (WUH)', city: 'Wuhan', allowedArea: 'Hubei province' },
    // Hunan (2)
    { id: 'changsha', label: 'Changsha Huanghua (CSX)', city: 'Changsha', allowedArea: 'Hunan province' },
    { id: 'zhangjiajie', label: 'Zhangjiajie Hehua (DYG)', city: 'Zhangjiajie', allowedArea: 'Hunan province' },
    // Guangdong (10)
    { id: 'guangzhou', label: 'Guangzhou Baiyun (CAN)', city: 'Guangzhou', allowedArea: 'Guangdong province' },
    { id: 'shenzhen', label: "Shenzhen Bao'an (SZX)", city: 'Shenzhen', allowedArea: 'Guangdong province' },
    { id: 'jieyang', label: 'Jieyang Chaoshan (SWA)', city: 'Jieyang', allowedArea: 'Guangdong province' },
    { id: 'nansha-port', label: 'Nansha Port (passenger)', city: 'Guangzhou', allowedArea: 'Guangdong province' },
    { id: 'shekou-port', label: 'Shekou Port (passenger)', city: 'Shenzhen', allowedArea: 'Guangdong province' },
    { id: 'guangzhou-pazhou-ferry', label: 'Guangzhou Pazhou Ferry Terminal', city: 'Guangzhou', allowedArea: 'Guangdong province' },
    { id: 'zhongshan-port', label: 'Zhongshan Port (passenger)', city: 'Zhongshan', allowedArea: 'Guangdong province' },
    { id: 'hengqin-port', label: 'Hengqin Port', city: 'Zhuhai', allowedArea: 'Guangdong province' },
    { id: 'hzmb-port', label: 'Hong Kong-Zhuhai-Macao Bridge Port', city: 'Zhuhai', allowedArea: 'Guangdong province' },
    { id: 'west-kowloon', label: 'West Kowloon Station (high-speed rail)', city: 'Hong Kong', allowedArea: 'Guangdong province' },
    // Hainan (2)
    { id: 'haikou', label: 'Haikou Meilan (HAK)', city: 'Haikou', allowedArea: 'Hainan province' },
    { id: 'sanya', label: 'Sanya Phoenix (SYX)', city: 'Sanya', allowedArea: 'Hainan province' },
    // Chongqing (1)
    { id: 'chongqing', label: 'Chongqing Jiangbei (CKG)', city: 'Chongqing', allowedArea: 'Chongqing municipality' },
    // Guizhou (1)
    { id: 'guiyang', label: 'Guiyang Longdongbao (KWE)', city: 'Guiyang', allowedArea: 'Guizhou province' },
    // Jiangxi (1)
    { id: 'nanchang', label: 'Nanchang Changbei (KHN)', city: 'Nanchang', allowedArea: 'Nanchang and Jingdezhen cities' },
    // Shaanxi (1)
    { id: 'xian', label: "Xi'an Xianyang (XIY)", city: "Xi'an", allowedArea: 'Shaanxi province' },
    // Shanxi (1)
    { id: 'taiyuan', label: 'Taiyuan Wusu (TYN)', city: 'Taiyuan', allowedArea: 'Taiyuan and Datong cities' },
    // Heilongjiang (1)
    { id: 'harbin', label: 'Harbin Taiping (HRB)', city: 'Harbin', allowedArea: 'Harbin city' },
    // Guangxi (4)
    { id: 'nanning', label: 'Nanning Wuxu (NNG)', city: 'Nanning', allowedArea: '12 cities in Guangxi (Nanning, Liuzhou, Guilin, Wuzhou, Beihai, Fangchenggang, Qinzhou, Guigang, Yulin, Hezhou, Hechi, Laibin)' },
    { id: 'guilin', label: 'Guilin Liangjiang (KWL)', city: 'Guilin', allowedArea: '12 cities in Guangxi (Nanning, Liuzhou, Guilin, Wuzhou, Beihai, Fangchenggang, Qinzhou, Guigang, Yulin, Hezhou, Hechi, Laibin)' },
    { id: 'beihai', label: 'Beihai Fucheng (BHY)', city: 'Beihai', allowedArea: '12 cities in Guangxi (Nanning, Liuzhou, Guilin, Wuzhou, Beihai, Fangchenggang, Qinzhou, Guigang, Yulin, Hezhou, Hechi, Laibin)' },
    { id: 'beihai-port', label: 'Beihai Port (passenger)', city: 'Beihai', allowedArea: '12 cities in Guangxi (Nanning, Liuzhou, Guilin, Wuzhou, Beihai, Fangchenggang, Qinzhou, Guigang, Yulin, Hezhou, Hechi, Laibin)' },
    // Sichuan (2)
    { id: 'chengdu', label: 'Chengdu Tianfu (TFU)', city: 'Chengdu', allowedArea: "11 cities in Sichuan (Chengdu, Zigong, Luzhou, Deyang, Suining, Neijiang, Leshan, Yibin, Ya'an, Meishan, Ziyang)" },
    { id: 'chengdu-shuangliu', label: 'Chengdu Shuangliu (CTU)', city: 'Chengdu', allowedArea: "11 cities in Sichuan (Chengdu, Zigong, Luzhou, Deyang, Suining, Neijiang, Leshan, Yibin, Ya'an, Meishan, Ziyang)" },
    // Yunnan (3)
    { id: 'kunming', label: 'Kunming Changshui (KMG)', city: 'Kunming', allowedArea: "9 areas in Yunnan (Kunming, Yuxi, Chuxiong, Honghe, Wenshan, Pu'er, Xishuangbanna, Dali, Lijiang)" },
    { id: 'lijiang', label: 'Lijiang Sanyi (LJG)', city: 'Lijiang', allowedArea: "9 areas in Yunnan (Kunming, Yuxi, Chuxiong, Honghe, Wenshan, Pu'er, Xishuangbanna, Dali, Lijiang)" },
    { id: 'mohan-rail', label: 'Mohan Railway Port', city: 'Xishuangbanna', allowedArea: "9 areas in Yunnan (Kunming, Yuxi, Chuxiong, Honghe, Wenshan, Pu'er, Xishuangbanna, Dali, Lijiang)" },
  ],
  passportValidityMonths: 3,
  maxStayHours: 240,
};

export type NationalityStatus = 'eligible-list' | 'not-on-list';

export function nationalityStatus(nationality: string): NationalityStatus {
  const normalized = nationality.trim().toLowerCase();
  const matched = visaRules.eligibleCountries.some(
    (country) => country.toLowerCase() === normalized,
  );
  return matched ? 'eligible-list' : 'not-on-list';
}

export function findPort(portId: string): TransitPort | undefined {
  return visaRules.ports.find((port) => port.id === portId);
}
