"""
Core Nutrition Planning Algorithm.
Solves multi-objective optimization across calories, protein, fat, carbs and budget.
"""

from typing import List, Dict, Any, Optional
from mcp_client import McpClient


class NutritionPlanner:
    def __init__(self, mcp_client: Optional[McpClient] = None):
        self.client = mcp_client or McpClient()

    def generate_plan(
        self,
        goal: str = "fat-loss",
        max_calories: float = 500.0,
        min_protein: float = 30.0,
        max_budget: float = 40.0,
        user_note: str = ""
    ) -> Dict[str, Any]:
        """
        根据用户宏量营养素目标与预算，智能组合麦当劳最优餐食方案。
        """
        # 1. 调用 MCP 工具获取营养基础数据与门店菜单
        nutrition_res = self.client.call_tool("list-nutrition-foods", {})
        foods = nutrition_res.get("foods", [])

        # 分类归集
        mains = [f for f in foods if f["category"] == "main"]
        protein_sides = [f for f in foods if f["category"] == "protein_side"]
        sides = [f for f in foods if f["category"] == "side"]
        drinks = [f for f in foods if f["category"] == "drink"]

        candidate_plans = []

        # 遍历组合：(主食 + 饮品) 或 (主食 + 高蛋白小食 + 饮品) 或 (高蛋白小食 + 蔬菜杯 + 饮品)
        all_combinations = []

        # 组合模式 A: 主食 + 饮品
        for m in mains:
            for d in drinks:
                all_combinations.append([m, d])

        # 组合模式 B: 主食 + 高蛋白小食 + 饮品
        for m in mains:
            for ps in protein_sides:
                for d in drinks:
                    all_combinations.append([m, ps, d])

        # 组合模式 C: 高蛋白小食 + 轻食蔬菜 + 饮品 (极低碳水方案)
        for ps in protein_sides:
            for s in sides:
                for d in drinks:
                    all_combinations.append([ps, s, d])

        for combo in all_combinations:
            tot_cal = sum(item["calories"] for item in combo)
            tot_prot = sum(item["protein"] for item in combo)
            tot_fat = sum(item["fat"] for item in combo)
            tot_carb = sum(item["carbs"] for item in combo)
            tot_sodium = sum(item["sodium"] for item in combo)
            tot_price = sum(item["price"] for item in combo)

            # 硬性约束检查
            if tot_cal > max_calories or tot_price > max_budget:
                continue

            # 目标导向得分计算
            score = 0.0
            if goal == "fat-loss":
                # 减脂：蛋白质达标度高 + 热量剩余多 + 脂肪低 得分高
                protein_match = min(1.5, tot_prot / max(1.0, min_protein))
                calorie_saving = (max_calories - tot_cal) / max_calories
                fat_penalty = tot_fat / 40.0
                score = (protein_match * 4.0) + (calorie_saving * 3.0) - (fat_penalty * 1.5)

            elif goal == "muscle-gain":
                # 增肌：追求极高蛋白质总量与蛋白质热量密度
                protein_score = tot_prot * 2.0
                cal_density = (tot_prot * 4) / max(1.0, tot_cal)
                score = protein_score + (cal_density * 50.0)

            elif goal == "low-carb":
                # 低碳控糖：碳水越低、蛋白质越高得分越高
                carb_penalty = tot_carb * 0.8
                score = (tot_prot * 3.0) - carb_penalty

            else:  # balanced
                # 均衡健康：三大营养素配比接近黄金比 25% : 25% : 50%
                score = (tot_prot * 2.0) - (abs(tot_fat - 15) * 0.5)

            # 蛋白质未达标则适度扣分，但仍保留作为备选
            if tot_prot < min_protein:
                score -= (min_protein - tot_prot) * 2.0

            candidate_plans.append({
                "items": combo,
                "calories": tot_cal,
                "protein": tot_prot,
                "fat": tot_fat,
                "carbs": tot_carb,
                "sodium": tot_sodium,
                "price": tot_price,
                "score": score
            })

        # 按综合评分降序排序
        candidate_plans.sort(key=lambda x: x["score"], reverse=True)

        if not candidate_plans:
            # 如果条件过于苛刻无解，提供一个最接近约束的兜底方案
            best_plan = {
                "items": [mains[0], drinks[0]],
                "calories": mains[0]["calories"] + drinks[0]["calories"],
                "protein": mains[0]["protein"] + drinks[0]["protein"],
                "fat": mains[0]["fat"] + drinks[0]["fat"],
                "carbs": mains[0]["carbs"] + drinks[0]["carbs"],
                "sodium": mains[0]["sodium"] + drinks[0]["sodium"],
                "price": mains[0]["price"] + drinks[0]["price"],
                "score": 0.0,
                "warning": "未找到完全满足该硬性约束的组合，已为你推荐最接近的方案。"
            }
        else:
            best_plan = candidate_plans[0]

        # 2. 调用 MCP 算价工具核算优惠
        calc_res = self.client.call_tool("calculate-price", {"items": best_plan["items"]})
        best_plan["pricing"] = calc_res

        # 3. 生成定制调优建议
        tips = []
        for it in best_plan["items"]:
            if "note" in it and it["note"]:
                tips.append(f"- **{it['name']}**：{it['note']}")
        best_plan["tips"] = tips

        return best_plan
