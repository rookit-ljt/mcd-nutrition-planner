#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
麦麦低卡/增肌营养规划师 (mcd-nutrition-planner)
麦当劳程序员创意开发大赛参赛作品
基于麦当劳官方 MCP (list-nutrition-foods, calculate-price, create-order 等)
"""

import sys
import argparse
from mcp_client import McpClient
from planner import NutritionPlanner


def print_banner():
    print("""
============================================================
   🍔 麦麦低卡/增肌营养规划师 (McD Nutrition Planner) 🍔
   基于麦当劳官方 MCP 协议打造的智能营养配餐 Skill
============================================================
    """)


def format_report(plan: dict, goal: str, max_cal: float, min_prot: float, max_budget: float):
    items = plan["items"]
    cal = plan["calories"]
    prot = plan["protein"]
    fat = plan["fat"]
    carb = plan["carbs"]
    sodium = plan["sodium"]
    pricing = plan.get("pricing", {})
    orig_price = pricing.get("originalPrice", plan["price"])
    discount = pricing.get("discountAmount", 0.0)
    pay_amount = pricing.get("payAmount", orig_price - discount)

    goal_names = {
        "fat-loss": "减脂控卡 (Fat Loss)",
        "muscle-gain": "增肌高蛋白 (Muscle Gain)",
        "low-carb": "低碳减糖 (Low Carb)",
        "balanced": "健康均衡 (Balanced)"
    }

    print("\n【📋 营养规划需求】")
    print(f"• 设定目标: {goal_names.get(goal, goal)}")
    print(f"• 热量上限: ≤ {max_cal:.0f} kcal  |  蛋白质目标: ≥ {min_prot:.1f} g  |  预算上限: ≤ ¥{max_budget:.2f}")

    if "warning" in plan:
        print(f"\n⚠️  提示: {plan['warning']}")

    print("\n【🥗 专属推荐餐单组合】")
    print("┌" + "─"*32 + "┬" + "─"*10 + "┬" + "─"*10 + "┬" + "─"*8 + "┬" + "─"*8 + "┬" + "─"*8 + "┐")
    print(f"│ {'餐品名称':<28} │ {'热量(kcal)':<6} │ {'蛋白质(g)':<5} │ {'脂肪(g)':<4} │ {'碳水(g)':<4} │ {'价格':<6} │")
    print("├" + "─"*32 + "┼" + "─"*10 + "┼" + "─"*10 + "┼" + "─"*8 + "┼" + "─"*8 + "┼" + "─"*8 + "┤")
    for it in items:
        name = it['name'][:14]
        print(f"│ {name:<26} │ {it['calories']:^10.0f} │ {it['protein']:^10.1f} │ {it['fat']:^8.1f} │ {it['carbs']:^8.1f} │ ¥{it['price']:<5.1f} │")
    print("└" + "─"*32 + "┴" + "─"*10 + "┴" + "─"*10 + "┴" + "─"*8 + "┴" + "─"*8 + "┴" + "─"*8 + "┘")

    print("\n【📊 宏量营养素全景】")
    print(f"🔥 总能量: {cal:.0f} kcal (达成率: {(cal/max_cal*100):.1f}%)")
    print(f"🥩 蛋白质: {prot:.1f} g (达标率: {(prot/min_prot*100):.1f}%)")
    print(f"🥑 脂肪:   {fat:.1f} g")
    print(f"🍞 碳水:   {carb:.1f} g")
    print(f"🧂 钠含量: {sodium:.0f} mg")

    print("\n【💰 MCP 算价与优惠明细】")
    print(f"• 门店菜单原价:   ¥{orig_price:.2f}")
    print(f"• 麦麦省优惠抵扣: -¥{discount:.2f}")
    print(f"• 实付结算金额:   ¥{pay_amount:.2f}")

    if plan.get("tips"):
        print("\n【💡 定制控卡优化秘笈】")
        for tip in plan["tips"]:
            print(f"  {tip}")


def main():
    parser = argparse.ArgumentParser(description="麦麦低卡/增肌营养规划师")
    parser.add_argument("--goal", choices=["fat-loss", "muscle-gain", "low-carb", "balanced"], default="fat-loss",
                        help="规划目标: fat-loss(减脂), muscle-gain(增肌), low-carb(低碳), balanced(均衡)")
    parser.add_argument("--max-calories", type=float, default=500.0, help="卡路里上限 (kcal)")
    parser.add_argument("--min-protein", type=float, default=30.0, help="蛋白质最低目标 (g)")
    parser.add_argument("--max-budget", type=float, default=40.0, help="预算上限 (元)")
    parser.add_argument("--order", action="store_true", help="调用 MCP create-order 创建订单闭环")
    args = parser.parse_args()

    print_banner()

    client = McpClient()
    planner = NutritionPlanner(client)

    plan = planner.generate_plan(
        goal=args.goal,
        max_calories=args.max_calories,
        min_protein=args.min_protein,
        max_budget=args.max_budget
    )

    format_report(plan, args.goal, args.max_calories, args.min_protein, args.max_budget)

    if args.order:
        print("\n【🚀 触发 MCP create-order 订单闭环】")
        order_res = client.call_tool("create-order", {"items": plan["items"]})
        print(f"• 订单编号: {order_res.get('orderId')}")
        print(f"• 订单状态: {order_res.get('status')}")
        print(f"• 到店自取码: {order_res.get('pickupCode')}")
        print(f"• 支付链接: {order_res.get('payUrl')}")
        print(">> 订单创建成功，请在有效期内完成支付！")


if __name__ == "__main__":
    main()
