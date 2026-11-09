# AI 逆轉法庭：證詞的破綻

一款以生成式 AI 角色對話結合法庭推理的視覺化瀏覽器推理遊戲。玩家扮演辯護律師，透過檢視現場與證物插圖、詢問證人、比對時間軸與指出矛盾，還原案件真相。

## 目標

完成一個可免費公開部署的視覺化互動 MVP，讓同學透過分享網址，在手機或電腦瀏覽器直覺遊玩。

## MVP 範圍與視覺化設計

- **一個固定案件**：美術館名畫失竊案「消失的名畫」
- **10 張專屬遊戲插圖（`assets/`）**：
  - 2 張場景插圖：市立霧港美術館 2F B 展廳案發現場（`scene_museum.jpg`）、地方法院法庭現場（`scene_courtroom.jpg`）
  - 3 張證人立繪頭像：策展人林書妍（`witness_curator.jpg`）、夜班保全陳建中（`witness_guard.jpg`）、被告清潔員王冠宇（`witness_cleaner.jpg`）
  - 5 張證物特寫圖：門禁與入口影像紀錄（`evidence_e1.jpg`）、警報控制台紀錄（`evidence_e2.jpg`）、清潔勤務簽到單（`evidence_e3.jpg`）、西側裝卸區出庫單（`evidence_e4.jpg`）、畫作鑑定報告（`evidence_e5.jpg`）
- **四步驟流程導覽與視覺化介面**：
  1. **案件卷宗**：案發現場圖、關鍵時間軸、館內樓層配置、證人卡片與圖文證物櫃（支援單項或一鍵加入證物筆記）
  2. **詢問證人**：角色立繪詢問室、一鍵「快捷追問按鈕」與自由提問輸入框，搭配角色頭像對話紀錄
  3. **證據攻防**：左右並排「證人證詞 ⚡ VS ⚡ 矛盾證物」視覺化對決介面，即時顯示兩項關鍵矛盾的解鎖狀態
  4. **最後推理**：結案條件檢查表與嫌疑人立繪指認介面
- **Python 規則驗證**：玩家選擇證詞並出示證據；Python 驗證是否構成矛盾，遊戲狀態按玩家工作階段分開保存

## 預定技術

- Python 與 Streamlit：遊戲介面、視覺化卡片佈局、固定案件規則、進度管理
- Gemini API：生成證人、檢察官等角色的對話
- GitHub：程式碼、遊戲美術素材（`assets/`）與企劃文件
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

已完成視覺化互動版 MVP：包含 10 張專屬場景／立繪／證物插圖、四步驟引導列、案發時間軸、快捷追問按鈕、左右對決式證據攻防、固定矛盾判定、每個瀏覽器工作階段獨立進度、成功與失敗結局，以及可選的 Gemini 對話。案件設定見 [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)，AI 程式助理規則見 [`AGENTS.md`](AGENTS.md)。
