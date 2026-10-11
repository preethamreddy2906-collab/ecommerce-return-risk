from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

from sqlalchemy import text
from sqlalchemy.orm import Session

import os
import re
import json

from .prompts import SQL_PROMPT,CORRECTION_PROMPT,VALIDATION_PROMPT

load_dotenv()

HF_TOKEN=os.getenv("HF_TOKEN")

llm=ChatOpenAI(
    model="meta-llama/Llama-3.1-8B-Instruct:novita",
    api_key=HF_TOKEN,
    base_url="https://router.huggingface.co/v1",
    temperature=0
)

prompt=ChatPromptTemplate.from_template(SQL_PROMPT)

chain=prompt|llm

correction_prompt=ChatPromptTemplate.from_template(CORRECTION_PROMPT)
correction_chain=correction_prompt|llm

validation_prompt=ChatPromptTemplate.from_template(VALIDATION_PROMPT)
validation_chain=validation_prompt|llm

def clean_sql(sql:str)->str:
    if hasattr(sql, "content"):
        sql = sql.content
    else:
        sql = sql
    sql=sql.strip()
    sql=re.sub(r"```sql","",sql,flags=re.IGNORECASE)
    sql=re.sub(r"```","",sql)
    sql=sql.strip()
    return sql

def validate_sql(sql:str):
    normalized=sql.strip().lower()
    if not(
        normalized.startswith("select") or normalized.startswith("with")
    ):
       return False
    dangerous_keywords=["insert","update","delete","drop","alter","truncate","create","grant","revoke"]
    for keyword in dangerous_keywords:
        if re.search(rf"\b{keyword}\b",normalized):
            return False
    return True


def validate_sql_semantics(question:str,sql:str):
    response=validation_chain.invoke({
        "question":question,
        "sql":sql
    })
    content=response.content.strip()
    try:
        result=json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("SQL validator returned invalid JSON")
    return result

    
def generate_sql(question:str)->str:
    for attempt in range(3):
        response=chain.invoke({
            "question":question
        })
        sql=clean_sql(response.content)
        if validate_sql(sql):
            return sql
    raise ValueError("Could not generate valid SQL after 3 attempts")


def execute_sql(question:str,db:Session):
    sql=generate_sql(question)
    max_attempts=3
    for attempt in range(max_attempts):
        report=validate_sql_semantics(question,sql)
        if not report["valid"]:
            print("Semantic validation failed")
            print(report["reason"])

            if attempt == max_attempts - 1:
                raise ValueError(
                    "SQL agent failed semantic validation "
                    f"after {max_attempts} attempts.\n"
                    f"Reason: {report['reason']}"
                )
            response=correction_chain.invoke({
                "question":question,
                "sql":sql,
                "error":report["reason"]
            })

            sql=clean_sql(response)
            continue

        try:
            result=db.execute(text(sql))
            rows = result.mappings().all()

            return {
                "question": question,
                "sql": sql,
                "result": [dict(row) for row in rows],
                "attempts": attempt + 1
            }
        except Exception as e:
            db.rollback()
            error=str(e)
            print(
                f"SQL execution failed "
                f"(attempt {attempt + 1}):"
            )
            print(error)

            # No attempts left
            if attempt == max_attempts - 1:
                raise ValueError(
                    "SQL agent failed after "
                    f"{max_attempts} attempts.\n"
                    f"Last error: {error}"
                )
            response = correction_chain.invoke({
                "question": question,
                "sql": sql,
                "error": error
            })

            sql = clean_sql(response)
            if not validate_sql(sql):
                raise ValueError(
                    "LLM generated unsafe SQL "
                    "during execution correction."
                )
    raise ValueError("SQL agent failed")
    


            


