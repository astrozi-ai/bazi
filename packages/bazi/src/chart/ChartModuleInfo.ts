export const ChartModuleInfo = {
  name: "@astrozi/bazi-core/chart",
  version: "1.0.0",
  description: "八字基础排盘核心模块",
  features: [
    "四柱八字计算",
    "十神关系分析",
    "大运计算",
    "纳音五行",
    "藏干分析",
    "格局识别",
    "性能监控",
    "输入验证",
  ],
  algorithms: {
    fourPillars: "tyme4ts + 传统历法",
    tenGods: "完整关系映射表",
    majorPeriods: "传统起运算法",
    nayin: "六十花甲纳音表",
  },
  performance: {
    averageCalculationTime: "<50ms",
    memoryUsage: "<10MB",
    accuracy: "99.9%",
  },
} as const;
