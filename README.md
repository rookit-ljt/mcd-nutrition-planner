# 麦麦低卡/增肌营养规划师 (McD Nutrition Planner)

> 🍔 **麦当劳程序员创意开发大赛参赛作品 (1024 Programmers' Day Challenge)**  
> 基于麦当劳官方 Model Context Protocol (MCP) 原生能力与腾讯 WorkBuddy，打破“吃快餐=高热量负担”的传统认知，为控卡减脂、健身增肌与健康管理量身打造的智能营养配餐与闭环点餐 Skill。

[![GitHub Repo](https://img.shields.io/badge/GitHub-rookit--ljt%2Fmcd--nutrition--planner-blue?logo=github)](https://github.com/rookit-ljt/mcd-nutrition-planner)
[![WorkBuddy](https://img.shields.io/badge/WorkBuddy-Skill%20Ready-orange.svg)](https://www.workbuddy.cn)
[![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-red.svg)](https://mcp.mcd.cn)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 项目简介 (Overview)

在日常快餐消费中，健身增肌和减脂减重人群常面临三大痛点：
1. **热量与营养黑盒**：不清楚每份餐品的真实卡路里与宏量营养素配比；
2. **选择困难与单调**：为了控卡只能长期吃少数固定单品，容易产生饮食倦怠；
3. **价格与优惠脱节**：高蛋白单品组合往往价格偏高，缺乏与当前可用优惠券的高效联动；
4. **定位容易偏航**：传统盲目选店容易误选到异地或非营业中门店。

**「麦麦低卡/增肌营养规划师」** 深度编排麦当劳官方 MCP Server，直接对接权威的营养素基础数据库（`list-nutrition-foods`）与门店实时供给（`query-meals`），配合多目标规划算法与麦麦省优惠券抵扣，生成“高蛋白、控热量、省钱包”的最优解，并一键直连收银下单闭环。

---

## 🎯 目标用户群体 (Target Audience)

- **减脂控卡族**：严格控制单餐热量摄入（如 ≤ 500 kcal），追求高饱腹感与低油脂；
- **健身增肌族**：追求极高蛋白质摄入（如单餐 ≥ 35g 优质蛋白），注重蛋白热量密度；
- **控糖与生酮人群**：严格限制高升糖指数碳水，偏好优质肉类蛋白与纯膳食纤维；
- **都市职场白领**：工作日午餐需要健康快捷、预算明确且不纠结的确定性配餐。

---

## 🛠️ MCP 核心集成能力 (MCP Integration)

本项目深度串联麦当劳官方 8 大 MCP 原生工具，打通完整的业务执行闭环：

| MCP Tool | 工具名称 | 在本项目中的作用与业务价值 |
| :--- | :--- | :--- |
| `query-nearby-stores` | 查询附近门店 | **精准定位**：采用 `searchType=2` 按城市与商圈关键字定位，杜绝误选异地收藏店 |
| `delivery-query-addresses` | 外送收货地址 | 外送场景下获取用户的收货地址及 `addressId` |
| `delivery-query-stores` | 可配送门店查询 | 外送场景下根据 `addressId` 精准匹配能够送达的门店 |
| `list-nutrition-foods` | 餐品营养信息列表 | **核心底座**：获取能量(kcal)、蛋白质、脂肪、碳水、钠等官方权威指标 |
| `query-meals` | 在售餐品列表 | 结合所选门店的实时在售状态，确保推荐方案即时可买 |
| `query-meal-detail` | 餐品详情与替换 | 识别去沙拉酱（立减60kcal）、更换无糖黑咖啡等定制微调能力 |
| `auto-bind-coupons` | 麦麦省一键领券 | 自动领取当前所有可领优惠券，保证省钱最大化 |
| `query-store-coupons` | 门店可用优惠券 | 匹配门店支持的立减券与品类特惠，降低高蛋白餐品成本 |
| `calculate-price` | 商品价格计算 | 实时核算折前原价、优惠券抵扣与应付净额 |
| `create-order` | 创建订单 | 一键生成包含取餐码与安全支付链接的闭环订单 |

> 详细的系统架构图、调用时序及业务价值请查阅 [MCP_INTEGRATION.md](MCP_INTEGRATION.md)。

---

## 🔄 核心编排链路 (SOP Workflow)

```mermaid
flowchart TD
    A[用户输入营养需求: 如“减脂午餐, 500大卡以内”] --> B[Step 1: 提取目标卡路里、蛋白质、预算约束]
    B --> C[Step 2: 城市与地标精准定位 获取 storeCode]
    C --> D[Step 3: 调用 list-nutrition-foods & query-meals 查营养与在售]
    D --> E[Step 4: 宏量营养素多目标组合决策]
    E --> F[Step 5: auto-bind-coupons & calculate-price 试算折后价]
    F --> G[Step 6: 输出精美配餐报告与定制优化Tips]
    G --> H{用户确认下单?}
    H -- 确认下单 --> I[调用 create-order 生成订单与支付链接]
    H -- 调整需求 --> J[根据反馈重新微调]
```

---

## 🚀 两种使用方式 (Usage Guide)

### 方式一：在 WorkBuddy 中作为原生智能体使用（推荐·一句话点餐）

本项目核心以 [`SKILL.md`](SKILL.md) 形式编排，完美契合腾讯 WorkBuddy 官方智能体规范。

1. **配置 MCP**：在 WorkBuddy 的【专家·技能·连接器】➔【连接器】中配置麦当劳 MCP：
   ```json
   {
     "mcpServers": {
       "mcd-mcp": {
         "type": "streamablehttp",
         "url": "https://mcp.mcd.cn",
         "headers": {
           "Authorization": "Bearer YOUR_MCP_TOKEN"
         }
       }
     }
   }
   ```
2. **加载技能**：将本项目的 [`SKILL.md`](SKILL.md) 放入 WorkBuddy 技能目录：
   - 路径：`~/.workbuddy/skills/mcd-nutrition-planner/SKILL.md`
3. **自然语言对话体验**：
   在 WorkBuddy 对话框中直接输入：
   > *“今天练了胸肌，我在深圳科技园，帮我配一份热量不超过 600 大卡、蛋白质大于 35 克的麦当劳午餐，并帮我找出最省钱的搭配，最后生成自取订单。”*

WorkBuddy 的大模型将自动按照 SOP 顺序完成：精准定位 ➔ 查营养 ➔ 配餐 ➔ 算价 ➔ 输出卡片 ➔ 确认后下单！

---

### 方式二：命令行 CLI 独立运行（开发与离线测试）

本项目同时提供了开箱即用的原生 Node.js（零外部依赖）与 Python 脚本，自带官方脱敏离线数据库支持。

```bash
# 1. 克隆代码
git clone https://github.com/rookit-ljt/mcd-nutrition-planner.git
cd mcd-nutrition-planner

# 2. 运行减脂场景 (热量≤500kcal, 蛋白≥30g, 预算≤40元)
node index.js --goal fat-loss --max-calories 500 --min-protein 30

# 3. 运行增肌高蛋白场景 (热量≤800kcal, 蛋白≥45g)
node index.js --goal muscle-gain --max-calories 800 --min-protein 45

# 4. 触发下单闭环测试
node index.js --goal fat-loss --order
```

---

## 💻 运行输出效果展示 (Sample Output)

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

本项目严格遵循大赛机器人自动化审查要求规范构建：

```text
mcd-nutrition-planner/
├── CONTEST_DECLARATION.md    # [必选] 官方参赛声明 (内容严格按规范保持完全一致)
├── MCP_INTEGRATION.md        # [必选] 麦当劳 MCP 接入说明、调用时序与业务价值
├── README.md                 # [必选] 项目详细说明、使用指南与功能全景
├── mcp-config.example.json   # [必选] 脱敏 MCP 客户端配置示例
├── workbuddy.md              # [加分] WorkBuddy 对话记录与开发上下文 (可获 3,000 积分)
├── SKILL.md                  # [核心] WorkBuddy 原生智能体 SOP 编排指令
├── index.js                  # Node.js 原生主执行入口
├── package.json              # 项目配置文件
├── main.py                   # Python CLI 执行入口
├── planner.py                # 宏量营养素多目标规划引擎
└── mcp_client.py             # MCP 客户端通信与降级实现
```

---

## 📜 参赛开源与规则遵守声明

- 本项目为「麦当劳程序员节创意开发大赛」参赛作品，由参赛者独立开发，严格遵守《麦当劳程序员节创意开发大赛活动规则》。
- 详细法律声明、合规保证与使用提示请参见 [CONTEST_DECLARATION.md](CONTEST_DECLARATION.md)。
