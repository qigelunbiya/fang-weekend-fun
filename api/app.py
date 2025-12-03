from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import mysql.connector

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以改成 ["https://qigelunbiya.github.io"]
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
    "database": "love",   # 这里假设库名就是 love
    "charset": "utf8mb4",
}

def get_conn():
    return mysql.connector.connect(**db_config)

# ========== Pydantic 模型 ==========

class LoveStart(BaseModel):
    name: Optional[str] = None
    day: Optional[str] = None
    stage: str

class LoveUpdate(BaseModel):
    id: int
    name: Optional[str] = None
    day: Optional[str] = None
    vibe: Optional[str] = None
    activity: Optional[str] = None
    role: Optional[str] = None
    mood_level: Optional[int] = None
    mood_note: Optional[str] = None
    intro_text: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    card_result: Optional[str] = None
    stage: Optional[str] = None

# ========== API ==========

@app.post("/api/love/start")
def love_start(info: LoveStart):
    """
    新建一条 love 记录，只在前端刚点击 YES 的时候调用一次。
    """
    conn = get_conn()
    cursor = conn.cursor()

    sql = """
        INSERT INTO love (name, day, stage)
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (info.name, info.day, info.stage))
    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return {"ok": True, "id": new_id}

@app.post("/api/love/update")
def love_update(info: LoveUpdate):
    """
    局部更新 love 记录。前端每进入/离开一个阶段，
    或者填完一些关键字段时，会调这个接口。
    """
    conn = get_conn()
    cursor = conn.cursor()

    fields = []
    values = []

    def add_field(col_name: str, value):
        if value is not None:
            fields.append(f"{col_name} = %s")
            values.append(value)

    add_field("name", info.name)
    add_field("day", info.day)
    add_field("vibe", info.vibe)
    add_field("activity", info.activity)
    add_field("role", info.role)
    add_field("mood_level", info.mood_level)
    add_field("mood_note", info.mood_note)
    add_field("intro_text", info.intro_text)
    add_field("start_time", info.start_time)
    add_field("end_time", info.end_time)
    add_field("card_result", info.card_result)
    add_field("stage", info.stage)

    if not fields:
        # 什么都不更新就直接返回 ok
        cursor.close()
        conn.close()
        return {"ok": True, "updated": 0}

    sql = f"UPDATE love SET {', '.join(fields)} WHERE id = %s"
    values.append(info.id)

    cursor.execute(sql, values)
    conn.commit()
    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if updated == 0:
        raise HTTPException(status_code=404, detail="love record not found")

    return {"ok": True, "updated": updated}

@app.get("/")
def hello():
    return {"msg": "love server is running 💕"}
