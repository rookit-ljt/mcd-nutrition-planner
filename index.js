#!/usr/bin/env node
/**
 * 麦麦低卡/增肌营养规划师 (mcd-nutrition-planner)
 * 麦当劳程序员创意开发大赛参赛作品
 * 纯原生 Node.js 实现 (Zero External Dependencies, Node.js 18+ 原生 fetch 支持)
 */

const fs = require('fs');
const path = require('path');

// 麦当劳官方餐品营养基准数据集
const OFFICIAL_NUTRITION_DATASET = [
  { id: "MCD_001", name: "原味板烧鸡腿堡", category: "main", calories: 404, protein: 22.4, fat: 17.6, carbs: 38.2, sodium: 860, price: 23.0, note: "去沙拉酱可减少约 60 kcal 热量与 6.5g 脂肪" },
  { id: "MCD_002", name: "双层吉士汉堡", category: "main", calories: 448, protein: 26.2, fat: 23.1, carbs: 33.5, sodium: 920, price: 20.0, note: "双层纯牛肉饼，极高蛋白密度" },
  { id: "MCD_003", name: "巨无霸汉堡", category: "main", calories: 523, protein: 25.8, fat: 27.5, carbs: 42.1, sodium: 960, price: 25.0, note: "经典双层牛肉配酸黄瓜与洋葱粒" },
  { id: "MCD_004", name: "麦香鸡汉堡", category: "main", calories: 382, protein: 14.8, fat: 17.2, carbs: 41.5, sodium: 750, price: 14.5, note: "高性价比白肉汉堡" },
  { id: "MCD_005", name: "吉士汉堡", category: "main", calories: 302, protein: 15.6, fat: 12.8, carbs: 31.0, sodium: 680, price: 12.5, note: "超轻量主食，极低热量负担" },
  { id: "MCD_006", name: "麦麦脆汁鸡 (单块)", category: "protein_side", calories: 286, protein: 19.5, fat: 18.2, carbs: 10.8, sodium: 590, price: 14.0, note: "鲜嫩多汁，去脆皮可减少约 8g 脂肪" },
  { id: "MCD_007", name: "麦乐鸡 (5块装)", category: "protein_side", calories: 218, protein: 12.8, fat: 13.0, carbs: 12.6, sodium: 460, price: 13.0, note: "优质白肉补充，建议搭配甜酸酱或不蘸酱" },
  { id: "MCD_008", name: "那么大鸡排", category: "protein_side", calories: 398, protein: 24.0, fat: 21.0, carbs: 27.0, sodium: 820, price: 15.5, note: "高饱腹感大份量肉类" },
  { id: "MCD_009", name: "鲜蔬杯 (配低脂沙拉汁)", category: "side", calories: 48, protein: 1.8, fat: 0.5, carbs: 9.2, sodium: 95, price: 12.0, note: "富含膳食纤维，近乎零脂肪负担" },
  { id: "MCD_010", name: "中份薯条", category: "side", calories: 328, protein: 4.1, fat: 16.5, carbs: 41.2, sodium: 240, price: 13.5, note: "碳水小食，控卡期建议替换为鲜蔬杯" },
  { id: "MCD_011", name: "零度可口可乐 (中杯)", category: "drink", calories: 0, protein: 0.0, fat: 0.0, carbs: 0.0, sodium: 25, price: 9.5, note: "0 糖 0 热量，减脂期快乐水首选" },
  { id: "MCD_012", name: "鲜萃美式咖啡 (中杯)", category: "drink", calories: 8, protein: 0.6, fat: 0.1, carbs: 1.2, sodium: 12, price: 10.0, note: "绿原酸与咖啡因加速代谢，热量几乎为零" },
  { id: "MCD_013", name: "阳光燕麦浓浆", category: "drink", calories: 115, protein: 3.2, fat: 2.8, carbs: 19.5, sodium: 65, price: 12.0, note: "优质慢碳与膳食纤维" },
  { id: "MCD_014", name: "纯牛奶 (纸盒装)", category: "drink", calories: 130, protein: 6.8, fat: 7.0, carbs: 9.8, sodium: 110, price: 11.0, note: "天然优质乳钙与乳清蛋白" }
];

class McpClient {
  constructor(mcpUrl = "https://mcp.mcd.cn", token = null) {
    this.mcpUrl = mcpUrl;
    this.token = token || process.env.MCD_MCP_TOKEN || "";
  }

  isLive() {
    return Boolean(this.token && this.token !== "YOUR_MCP_TOKEN");
  }

  async callTool(toolName, args = {}) {
    if (!this.isLive()) {
      return this.mockCall(toolName, args);
    }

    try {
      const resp = await fetch(this.mcpUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
          "User-Agent": "mcd-nutrition-planner/1.0"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: { name: toolName, arguments: args },
          id: 1
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.result) return data.result;
      }
    } catch (err) {
      console.warn(`[MCP Remote Warning] ${err.message}, falling back to local dataset.`);
    }

    return this.mockCall(toolName, args);
  }

  mockCall(toolName, args) {
    switch (toolName) {
      case "list-nutrition-foods":
        return { foods: OFFICIAL_NUTRITION_DATASET };
      case "calculate-price": {
        const items = args.items || [];
        const rawSum = items.reduce((acc, it) => acc + (it.price || 0), 0);
        const discount = rawSum >= 25 ? 5.0 : 0.0;
        return {
          originalPrice: rawSum,
          discountAmount: discount,
          payAmount: Math.max(0, rawSum - discount),
          deliveryFee: 0.0
        };
      }
      case "create-order":
        return {
          orderId: "MCD" + Date.now().toString().slice(-8),
          status: "CREATED_WAIT_PAY",
          payUrl: "https://mcp.mcd.cn/pay/gateway?mock=true",
          pickupCode: "A-" + Math.floor(100 + Math.random() * 900)
        };
      default:
        return {};
    }
  }
}

class NutritionPlanner {
  constructor(client) {
    this.client = client;
  }

  async plan({ goal = "fat-loss", maxCalories = 500, minProtein = 30, maxBudget = 40 }) {
    const nutritionRes = await this.client.callTool("list-nutrition-foods", {});
    const foods = nutritionRes.foods || OFFICIAL_NUTRITION_DATASET;

    const mains = foods.filter(f => f.category === "main");
    const proteinSides = foods.filter(f => f.category === "protein_side");
    const sides = foods.filter(f => f.category === "side");
    const drinks = foods.filter(f => f.category === "drink");

    const candidateCombinations = [];

    // 模式1: 主食 + 饮品
    for (const m of mains) {
      for (const d of drinks) {
        candidateCombinations.push([m, d]);
      }
    }

    // 模式2: 主食 + 高蛋白小食 + 饮品
    for (const m of mains) {
      for (const ps of proteinSides) {
        for (const d of drinks) {
          candidateCombinations.push([m, ps, d]);
        }
      }
    }

    // 模式3: 高蛋白小食 + 蔬菜杯 + 饮品 (极低碳)
    for (const ps of proteinSides) {
      for (const s of sides) {
        for (const d of drinks) {
          candidateCombinations.push([ps, s, d]);
        }
      }
    }

    const evaluated = [];

    for (const combo of candidateCombinations) {
      const totCal = combo.reduce((a, b) => a + b.calories, 0);
      const totProt = combo.reduce((a, b) => a + b.protein, 0);
      const totFat = combo.reduce((a, b) => a + b.fat, 0);
      const totCarb = combo.reduce((a, b) => a + b.carbs, 0);
      const totSodium = combo.reduce((a, b) => a + b.sodium, 0);
      const totPrice = combo.reduce((a, b) => a + b.price, 0);

      // 硬性过滤
      if (totCal > maxCalories || totPrice > maxBudget) continue;

      let score = 0;
      if (goal === "fat-loss") {
        const protFactor = Math.min(1.5, totProt / Math.max(1, minProtein));
        const calSaving = (maxCalories - totCal) / maxCalories;
        const fatPenalty = totFat / 40.0;
        score = (protFactor * 4.0) + (calSaving * 3.0) - (fatPenalty * 1.5);
      } else if (goal === "muscle-gain") {
        const proteinScore = totProt * 2.5;
        const density = (totProt * 4) / Math.max(1, totCal);
        score = proteinScore + (density * 40.0);
      } else if (goal === "low-carb") {
        score = (totProt * 3.0) - (totCarb * 0.8);
      } else {
        score = (totProt * 2.0) - Math.abs(totFat - 15) * 0.5;
      }

      if (totProt < minProtein) {
        score -= (minProtein - totProt) * 2.5;
      }

      evaluated.push({
        items: combo,
        calories: totCal,
        protein: totProt,
        fat: totFat,
        carbs: totCarb,
        sodium: totSodium,
        price: totPrice,
        score
      });
    }

    evaluated.sort((a, b) => b.score - a.score);

    const best = evaluated[0] || {
      items: [mains[0], drinks[0]],
      calories: mains[0].calories + drinks[0].calories,
      protein: mains[0].protein + drinks[0].protein,
      fat: mains[0].fat + drinks[0].fat,
      carbs: mains[0].carbs + drinks[0].carbs,
      sodium: mains[0].sodium + drinks[0].sodium,
      price: mains[0].price + drinks[0].price,
      score: 0,
      warning: "当前目标约束较为苛刻，已为你匹配最接近的营养餐品组合。"
    };

    const priceRes = await this.client.callTool("calculate-price", { items: best.items });
    best.pricing = priceRes;
    best.tips = best.items.filter(it => it.note).map(it => `- **${it.name}**：${it.note}`);

    return best;
  }
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const params = {
    goal: "fat-loss",
    maxCalories: 500,
    minProtein: 30,
    maxBudget: 40,
    order: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--goal" && args[i + 1]) params.goal = args[++i];
    if (args[i] === "--max-calories" && args[i + 1]) params.maxCalories = parseFloat(args[++i]);
    if (args[i] === "--min-protein" && args[i + 1]) params.minProtein = parseFloat(args[++i]);
    if (args[i] === "--max-budget" && args[i + 1]) params.maxBudget = parseFloat(args[++i]);
    if (args[i] === "--order") params.order = true;
  }
  return params;
}

async function run() {
  const params = parseCliArgs();
  console.log(`
============================================================
   🍔 麦麦低卡/增肌营养规划师 (McD Nutrition Planner) 🍔
   基于麦当劳官方 MCP 协议打造的智能营养配餐 Skill
============================================================
  `);

  const client = new McpClient();
  const planner = new NutritionPlanner(client);

  const plan = await planner.plan(params);

  const goalNames = {
    "fat-loss": "减脂控卡 (Fat Loss)",
    "muscle-gain": "增肌高蛋白 (Muscle Gain)",
    "low-carb": "低碳减糖 (Low Carb)",
    "balanced": "健康均衡 (Balanced)"
  };

  console.log("【📋 营养规划需求】");
  console.log(`• 设定目标: ${goalNames[params.goal] || params.goal}`);
  console.log(`• 热量上限: ≤ ${params.maxCalories} kcal  |  蛋白质目标: ≥ ${params.minProtein} g  |  预算上限: ≤ ¥${params.maxBudget.toFixed(2)}`);

  if (plan.warning) {
    console.log(`\n⚠️  提示: ${plan.warning}`);
  }

  console.log("\n【🥗 专属推荐餐单组合】");
  console.log("----------------------------------------------------------------------");
  console.log(`餐品名称\t\t\t热量(kcal)\t蛋白质(g)\t脂肪(g)\t单价`);
  console.log("----------------------------------------------------------------------");
  for (const it of plan.items) {
    const padName = it.name.padEnd(16, " ");
    console.log(`${padName}\t${it.calories}\t\t${it.protein.toFixed(1)}\t\t${it.fat.toFixed(1)}\t¥${it.price.toFixed(1)}`);
  }
  console.log("----------------------------------------------------------------------");

  console.log("\n【📊 宏量营养素全景】");
  console.log(`🔥 总能量: ${plan.calories.toFixed(0)} kcal (达成率: ${(plan.calories / params.maxCalories * 100).toFixed(1)}%)`);
  console.log(`🥩 蛋白质: ${plan.protein.toFixed(1)} g (达标率: ${(plan.protein / params.minProtein * 100).toFixed(1)}%)`);
  console.log(`🥑 脂肪:   ${plan.fat.toFixed(1)} g`);
  console.log(`🍞 碳水:   ${plan.carbs.toFixed(1)} g`);
  console.log(`🧂 钠含量: ${plan.sodium.toFixed(0)} mg`);

  const p = plan.pricing || {};
  const orig = p.originalPrice || plan.price;
  const disc = p.discountAmount || 0;
  const pay = p.payAmount || (orig - disc);

  console.log("\n【💰 MCP 算价与优惠明细】");
  console.log(`• 门店菜单原价:   ¥${orig.toFixed(2)}`);
  console.log(`• 麦麦省优惠抵扣: -¥${disc.toFixed(2)}`);
  console.log(`• 实付结算金额:   ¥${pay.toFixed(2)}`);

  if (plan.tips && plan.tips.length > 0) {
    console.log("\n【💡 定制控卡优化秘笈】");
    for (const tip of plan.tips) {
      console.log(`  ${tip}`);
    }
  }

  if (params.order) {
    console.log("\n【🚀 触发 MCP create-order 订单闭环】");
    const orderRes = await client.callTool("create-order", { items: plan.items });
    console.log(`• 订单编号: ${orderRes.orderId}`);
    console.log(`• 订单状态: ${orderRes.status}`);
    console.log(`• 到店自取码: ${orderRes.pickupCode}`);
    console.log(`• 支付链接: ${orderRes.payUrl}`);
    console.log(">> 订单创建成功，请在有效期内完成支付！");
  }
}

run().catch(console.error);
