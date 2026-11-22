# AI 逆轉法庭：證詞的破綻

一款以生成式 AI 角色對話結合法庭推理的視覺化瀏覽器推理遊戲。玩家扮演辯護律師，透過檢視現場與證物插圖、詢問證人、比對時間軸與指出矛盾，還原案件真相。

## 🎮 立即遊玩

**遊戲網址：** https://final-project-9tuuvk4omzuh8atrjnfxfs.streamlit.app/

手機或電腦瀏覽器直接打開即可遊玩，不需登入。

## 目標

完成一個可免費公開部署的視覺化互動 MVP，讓同學透過分享網址，在手機或電腦瀏覽器直覺遊玩。

## MVP 範圍與視覺化設計

- **一個固定案件**：「霧港館的第六個人」——美術館怪談、被抹去的畫家署名，以及拍賣前失蹤的原畫
- **10 張專屬遊戲插圖（`assets/`）**：
  - 2 張場景插圖：市立霧港美術館 2F B 展廳案發現場（`scene_museum.jpg`）、地方法院法庭現場（`scene_courtroom.jpg`）
  - 3 張證人立繪頭像：策展人林書妍（`witness_curator.jpg`）、夜班保全陳建中（`witness_guard.jpg`）、被告清潔員王冠宇（`witness_cleaner.jpg`）
  - 5 張證物特寫圖：門禁與入口影像紀錄（`evidence_e1.jpg`）、警報控制台紀錄（`evidence_e2.jpg`）、勤務簿與人影速寫（`evidence_e3.jpg`）、恆溫箱出庫單（`evidence_e4.jpg`）、紫外線鑑定與署名比對（`evidence_e5.jpg`）
- **五階段流程導覽與視覺化介面**：
  - **開始前漫畫序章**：以四格可翻閱、可跳過的開場交代閉館怪談、原畫遭調包、清潔員被指控，以及畫作署名疑點；不提前公布犯人與結局。
  1. **現場探索與案件卷宗**：大型全畫面 2D 美術館調查空間（`scene_museum.jpg`，支援「⛶ 全螢幕沉浸模式」與手電筒微光探索）。玩家先遇到閉館後玻璃裡多出一個人影的怪談，再點擊現場物件進入**第一人稱近距離檢視看板／拿起報告畫面**，逐步發現原作、仿作與拍賣出庫紀錄的疑點。
  2. **詢問證人**：角色立繪詢問室、一鍵「快捷追問按鈕」（調查相關證物後解鎖）與自由提問輸入框，搭配角色頭像對話紀錄；問到與本案無關的事，證人會表示無關並把話題拉回案情
  3. **時間線推理**：把警報旁路、策展人進入展廳、警報恢復與運輸箱出館放回正確時間；再判斷勤務簿和出庫單能直接證明的範圍，答錯可逐步取得提示
  4. **證據攻防**：左右並排「證人證詞 ⚡ VS ⚡ 矛盾證物」視覺化對決介面，即時顯示兩項關鍵矛盾的解鎖狀態；答錯會逐步給提示，最高等級會揭示正確配對
  5. **最後推理**：結案條件檢查表與嫌疑人立繪指認介面
- **Python 規則驗證**：Python 驗證時間線答案、證據範圍、證詞矛盾與結局；遊戲狀態按玩家工作階段分開保存

## 預定技術

- Python 與 Streamlit：遊戲介面、2D 互動探索場景、視覺化卡片佈局、固定案件規則、進度管理
- Gemini API：只處理玩家自由輸入的證人問題
- GitHub：程式碼、遊戲美術素材（`assets/`）與企劃文件
- Streamlit Community Cloud：免費公開部署

## 開發原則

- 案件真相、證詞、證據和正確解答由程式固定；AI 只負責角色表達，不可更改真相或新增有效證據。
- API Key 只放在部署平台的 Secrets，不寫入程式碼、文件或 Git 歷史。
- 現場點擊物件、閱讀證物、快捷追問和庭上反應均不呼叫 API；限制自由輸入的 AI 呼叫次數，並準備不依賴 API 的備援對話。
- 只使用虛構案件與角色資料。

## 本機啟動

需要 Python 3.10 以上版本。於專案資料夾執行：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

不設定 API Key 也能遊玩，快捷追問與庭上反應會使用固定台詞。若要啟用 Gemini，將 `.streamlit/secrets.toml.example` 複製成 `.streamlit/secrets.toml`，再填入自己的 Key；這個檔案已加入 `.gitignore`，不可提交到 GitHub。部署到 Streamlit Community Cloud 時，請在 App 的 Secrets 設定相同的 `GEMINI_API_KEY`。只有自由輸入的問題會呼叫 Gemini。

目前預設使用 `gemini-3.5-flash-lite`，每個玩家工作階段最多 8 次自由提問 AI 呼叫；同一個 Streamlit 程序每天最多 100 次。免費額度、可用模型與速率限制可能調整，請以 [Gemini API 官方定價頁](https://ai.google.dev/gemini-api/docs/pricing) 和 [模型清單](https://ai.google.dev/gemini-api/docs/models) 為準。啟用 Gemini 時，只會傳送自由輸入的問題、目前證人的公開設定和近期對話紀錄；不會傳送完整案件解答或其他玩家資料。免費層的資料處理方式可能與付費層不同，請勿輸入個人資料。

## 專案狀態

已完成視覺化互動版 MVP：包含「霧港館的第六個人」懸疑案件、四格漫畫序章、10 張專屬場景／立繪／證物插圖、2D 點擊現場探索空間、五階段引導列、時間線配對與證據範圍推理、逐步提示、證人秘密與怪談反轉、快捷追問、固定規則的法庭攻防，以及可選的 Gemini 對話。案件設定見 [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)，AI 程式助理規則見 [`AGENTS.md`](AGENTS.md)。

