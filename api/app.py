from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mysql.connector

app = FastAPI()

# 允许前端跨域访问（先简单全放开，后面你可以改成 GitHub Pages 的域名）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 比如可以改成 ["https://qigelunbiya.github.io"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== MySQL 连接配置 =====
db_config = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "database": "love",
    "charset": "utf8mb4",
}


def get_conn():
    return mysql.connector.connect(**db_config)


class DateInfo(BaseModel):
    name: Optional[str] = None  # 对方名字，可选
    day: str                    # 例如 "这个周六"
    start_time: str             # "HH:MM"
    end_time: str               # "HH:MM"


@app.post("/api/save-date")
def save_date(info: DateInfo):
    """
    保存约会时间到 MySQL 的 date_plan 表
    假设表结构至少有: name, day, start_time, end_time, created_at(可有默认值)
    """
    conn = get_conn()
    cursor = conn.cursor()

    sql = """
        INSERT INTO date_plan (name, day, start_time, end_time)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(sql, (info.name, info.day, info.start_time, info.end_time))
    conn.commit()

    cursor.close()
    conn.close()

    return {"ok": True}


@app.get("/")
def hello():
    return {"msg": "love server is running 💕"}



