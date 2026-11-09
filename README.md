# AI 逆轉法庭：證詞的破綻

一款以生成式 AI 角色對話結合法庭推理的瀏覽器文字遊戲。玩家扮演辯護律師，透過詢問證人、檢視證物與指出矛盾，還原案件真相。

## 目標

完成一個可免費公開部署的 MVP，讓同學透過分享網址，在手機或電腦瀏覽器直接遊玩。

## MVP 範圍

- 一個固定案件：美術館名畫失竊案「消失的名畫」
- 三位證人、五項證據
- 玩家可以自由提問並與 AI 扮演的角色對話
- 玩家選擇證詞並出示證據；Python 驗證是否構成矛盾
- 遊戲狀態按玩家工作階段分開保存
- 至少包含成功與未能證明的結局

## 預定技術

- Python 與 Streamlit：遊戲介面、固定案件規則、進度管理
- Gemini API：生成證人、檢察官等角色的對話
- GitHub：程式碼與企劃文件
- Streamlit Community Cloud：免費公開部署

## 開發原則

- 案件真相、證詞、證據和正確解答由程式固定；AI 只負責角色表達，不可更改真相或新增有效證據。
- API Key 只放在部署平台的 Secrets，不寫入程式碼、文件或 Git 歷史。
- 限制玩家輸入與 AI 呼叫次數，並準備不依賴 API 的備援對話。
- 只使用虛構案件與角色資料。

## 本機啟動

需要 Python 3.10 以上版本。於專案資料夾執行：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

不設定 API Key 也能遊玩，證人會使用固定備援台詞。若要啟用 Gemini，將 `.streamlit/secrets.toml.example` 複製成 `.streamlit/secrets.toml`，再填入自己的 Key；這個檔案已加入 `.gitignore`，不可提交到 GitHub。部署到 Streamlit Community Cloud 時，請在 App 的 Secrets 設定相同的 `GEMINI_API_KEY`。

目前預設使用 `gemini-3.5-flash`。免費額度、可用模型與速率限制可能調整，請以 [Gemini API 官方定價頁](https://ai.google.dev/gemini-api/docs/pricing) 和 [模型清單](https://ai.google.dev/gemini-api/docs/models) 為準。啟用 Gemini 時，遊戲會傳送玩家問題、目前證人的公開設定和近期對話紀錄；不會傳送完整案件解答或其他玩家資料。免費層的資料處理方式可能與付費層不同，請勿輸入個人資料。

## 專案狀態

第一版 MVP 已開始實作：包含單一案件、三位證人、五項證物、固定矛盾判定、每個瀏覽器工作階段獨立進度、成功與失敗結局，以及可選的 Gemini 對話。案件設定見 [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)，AI 程式助理規則見 [`AGENTS.md`](AGENTS.md)。
