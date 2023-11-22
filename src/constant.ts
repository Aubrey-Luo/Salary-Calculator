// 附：预扣率与速算扣除数表
export const levels = [
  { value: 36000, rate: 0.03, deduction: 0 },
  { value: 144000, rate: 0.1, deduction: 2520 },
  { value: 300000, rate: 0.2, deduction: 16920 },
  { value: 420000, rate: 0.25, deduction: 31920 },
  { value: 660000, rate: 0.3, deduction: 52920 },
  { value: 960000, rate: 0.35, deduction: 85920 },
  { value: 0, rate: 0.45, deduction: 181920 },
];

// 城市数据（包含公积金上下限及失业险个人比例）
export const cityConfig = {
  BeiJing: {
    name: '北京',
    fundMin: 2320,
    fundMax: 33891,
    unemploymentInsurance: 0.005
  },
  ShangHai: {
    name: '上海',
    fundMin: 2590,
    fundMax: 36549,
    unemploymentInsurance: 0.005
  },
  GuangZhou: {
    name: '广州',
    fundMin: 2300,
    fundMax: 38082,
    unemploymentInsurance: 0.002
  },
  ShenZhen: {
    name: '深圳',
    fundMin: 2360,
    fundMax: 41190,
    unemploymentInsurance: 0.003
  },
  HangZhou: {
    name: '杭州',
    fundMin: 2280,
    fundMax: 38390,
    unemploymentInsurance: 0.005
  },
  ChengDu: {
    name: '成都',
    fundMin: 2100,
    fundMax: 29353,
    unemploymentInsurance: 0.004
  },
  SuZhou: {
    name: '苏州',
    fundMin: 4494,
    fundMax: 33000,
    unemploymentInsurance: 0.005
  },
  WuHan: {
    name: '武汉',
    fundMin: 2010,
    fundMax: 31098,
    unemploymentInsurance: 0.003
  },
  HaErBin: {
    name: '哈尔滨',
    fundMin: 1860,
    fundMax: 24555,
    unemploymentInsurance: 0.005
  }
}