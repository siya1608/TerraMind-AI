import os
import json
import time
from typing import Dict, Any, List
import requests

from app.config import settings

class AIAgentCoordinator:
    """
    Orchestrates the 8 climate agents for TerraMind AI.
    Implements standard prompts and coordinates responses.
    Includes fallback rules if OPENAI_API_KEY is not defined.
    """
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    def execute_collaboration(self, task_description: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates agents based on task.
        Example: 'Optimize Travel' -> Travel Optimization Agent + Carbon Analyst + Prediction Agent.
        """
        # Determine focus area based on description
        task_lower = task_description.lower()
        
        # Step-by-step logs for inter-agent telemetry display
        reasoning_logs = []
        
        # We simulate the multi-agent dialog step-by-step.
        # This keeps the experience alive and provides detailed telemetry.
        
        if "travel" in task_lower or "flight" in task_lower or "car" in task_lower:
            flow_type = "travel"
            agents_involved = ["Carbon Analyst", "Travel Optimization", "Prediction Agent", "Sustainability Coach"]
        elif "energy" in task_lower or "electric" in task_lower or "solar" in task_lower:
            flow_type = "energy"
            agents_involved = ["Carbon Analyst", "Energy Optimization", "Climate Research", "ESG Intelligence"]
        elif "shop" in task_lower or "buy" in task_lower or "clothe" in task_lower:
            flow_type = "shopping"
            agents_involved = ["Carbon Analyst", "Green Shopping", "Climate Research", "Sustainability Coach"]
        else:
            flow_type = "general"
            agents_involved = ["Carbon Analyst", "Climate Research", "Prediction Agent", "Sustainability Coach"]
            
        # Compile user context summary
        total_co2 = user_context.get("total_co2", 0.35)
        score = user_context.get("sustainability_score", 65.0)
        level = user_context.get("current_level", "Eco Explorer")
        
        # Let's perform the LLM call or simulation
        if self.api_key:
            # Connect to OpenAI to generate high-fidelity collaborative analysis
            try:
                system_prompt = (
                    f"You are orchestrating a collaborative team of AI Climate Agents: {', '.join(agents_involved)}. "
                    f"The user has a monthly carbon footprint of {total_co2} tons CO2e, a sustainability score of {score}%, and level '{level}'. "
                    f"Task: '{task_description}'.\n"
                    f"Generate a step-by-step dialogue of these agents collaborating, followed by a final recommendation report."
                )
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Execute collaboration on task: '{task_description}'"}
                    ],
                    "temperature": 0.7
                }
                response = requests.post("https://api.openai.com/v1/chat/completions", headers=self.headers, json=payload, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    ai_content = data["choices"][0]["message"]["content"]
                    
                    # Parse into logs and report
                    lines = ai_content.split("\n")
                    final_rec = []
                    log_entries = []
                    
                    for line in lines:
                        if line.startswith("[") or ":" in line:
                            # Dialog line
                            parts = line.split(":", 1)
                            if len(parts) == 2:
                                agent = parts[0].replace("[", "").replace("]", "").strip()
                                message = parts[1].strip()
                                log_entries.append({"agent": agent, "message": message})
                        else:
                            final_rec.append(line)
                            
                    if not log_entries:
                        log_entries = [{"agent": agent, "message": "Analyzing data matrices..."} for agent in agents_involved]
                        
                    return {
                        "status": "completed",
                        "agent_outputs": log_entries,
                        "final_recommendation": "\n".join(final_rec)
                    }
            except Exception as e:
                # Log error and fall back to simulation
                print(f"[AGENT ERROR] API call failed: {e}. Falling back to simulation.")
                
        # --- Fallback Multi-Agent Simulation Engine ---
        # Provides rich, realistic, context-aware dialogues that simulate LLM behavior.
        time.sleep(0.5)  # simulate processing delay
        
        if flow_type == "travel":
            agent_outputs = [
                {
                    "agent": "Carbon Analyst",
                    "message": f"Scanning user travel entries. Current baseline transport emissions sit at {round(total_co2 * 0.4, 2)} tons CO2. Extrapolating flight metrics..."
                },
                {
                    "agent": "Travel Optimization",
                    "message": "Isolating high-altitude jetstream wind data for flight patterns. Proposing transit shift: replacing short-haul connections with high-speed rail limits emissions by 42%."
                },
                {
                    "agent": "Prediction Agent",
                    "message": "Plotting trajectory: adjusting this travel parameter shortens net-zero equilibrium time-horizon by 4.2 months. Rating will improve to A-."
                },
                {
                    "agent": "Sustainability Coach",
                    "message": "Syncing itinerary with local certified green hotels. Recommend adding a 15kg weight limit to luggage to shave off an extra 12kg of CO2."
                }
            ]
            final_rec = (
                f"### Travel Optimization Report\n\n"
                f"**Agents Engaged:** Carbon Analyst, Travel Optimization, Prediction Agent, Sustainability Coach\n\n"
                f"**Strategic Assessment:**\n"
                f"Your travel carbon load is currently high due to flight emissions. By implementing high-speed rail offsets for segments under 500km, we project a **{round(total_co2 * 0.15, 2)} ton** monthly CO2 reduction.\n\n"
                f"**Action Plan:**\n"
                f"1. **Rail Substitution**: Use train routes for intermediate European connections.\n"
                f"2. **Luggage Trimming**: Keep checked bag under 15kg to save fuel load.\n"
                f"3. **Certifications**: Book LEED Platinum accommodation at your destination."
            )
            
        elif flow_type == "energy":
            agent_outputs = [
                {
                    "agent": "Carbon Analyst",
                    "message": f"Parsing utility invoices. Electricity consumption accounts for {round(total_co2 * 0.35, 2)} tons. LPG usage shows peak anomalies."
                },
                {
                    "agent": "Energy Optimization",
                    "message": "Detecting vampire power loads. Engaging smart HVAC thermostat schedules. Solar panel addition would cover 65% of grid requirements."
                },
                {
                    "agent": "Climate Research",
                    "message": "Local grid mix utilizes 48% coal. Solar integration here has a high displacement yield, preventing 2.1 tons of offset emissions annually."
                },
                {
                    "agent": "ESG Intelligence",
                    "message": "Verified green credentials logged. This configuration enhances corporate/personal sustainability index alignment to AA+ level."
                }
            ]
            final_rec = (
                f"### Energy Efficiency & Audit Report\n\n"
                f"**Agents Engaged:** Carbon Analyst, Energy Optimization, Climate Research, ESG Intelligence\n\n"
                f"**Strategic Assessment:**\n"
                f"Your electricity grid mix is coal-heavy, amplifying your household emissions. Implementing smart device management and micro-solar will improve your sustainability score to **{min(100.0, score + 12)}%**.\n\n"
                f"**Action Plan:**\n"
                f"1. **Vampire Draw Prevention**: Install smart power strips for media panels.\n"
                f"2. **Thermostat Automation**: Keep cooling at 24°C during peak rate hours.\n"
                f"3. **Clean Energy Transition**: Switch to a renewable energy supplier tariff."
            )
            
        elif flow_type == "shopping":
            agent_outputs = [
                {
                    "agent": "Carbon Analyst",
                    "message": f"Analyzing monthly expenditures. Retail items account for {round(total_co2 * 0.18, 2)} tons CO2. High-volume purchases noted in clothing."
                },
                {
                    "agent": "Green Shopping",
                    "message": "Cross-referencing circular vendors. Recommending organic cotton alternatives and local recycling drop-off programs."
                },
                {
                    "agent": "Climate Research",
                    "message": "Polyester manufacturing produces 3x the carbon of hemp fibers. Circular textile systems reduce landfill methane emissions."
                },
                {
                    "agent": "Sustainability Coach",
                    "message": "Set a goal to purchase circular-certified products. A 3-item clothing limit this month will earn +150 XP."
                }
            ]
            final_rec = (
                f"### Sustainable Consumption Report\n\n"
                f"**Agents Engaged:** Carbon Analyst, Green Shopping, Climate Research, Sustainability Coach\n\n"
                f"**Strategic Assessment:**\n"
                f"Fast fashion and electronic spending comprise a significant hidden footprint. Embracing circular-certified vendors can curb shopping-related emissions by **35%**.\n\n"
                f"**Action Plan:**\n"
                f"1. **Circular Clothing**: Buy from verified organic or recycled-material brands.\n"
                f"2. **Pre-Owned Focus**: Substitute one new purchase with a refurbished or second-hand alternative.\n"
                f"3. **Materials Check**: Avoid synthetic polyester in favor of biodegradable fibers like hemp or linen."
            )
            
        else:
            agent_outputs = [
                {
                    "agent": "Carbon Analyst",
                    "message": f"Aggregating full footprint categories. Net output is {total_co2} tons per month. Score: {score}."
                },
                {
                    "agent": "Climate Research",
                    "message": "Planetary vital checks: Global CO2 ppm is 421.5. Local temperature anomaly is +1.1°C. Local actions are critical to stabilize ecosystems."
                },
                {
                    "agent": "Prediction Agent",
                    "message": "Predictive forecast models show that maintaining the current consumption pace reaches net-neutral baseline by Q3 2027."
                },
                {
                    "agent": "Sustainability Coach",
                    "message": "Reviewing active challenges. Recommend completing the weekly 'Water Conscious' sprint to boost streak and unlock the Earth Saver badge."
                }
            ]
            final_rec = (
                f"### System Climate Diagnostics\n\n"
                f"**Agents Engaged:** Carbon Analyst, Climate Research, Prediction Agent, Sustainability Coach\n\n"
                f"**Strategic Assessment:**\n"
                f"Your sustainability profile is active with level **{level}**. Current consumption habits are stable, but optimization of food and energy categories will lock in long-term carbon neutrality.\n\n"
                f"**Action Plan:**\n"
                f"1. **Diet Transition**: Switch 2 meat-based meals per week to vegan or vegetarian options.\n"
                f"2. **Waste Diversion**: Separate compostables to prevent landfill gas production.\n"
                f"3. **Offsets**: Participate in the local reforestation or ocean plastic offset marketplace projects."
            )
            
        return {
            "status": "completed",
            "agent_outputs": agent_outputs,
            "final_recommendation": final_rec
        }
        
    def generate_coach_response(self, user_prompt: str, user_context: Dict[str, Any], chat_history: List[Dict[str, str]]) -> str:
        """
        AI Sustainability Coach chatbot responder.
        Constructs context-aware prompt templates.
        """
        total_co2 = user_context.get("total_co2", 0.35)
        score = user_context.get("sustainability_score", 65.0)
        level = user_context.get("current_level", "Eco Explorer")
        
        if self.api_key:
            try:
                # Prepare history block
                history_str = ""
                for msg in chat_history[-6:]:
                    history_str += f"{msg['sender'].capitalize()}: {msg['message']}\n"
                    
                system_prompt = (
                    f"You are the TerraMind AI AI Sustainability Coach, a helpful, encouraging, and scientifically accurate assistant.\n"
                    f"User Profile Stats:\n"
                    f"- Monthly Footprint: {total_co2} tons CO2e\n"
                    f"- Sustainability Score: {score}%\n"
                    f"- Level: {level}\n\n"
                    f"Recent Chat History:\n{history_str}\n"
                    f"Respond to the user's latest query with actionable, personalized advice."
                )
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7
                }
                
                response = requests.post("https://api.openai.com/v1/chat/completions", headers=self.headers, json=payload, timeout=12)
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[COACH ERROR] OpenAI API fail: {e}")
                
        # --- Fallback Local Coach Dialogue Engine ---
        prompt_lower = user_prompt.lower()
        
        if "reduce" in prompt_lower or "emission" in prompt_lower or "footprint" in prompt_lower:
            return (
                f"Hello! As your AI Sustainability Coach, I've analyzed your profile ({total_co2} tons CO2e footprint, {score}% score).\n\n"
                f"To reduce your emissions effectively, I suggest focusing on these top three areas:\n"
                f"1. **Transition your commute**: If you drive a gasoline vehicle, replacing 50km of driving per week with cycling or public transit cuts emissions by about **36kg CO2 per month**.\n"
                f"2. **Optimize home climate**: Shifting your thermostat temperature settings up by 1°C in summer or down by 1°C in winter saves around **5% of your total electricity consumption**.\n"
                f"3. **Incorporate plant-based days**: Adopting a vegan diet just 2 days a week avoids up to **15kg CO2 monthly**.\n\n"
                f"Would you like to set a reduction goal for any of these categories? I can track it on your dashboard!"
            )
        elif "electricity" in prompt_lower or "energy" in prompt_lower or "save" in prompt_lower or "power" in prompt_lower:
            return (
                f"Great question! Saving electricity not only drops your utility bills but also directly offsets grid load.\n\n"
                f"Here are immediate energy-saving measures based on your profile:\n"
                f"- **Eliminate vampire power**: Electronic entertainment consoles and work desks draw standby electricity. Unplugging them or using smart strips saves about **10-15 kWh monthly**.\n"
                f"- **Upgrade lighting**: Swapping remaining incandescent bulbs for LED bulbs reduces energy consumption by **75%**.\n"
                f"- **Cold wash laundry**: Running washing machines on cold cycles rather than hot water cycles saves up to **90% of the machine's operational electricity**.\n\n"
                f"I can deploy the Energy Optimization Agent to run a full telemetry analysis on your hourly load. Let me know if you want to proceed!"
            )
        elif "plan" in prompt_lower or "sustainability plan" in prompt_lower:
            return (
                f"### Personal Sustainability Action Plan\n"
                f"Prepared by the AI Sustainability Coach for **{level}** profile.\n\n"
                f"**Phase 1: Zero-Cost Habits (Days 1-7)**\n"
                f"- Separate kitchen compostables to cut landfill methane emissions.\n"
                f"- Limit shower times to 5 minutes to conserve hot water heating energy.\n\n"
                f"**Phase 2: Consumer Shifts (Days 8-30)**\n"
                f"- Buy household items from circular-certified vendors (Green Shopping Agent can source these!).\n"
                f"- Commit to 3 vegan/vegetarian days per week.\n\n"
                f"**Phase 3: Structural Efficiency (Months 2-6)**\n"
                f"- Arrange a residential smart-thermostat install.\n"
                f"- Review green-energy grid supply tariff rates.\n\n"
                f"Let's check back in weekly! You will earn **+100 XP** and lock in your daily streak by reporting milestones."
            )
        else:
            return (
                f"Hello! I am your TerraMind AI AI Sustainability Coach. I help you track carbon footprints, "
                f"optimize utility usage, and unlock eco-badges. Currently, your carbon footprint is **{total_co2} tons CO2e**, "
                f"which puts you in the **{level}** tier.\n\n"
                f"You can ask me questions like:\n"
                f"- *'How can I reduce my emissions?'*\n"
                f"- *'What are the best ways to save electricity?'*\n"
                f"- *'Generate a personal sustainability plan.'*\n\n"
                f"What aspect of sustainability are we focusing on today?"
            )
