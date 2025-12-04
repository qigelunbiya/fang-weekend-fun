# first_meet · 小朋友卡邀请页

一个用来约第一次见面的小网页：

- 前端：静态页面（GitHub Pages / OSS 均可），用原生 JS + CSS。
- 后端：FastAPI + MySQL，用来记录对方的姓名、问卷答案、选择的时间等。
- 暴露到公网：使用 **ngrok** 把本地 `http://localhost:8000` 变成一个 HTTPS 地址，前端直接调用。

线上访问地址示例：

> https://qigelunbiya.github.io/first_meet/

---

## 目录结构（示例）

```text
project-root/
├─ app.py           # FastAPI 后端
├─ requirements.txt # Python 依赖
├─ index.html       # 前端首页（交朋友页面）
├─ script.js        # 前端逻辑（多阶段流程 + 调后端 API）
├─ style.css        # 前端样式
└─ images/          # 用到的图片和视频
```

> 如果你的文件名/结构略有不同，记得对应地改 README 里的命令即可。

---

## 1. 环境准备

- Python 版本：**3.9+**
- MySQL：**5.7 或 8.x** 均可
- ngrok：用于把本地接口映射到公网
- 一个能访问网页的浏览器 &（可选）GitHub Pages / OSS 用来放前端静态资源

---

## 2. 安装 Python 依赖

### 2.1 建议创建虚拟环境

在项目根目录执行：

```bash
# Windows (PowerShell)
python -m venv venv
.
env\Scripts ctivate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2.2 一键安装依赖

确保当前目录下有 `requirements.txt`（内容见文末），然后执行：

```bash
pip install -r requirements.txt
```

---

## 3. MySQL 数据库配置

### 3.1 创建数据库

登录 MySQL：

```bash
# 示例命令，根据自己安装方式调整
mysql -u root -p
```

在 MySQL 控制台里执行：

```sql
-- 创建数据库
CREATE DATABASE love
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE love;
```

### 3.2 创建 `love` 表

在 `love` 数据库中执行：

```sql
CREATE TABLE love (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
  name VARCHAR(64) DEFAULT NULL COMMENT '对方名字（页面 url 里传的 name）',
  day VARCHAR(32) DEFAULT NULL COMMENT '约会日描述，比如“这个周六”',

  vibe VARCHAR(255) DEFAULT NULL COMMENT '问卷：氛围',
  activity VARCHAR(255) DEFAULT NULL COMMENT '问卷：相处节奏',
  role VARCHAR(255) DEFAULT NULL COMMENT '问卷：聊天方式',

  mood_level TINYINT DEFAULT NULL COMMENT '心情等级 1~5',
  mood_note TEXT COMMENT '心情说明文案',

  intro_text TEXT COMMENT '自我介绍内容（预留）',

  start_time CHAR(5) DEFAULT NULL COMMENT '开始时间 HH:MM',
  end_time   CHAR(5) DEFAULT NULL COMMENT '结束时间 HH:MM',

  card_result TEXT COMMENT '最终卡片内容（目前暂时未用）',

  stage VARCHAR(32) DEFAULT NULL COMMENT '当前阶段标记，如 first/popup/quiz/...',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

### 3.3 配置连接信息

后端连接配置在 `app.py` 里：

```python
db_config = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "database": "love",   # 上面创建的库名
    "charset": "utf8mb4",
}
```

根据你的实际 MySQL 账号/密码进行修改，例如：

```python
"user": "your_user",
"password": "your_password",
```

> MySQL 要处于“运行中”状态，否则 FastAPI 在访问数据库时会报错。

---

## 4. 启动 FastAPI 后端

确保虚拟环境已激活，并且已经在项目根目录：

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

- `app:app` 的意思是：`app.py` 文件里的 `app = FastAPI()` 这个实例。
- `--port 8000`：监听 8000 端口，后面 ngrok 也会映射这个端口。

启动之后，打开浏览器访问：

```text
http://127.0.0.1:8000/
```

如果看到：

```json
{"msg":"love server is running 💕"}
```

说明后端已经 OK 了。

---

## 5. 配置 & 启动 ngrok

### 5.1 安装 ngrok

到官网 https://ngrok.com 下载对应平台的可执行文件，或者用包管理器安装。  
然后在命令行里配置你的 auth token（在官网 Dashboard 里能找到）：

```bash
ngrok config add-authtoken <你的_token>
```

只要配置一次即可。

### 5.2 启动 http 隧道

在任意终端里（保证 FastAPI 已经在 `8000` 端口跑着）执行：

```bash
ngrok http 8000
```

启动成功后，会看到类似输出：

```text
Forwarding  https://supervoluminously-penicillate-malia.ngrok-free.dev -> http://localhost:8000
```

把这一串 HTTPS 地址记下来，比如：

```text
https://supervoluminously-penicillate-malia.ngrok-free.dev
```

### 5.3 修改前端 `API_BASE`

在 `script.js` 顶部有一行：

```js
const API_BASE = "https://supervoluminously-penicillate-malia.ngrok-free.dev";
```

把它改成 **你当前 ngrok 给你的那条地址**，然后重新发布前端即可。

> ngrok 免费版域名每次重启可能会变，变了就要重新改这里。

---

## 6. 启动 / 部署前端

本项目前端是纯静态文件，只要能通过 HTTP/HTTPS 访问 `index.html` 即可：

### 6.1 本地直接打开

开发调试时，可以直接在浏览器中打开 `index.html` 文件，或者起一个本地静态服务器，例如：

```bash
# Python3 自带的简单静态服务器（在有 index.html 的目录执行）
python -m http.server 8080
```

然后访问：

```text
http://127.0.0.1:8080/
```

### 6.2 GitHub Pages 示例

1. 把 `index.html`、`script.js`、`style.css` 和 `images/` 都推到 GitHub 仓库。
2. 在仓库设置里打开 GitHub Pages，选择 `main` 分支（或 `docs` 目录）。
3. Pages 生效后，你会得到一个地址，比如：

   ```text
   https://qigelunbiya.github.io/first_meet/
   ```

4. 确保 `script.js` 里的 `API_BASE` 指向你当前的 ngrok HTTPS 地址。

---

## 7. CORS 配置说明

`app.py` 中已经加了最宽松的 CORS 设置：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以改成 ["https://qigelunbiya.github.io"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

如果你只打算从 GitHub Pages 调用，可以改成：

```python
allow_origins=["https://qigelunbiya.github.io"]
```

安全一些。

---

## 8. 常见问题排查

### 8.1 前端点击 “我同意” 之后没反应 / 控制台显示 502

1. 后端没跑：先确认 `uvicorn app:app --port 8000` 正在运行。
2. ngrok 没连上：确认 `ngrok http 8000` 运行中，日志中没有报错。
3. `API_BASE` 写错：检查 `script.js` 里的 `const API_BASE = '...'` 是否和 ngrok 提供的一致。
4. MySQL 连接失败：`app.py` 中的 `db_config` 用户名/密码/数据库名称是否正确；MySQL 服务是否开启。

### 8.2 `/api/love/start` 报 502 Bad Gateway

- 先直接访问：`http://127.0.0.1:8000/api/love/start`（用 Postman 或 curl，POST JSON）  
  如果本地就 500 / 连接失败，说明 FastAPI 或 MySQL 配错了。
- 如果本地 OK，但通过 `https://xxxx.ngrok-free.dev/api/love/start` 报 502，  
  多半是 **ngrok 映射的本地端口和你运行 uvicorn 的端口不一致**，或者 uvicorn 已退出。

---

## 9. requirements.txt 示例

项目后端只用到了极少量依赖，`requirements.txt` 内容可以是：

```text
fastapi
uvicorn[standard]
mysql-connector-python
```

安装命令：

```bash
pip install -r requirements.txt
```

> 如果后续你引入了 `.env`、日志库等，可以在这个文件里继续追加。
