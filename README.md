# 🌿 Lianhua ERP Frontend

蓮華素食 ERP 管理系統前端專案  
基於 **React + Vite + React-Admin + Material UI** 所構建，  
用於管理供應商、採購、銷售、費用、報表等模組，並對接 Spring Boot 後端 API。

---

## 🧭 專案技術棧

| 類別 | 技術 |
|------|------|
| 前端框架 | [React 18](https://react.dev/) |
| 管理框架 | [React-Admin 5](https://marmelab.com/react-admin/) |
| UI 組件 | [Material UI v5](https://mui.com/) |
| Chart | [Nivo](https://nivo.rocks/)（可選） |
| 打包工具 | [Vite 6](https://vitejs.dev/) |
| 程式語言 | TypeScript |
| API 通訊 | RESTful via `ra-data-simple-rest` |
| 後端 | Spring Boot (Java 21) |
| 部署 | Nginx + Docker（未來階段） |

---

## 📂 專案結構

```
lianhua-erp-frontend/
├── public/                     # 靜態資源
├── src/
│   ├── providers/              # dataProvider / authProvider
│   │   ├── dataProvider.ts
│   │   └── authProvider.ts
│   ├── pages/                  # 各模組頁面
│   │   ├── dashboard.tsx
│   │   ├── suppliers.tsx
│   │   └── ...
│   ├── App.tsx                 # React-Admin 主設定
│   └── main.tsx                # Vite 進入點
├── .env                        # 環境變數設定
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ 開發環境安裝

### 🔧 需求
- Node.js 18 以上  
- npm 10+ 或 yarn 1.22+  
- Git 2.40+

---

### 🪟 Windows 環境設定
```bash
cd C:\Users\<你的名稱>\Desktop\lianhua-erp-frontend
npm install
npm run dev
```

---

### 🍎 macOS 環境設定
```bash
cd ~/Projects
git clone https://github.com/<你的帳號>/lianhua-erp-frontend.git
cd lianhua-erp-frontend
npm install
npm run dev
```

開啟瀏覽器：  
👉 http://localhost:5173  

---

## 🌐 API 連線設定

建立 `.env` 檔於專案根目錄：

```bash
VITE_API_URL=http://localhost:8080/api
```

確保 Spring Boot 後端正在執行（預設埠 8080），  
並且已設定允許跨域（CORS）。

---

## 🧱 Git 開發流程

```bash
git pull origin main
git checkout -b feature/<模組名稱>
git add .
git commit -m "feat: 新增 Supplier 管理頁面"
git push origin feature/<模組名稱>
```

合併分支：
```bash
git checkout main
git pull
git merge feature/<模組名稱>
git push origin main
```

---

## 📦 常用指令

| 動作 | 指令 |
|------|------|
| 啟動開發伺服器 | `npm run dev` |
| 建立正式版 | `npm run build` |
| 預覽打包結果 | `npm run preview` |
| 安裝套件 | `npm install <package>` |
| 更新所有依賴 | `npm update` |

---

## 🚀 部署（未來階段）

```bash
npm run build
```
生成 `dist/` 後可部署至 Nginx、Netlify 或 Vercel 等靜態伺服器。

---

## 🧩 後端對接注意事項

| 條件 | 說明 |
|------|------|
| API 回傳格式 | React-Admin 預期為 `{ data: [...] }` 或直接陣列 |
| CORS | 需允許 `http://localhost:5173` |
| HTTP 方法 | 支援 `GET`, `POST`, `PUT`, `DELETE` |
| 驗證 | JWT Token （未來階段） |

---

## 👥 多人協作建議

| 開發者 | 角色 |
|---------|-------|
| Jacob | PM / Backend (Spring Boot) |
| 開發者 B | Frontend (React-Admin) |
| 開發者 C | UI / UX Design |

---

## 📘 授權與版本

- License: MIT  
- Version: 1.0.0  
- Maintainer: Jacob Huang
