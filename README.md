# 麦麦低卡/增肌营养规划师 (McD Nutrition Planner)

> 🍔 **麦当劳程序员创意开发大赛参赛作品**  
> 基于麦当劳官方 Model Context Protocol (MCP) 原生能力，打破“吃快餐=高热量负担”的传统认知，为控卡减脂、健身增肌与健康管理人群量身打造的智能营养配餐与闭环点餐 Skill。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://python.org)
[![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-red.svg)](https://mcp.mcd.cn)

---

## 📖 项目简介 (Overview)

在日常快餐消费中，健身增肌和减脂减重人群常面临三大困扰：
1. **热量黑盒**：不清楚每份餐品的真实卡路里与宏量营养素配比；
2. **选择困难**：为了控卡只能单调地点极少数单品，容易产生饮食倦怠；
3. **价格与优惠脱节**：健康单品组合往往价格偏高，缺乏与当前可用优惠券的高效联动。

**「麦麦低卡/增肌营养规划师」** 借助麦当劳官方 MCP Server，直接对接权威的营养素基础数据库（`list-nutrition-foods`）与门店实时供给（`query-meals`），配合多目标规划算法与麦麦省优惠券抵扣，生成“高蛋白、控热量、省钱包”的最优解，并一键直连收银下单闭环。

---

## 🎯 目标用户群体 (Target Audience)

- **减脂控卡族**：严格控制单餐热量摄入（如 ≤ 500 kcal），追求高饱腹感与低油脂；
- **健身增肌族**：追求极高蛋白质摄入（如单餐 ≥ 40g 优质蛋白），注重蛋白热量密度；
- **控糖与生酮人群**：严格限制高升糖指数碳水，偏好优质肉类蛋白与纯膳食纤维；
- **都市职场白领**：工作日午餐需要健康快捷、预算明确且不纠结的确定性配餐。

---

## 🛠️ MCP 核心集成能力 (MCP Integration)

本项目深度串联麦当劳官方 7 大 MCP 工具，打通完整的业务执行闭环：

| MCP Tool | 工具名称 | 在本项目中的作用与业务价值 |
| :--- | :--- | :--- |
| `list-nutrition-foods` | 餐品营养信息列表 | **核心底座**：获取能量(kcal)、蛋白质、脂肪、碳水、钠等官方数据 |
| `query-nearby-stores` | 查询附近门店 | 确定自提或外送履约餐厅与距离 |
| `query-meals` | 查询在售餐品列表 | 结合实时在售状态，确保推荐方案即时可买 |
| `query-meal-detail` | 查询餐品详情与替换 | 识别去沙拉酱、更换无糖饮料等定制微调能力 |
| `query-store-coupons` | 门店可用优惠券 | 匹配麦麦省立减券与品类特惠，降低高蛋白餐品成本 |
| `calculate-price` | 商品价格计算 | 实时核算折前原价、优惠券抵扣与应付净额 |
| `create-order` | 创建订单 | 一键生成包含取餐码与安全支付链接的闭环订单 |

> 完整架构图与时序流程请查阅 [MCP_INTEGRATION.md](file:///C:/Users/Raylan/.gemini/antigravity/scratch/mcd-nutrition-planner/MCP_INTEGRATION.md)。

---

## 🚀 快速上手与运行 (Quickstart)

本项目提供 **Node.js（推荐，零外部依赖）** 与 **Python** 双运行栈支持，开箱即用，自带麦当劳脱敏离线数据库支持。

### 环境要求
- Node.js ≥ 18.0 或 Python ≥ 3.8

### 1. 克隆代码
```bash
git clone https://github.com/<你的用户名>/mcd-nutrition-planner.git
cd mcd-nutrition-planner
```

### 2. 配置 MCP 凭证 (可选)
如果已申请麦当劳官方 MCP Token，可设置环境变量（若未设置，程序会自动降级至官方脱敏离线数据集运行）：
```bash
# Windows PowerShell
$env:MCD_MCP_TOKEN="YOUR_REAL_MCP_TOKEN"

# Linux / macOS
export MCD_MCP_TOKEN="YOUR_REAL_MCP_TOKEN"
```
配置文件模板见 [mcp-config.example.json](file:///C:/Users/Raylan/.gemini/antigravity/scratch/mcd-nutrition-planner/mcp-config.example.json)。

### 3. 运行配餐规划

#### 方式 A：Node.js 运行 (Zero Dependencies)
```bash
# 1. 经典减脂场景 (热量≤500kcal, 蛋白≥30g, 预算≤40元)
node index.js --goal fat-loss --max-calories 500 --min-protein 30

# 2. 增肌高蛋白场景 (热量≤800kcal, 蛋白≥45g)
node index.js --goal muscle-gain --max-calories 800 --min-protein 45

# 3. 触发下单闭环
node index.js --goal fat-loss --order
```

#### 方式 B：Python 运行
```bash
python main.py --goal fat-loss --max-calories 500 --min-protein 30 --order
```

---

## 💻 运行效果示例 (Sample Output)

```text
============================================================
   🍔 麦麦低卡/增肌营养规划师 (McD Nutrition Planner) 🍔
   基于麦当劳官方 MCP 协议打造的智能营养配餐 Skill
============================================================

【📋 营养规划需求】
• 设定目标: 减脂控卡 (Fat Loss)
• 热量上限: ≤ 500 kcal  |  蛋白质目标: ≥ 30 g  |  预算上限: ≤ ¥40.00

【🥗 专属推荐餐单组合】
----------------------------------------------------------------------
餐品名称                        热量(kcal)      蛋白质(g)       脂肪(g) 单价
----------------------------------------------------------------------
麦麦脆汁鸡 (单块)                 286             19.5            18.2    ¥14.0
鲜蔬杯 (配低脂沙拉汁)             48              1.8             0.5     ¥12.0
纯牛奶 (纸盒装)                  130             6.8             7.0     ¥11.0
----------------------------------------------------------------------

【📊 宏量营养素全景】
🔥 总能量: 464 kcal (达成率: 92.8%)
🥩 蛋白质: 28.1 g (达标率: 93.7%)
🥑 脂肪:   25.7 g
🍞 碳水:   29.8 g
🧂 钠含量: 795 mg

【💰 MCP 算价与优惠明细】
• 门店菜单原价:   ¥37.00
• 麦麦省优惠抵扣: -¥5.00
• 实付结算金额:   ¥32.00

【💡 定制控卡优化秘笈】
  - 麦麦脆汁鸡 (单块)：鲜嫩多汁，去脆皮可减少约 8g 脂肪
  - 鲜蔬杯 (配低脂沙拉汁)：富含膳食纤维，近乎零脂肪负担
  - 纯牛奶 (纸盒装)：天然优质乳钙与乳清蛋白

【🚀 触发 MCP create-order 订单闭环】
• 订单编号: MCD28069196
• 订单状态: CREATED_WAIT_PAY
• 到店自取码: A-304
• 支付链接: https://mcp.mcd.cn/pay/gateway?mock=true
>> 订单创建成功，请在有效期内完成支付！
```

---

## 📁 参赛项目结构规范 (Project Structure)

本项目严格遵循大赛机器人审查要求构建：

```text
mcd-nutrition-planner/
├── CONTEST_DECLARATION.md    # [必选] 官方参赛声明 (内容严格按规范保持不变)
├── MCP_INTEGRATION.md        # [必选] MCP 接入说明、时序图与业务价值
├── README.md                 # [必选] 项目详细说明与使用指引
├── mcp-config.example.json   # [必选] 脱敏 MCP 客户端配置示例
├── workbuddy.md              # [加分] WorkBuddy 对话记录与开发上下文
├── index.js                  # Node.js 原生主执行入口
├── package.json              # 项目配置文件
├── main.py                   # Python CLI 执行入口
├── planner.py                # 宏量营养素智能规划引擎
└── mcp_client.py             # MCP 客户端通信与协议实现
```

---

## 📜 参赛与开源声明

- 本项目由参赛者自主研发，严格遵守《麦当劳程序员节创意开发大赛活动规则》。
- 详细法律声明与使用提示参见 [CONTEST_DECLARATION.md](file:///C:/Users/Raylan/.gemini/antigravity/scratch/mcd-nutrition-planner/CONTEST_DECLARATION.md)。
