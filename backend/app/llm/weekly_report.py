import os
from langchain_openai import ChatOpenAI
# from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv

load_dotenv()

out=StrOutputParser()
HF_TOKEN=os.getenv("HF_TOKEN")

llm=ChatOpenAI(
    model="meta-llama/Llama-3.1-8B-Instruct:novita",
    api_key=HF_TOKEN,
    base_url="https://router.huggingface.co/v1",
    temperature=0
)


def generate_weekly_report(data):
    prompt = f"""
You are a professional e-commerce business analyst.

Analyze the following weekly business data:

{data}

Generate a concise weekly business report with these sections:

1. Overall Performance
2. Top-Performing Products
3. Category Performance
4. Important Observations
5. Actionable Recommendations

STRICT RULES:

- Use ONLY the information provided in the data.
- Do NOT invent numbers, trends, causes, or explanations.
- Do NOT claim that something is "high", "low", "good", or "bad"
  unless the data provides a comparison or benchmark.
- Do NOT infer the cause of returns, cancellations, revenue changes,
  or profit changes.
- Do NOT make claims about product quality, packaging, inventory,
  customer behavior, or pricing unless the data directly supports them.
- Clearly distinguish between observations and recommendations.
- Recommendations must be directly related to the provided metrics.
- If the available data is insufficient to determine something,
  explicitly say that it cannot be determined from the available data.
- Do not repeat the same information unnecessarily.
- Keep the report concise and useful for a merchant.

For example:

GOOD:
"The Suits & Sport Coats category had the highest return rate
among the provided categories at 12.50%."

BAD:
"The high return rate indicates that the category has poor
product quality."

GOOD:
"The report does not contain enough information to determine
the reason for the high return rate."

BAD:
"The high return rate is probably caused by poor sizing."

Return only the report.
"""
    messages = [
        {
            "role": "system",
            "content": "You are a professional e-commerce business analyst."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    response=llm.invoke(messages)
    print(response.content)
    return response.content

def generate_weekly_comparision(current_week,previous_week):
    prompt = f"""
    You are a professional e-commerce business analyst.

    Current Week:
    {current_week}

    Previous Week:
    {previous_week}

    Compare the two weeks and generate a concise business report.

    Include:
    1. Overall Performance Changes
    2. Product Performance Changes
    3. Category Performance Changes
    4. Important Observations
    5. Actionable Recommendations

    Use ONLY the provided data.
    Do not invent numbers or causes.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a professional e-commerce business analyst."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    response = llm.invoke(messages)

    return response.content

