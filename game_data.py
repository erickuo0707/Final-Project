"""固定案件、證詞與法庭判定資料。"""

CASE_TITLE = "霧港館的第六個人"
ARTWORK_NAME = "海霧港灣"
CASE_BACKGROUND = (
    "拍賣預展開幕前一晚，市立霧港美術館的名畫《海霧港灣》被人調包：畫框裡留下修復室編號 R-07 的仿作，原作卻不知去向。"
    "館內流傳多年的怪談也在閉館後重現——展廳燈光一暗，玻璃裡便多出一個人影。清潔員王冠宇因當晚仍在館內而被控竊畫；"
    "策展人林書妍發誓自己沒有進過展廳，夜班保全陳建中則堅稱警報整晚正常。偏偏王冠宇的勤務簿早在三晚前就寫下："
    "『18:42，燈光轉暗，第六個人又出現了。』你是他的辯護律師。拍賣目錄明早就要公開，得在真相被定價之前，"
    "查清那個人影是誰、原畫去了哪裡，以及誰把罪名推給了清潔員。"
)

# 開始遊戲前逐格播放的漫畫式序章；保留調查與最後推理的答案。
PROLOGUE_PANELS = [
    {
        "chapter": "三晚前｜霧港美術館",
        "title": "玻璃裡，多了一個人",
        "text": "閉館後的 B 展廳總在 18:42 暗下來。玻璃裡會多出一道影子，像是有人站在畫中。清潔員王冠宇把它畫進勤務簿，旁邊只寫了一句話：",
        "caption": "「18:42，燈光轉暗，第六個人又出現了。」",
        "image": "assets/prologue_1.jpg",
        "alt": "閉館後 18:42 的霧港美術館展廳，玻璃上浮現神秘女子人影",
    },
    {
        "chapter": "拍賣預展前一夜｜19:05",
        "title": "畫框裡的，不是原畫",
        "text": "隔天就要公開拍賣目錄，夜班保全卻在巡場時發現《海霧港灣》遭到調包。畫框裡留下修復室編號 R-07 的仿作，原畫消失了。",
        "caption": "展廳沒有破壞痕跡，警報卻有一段被切成旁路，沒有人承認動過系統。",
        "image": "assets/prologue_2.jpg",
        "alt": "手電筒照亮畫框邊角露出的 R-07 仿作編號",
    },
    {
        "chapter": "嫌疑人｜王冠宇",
        "title": "最方便被懷疑的人",
        "text": "清潔員王冠宇當晚仍在館內，勤務簿也只有簽到、簽退兩個時間點。警方懷疑他趁巡場空檔偷走原畫；他則堅稱自己整晚都在地下器材室。",
        "caption": "「我沒有上樓，也沒有碰過那幅畫。」",
        "image": "assets/prologue_3.jpg",
        "alt": "地下器材室中被詢問的清潔員王冠宇與桌上人影速寫勤務簿",
    },
    {
        "chapter": "拍賣目錄｜明早公開",
        "title": "被刮掉的名字",
        "text": "館藏卡與拍賣目錄都把《海霧港灣》列在畫家沈景川名下。但一張舊鑑定底片的邊角，留下另一個被覆蓋的署名：林月琴。原畫為何偏偏在拍賣前消失？",
        "caption": "你受委託為王冠宇辯護。找出誰進過展廳、誰動了警報，以及那只恆溫箱載走了什麼。",
        "image": "assets/prologue_4.jpg",
        "alt": "拍賣預展目錄上的沈景川署名與紫外線底片中浮現的林月琴署名",
    },
]

SCENE_IMAGES = {
    "museum": "assets/scene_museum.jpg",
    "security": "assets/scene_security.jpg",
    "basement": "assets/scene_basement.jpg",
    "loading_dock": "assets/scene_loading_dock.jpg",
    "restoration": "assets/scene_restoration.jpg",
    "curator_office": "assets/scene_curator_office.jpg",
    "courtroom": "assets/scene_courtroom.jpg",
}

# 多場景 2D 點擊探索空間（2F / 1F / B1 共 6 大全插畫區域）：依線索與機關逐步解鎖
SCENES = [
    {
        "id": "gallery",
        "floor": "2F",
        "name": "2F B 展廳",
        "short_name": "2F B 展廳",
        "icon": "🏛️",
        "image": "assets/scene_museum.jpg",
        "initial_unlocked": True,
        "unlock_hint": "案發第一現場，開局即可自由調查。",
        "description": "《海霧港灣》原展出空間。調整夜間側光與紫外線燈可破解第六個人影之謎。",
    },
    {
        "id": "security",
        "floor": "1F",
        "name": "1F 保全中控區",
        "short_name": "保全中控區",
        "icon": "🛡️",
        "image": "assets/scene_security.jpg",
        "initial_unlocked": False,
        "unlock_hint": "🔒 尚未解鎖：請先在「2F B 展廳」調查中央畫框（E5）、門禁讀卡機或防盜感應器。",
        "description": "存放門禁密碼主機（E1）、警報分區控制台（E2）與全館夜班巡邏平面圖。",
    },
    {
        "id": "basement",
        "floor": "B1",
        "name": "B1 地下器材室",
        "short_name": "B1 器材室",
        "icon": "🧹",
        "image": "assets/scene_basement.jpg",
        "initial_unlocked": False,
        "unlock_hint": "🔒 尚未解鎖：請先在「2F B 展廳」完成中央畫框採證（E5），或在「保全中控區」查看巡邏白板。",
        "description": "清潔員王冠宇當班值勤處，工作桌勤務簿藏著三晚前「18:42」的人影速寫（E3）。",
    },
    {
        "id": "restoration",
        "floor": "B1",
        "name": "B1 修復室 R-07",
        "short_name": "修復室 R-07",
        "icon": "🎨",
        "image": "assets/scene_restoration.jpg",
        "initial_unlocked": False,
        "unlock_hint": "🔒 尚未解鎖：請先在「2F B 展廳」透過紫外線燈鑑定畫框，發現 R-07 仿作（E5）。",
        "description": "存放 R-07 仿作畫架、顏料清漆台與紫外線底片燈箱的隱藏修復空間。",
    },
    {
        "id": "loading_dock",
        "floor": "1F",
        "name": "1F 西側裝卸區",
        "short_name": "西側裝卸區",
        "icon": "📦",
        "image": "assets/scene_loading_dock.jpg",
        "initial_unlocked": False,
        "unlock_hint": "🔒 尚未解鎖：請先在「保全中控區」解鎖門禁主機（E1）或還原警報日誌（E2）。",
        "description": "18:56 恆溫運輸箱出館通道，作業台留有可掀開透視複寫聯的出庫單（E4）。",
    },
    {
        "id": "curator_office",
        "floor": "2F",
        "name": "2F 策展人辦公室",
        "short_name": "策展人辦公室",
        "icon": "🕯️",
        "image": "assets/scene_curator_office.jpg",
        "initial_unlocked": False,
        "unlock_hint": "🔒 尚未解鎖：請先在「B1 修復室 R-07」完成真偽比對，或在「1F 西側裝卸區」掀開複寫聯（E4）。",
        "description": "林書妍宣稱閉館後停留的私人辦公室，桌上放著拍賣清冊與上鎖的黃銅木匣。",
    },
]

# evidence 為 None 代表公開資訊；否則需先把該證物加入筆記才會在時間軸上解鎖
CASE_TIMELINE = [
    {"time": "18:30", "event": "美術館閉館", "detail": "觀眾離場，隔日拍賣預展的館藏開始封存", "evidence": None},
    {"time": "18:30–19:00", "event": "B1 清潔勤務", "detail": "王冠宇 18:30 於 B1 器材室簽到，19:00 由主管簽退", "evidence": "E3"},
    {"time": "18:41–18:54", "event": "B 展廳警報異動", "detail": "動作感應器遭管理帳號切換為「旁路模式」", "evidence": "E2"},
    {"time": "18:42", "event": "門禁刷卡與夜間燈光切換", "detail": "林書妍進入 B 展廳時，側光亮起，入口玻璃上浮出第六道人影", "evidence": "E1"},
    {"time": "18:56", "event": "西側裝卸區出庫", "detail": "標示「器材退庫」的恆溫箱離館；複寫聯卻指向林月琴的舊畫室", "evidence": "E4"},
    {"time": "19:05", "event": "原畫失竊曝光", "detail": "保全發現畫框裡是 R-07 仿作；兩週前的紫外線底片則留下原作人影與署名的線索", "evidence": None},
]

# 時間線推理關卡：玩家把事件配到時間點，再判讀證據本身能證明的範圍。
TIMELINE_PUZZLE = {
    "events": {
        "bypass_start": "警報切換為旁路模式（E2）",
        "curator_entry": "林書妍進入 B 展廳，玻璃浮出第六道人影（E1）",
        "bypass_end": "警報旁路結束（E2）",
        "crate_exit": "恆溫運輸箱由西側裝卸區出館（E4）",
        "fake_found": "保全發現畫框中的畫作是仿作（E5）",
    },
    "slots": [
        {"time": "18:41", "correct": "bypass_start"},
        {"time": "18:42", "correct": "curator_entry"},
        {"time": "18:54", "correct": "bypass_end"},
        {"time": "18:56", "correct": "crate_exit"},
    ],
    "scope_questions": {
        "e4": {
            "question": "E4 出庫單能直接證明哪一項？",
            "options": [
                "恆溫箱裡一定是真跡《海霧港灣》",
                "林書妍簽核的恆溫箱於 18:56 出館，複寫聯指向林月琴舊畫室，但貨物欄空白，不能確認箱內物品",
                "林書妍親手把畫作搬上運輸箱",
                "警方已在箱內找到真跡",
            ],
            "correct": 1,
        },
        "e3": {
            "question": "E3 勤務簿能直接證明哪一項？",
            "options": [
                "王冠宇每一分鐘都待在 B1，沒有離開過",
                "王冠宇在 B1 簽到、簽退，並曾記下玻璃裡的第六個人影；簽到簿沒有逐分鐘記錄他的行蹤",
                "王冠宇親眼看見林書妍把原畫裝箱",
                "勤務簿證明怪談中的人影是真的鬼",
            ],
            "correct": 1,
        },
    },
    "hints": [
        "把 E1 的 18:42 和 E2 的 18:41–18:54 放在一起看：一個是單一時間，一個是持續一段時間。",
        "18:42 落在警報旁路期間；18:56 則在旁路結束後兩分鐘。E4 的貨物欄空白，E3 的筆記記下怪談，但都不能單獨證明整件案情。",
        "正確配對依序是：18:41 警報旁路開始、18:42 林書妍進入、18:54 旁路結束、18:56 恆溫箱出館。E4 不能單獨證明箱內是真跡；E3 不能單獨證明王冠宇全程留在 B1。",
    ],
}

WITNESSES = {
    "curator": {
        "name": "林書妍",
        "role": "美術館策展人",
        "location": "2F 策展人辦公室 ／ B 展廳",
        "image": "assets/witness_curator.jpg",
        "personality": "冷靜、措辭謹慎；每當談到畫作的來歷，語氣就會變得格外堅定",
        "statement_id": "curator_office",
        "statement": "18:30 閉館後，我一直在辦公室整理隔日拍賣預展的清冊，沒有再進入 B 展廳。",
        "known_facts": "她負責整理隔日拍賣預展的館藏清冊；她表示閉館後一直留在辦公室。",
        # (問題, 需先讀過的證物)；None 表示一開始就能問
        "sample_questions": [
            ("你相信閉館後玻璃裡會多出一個人影嗎？", None),
            ("18:42 的門禁刷卡與入口影像怎麼解釋？", "E1"),
            ("你簽核的恆溫箱為什麼送往林月琴的舊畫室？", "E4"),
            ("鑑定報告裡的第六個人影和林月琴是誰？", "E5"),
        ],
    },
    "guard": {
        "name": "陳建中",
        "role": "夜班保全",
        "location": "全館巡邏路線 ／ 中控台",
        "image": "assets/witness_guard.jpg",
        "personality": "務實、略顯疲憊，對警報紀錄異常敏感，總想把話題帶回巡場流程",
        "statement_id": "guard_alarm",
        "statement": "從閉館到 19:05，我巡場時 B 展廳警報都正常，沒有被切成旁路。",
        "known_facts": "他負責閉館後巡場；他堅稱巡場時警報正常，卻沒有在第一時間查看控制台紀錄。",
        "sample_questions": [
            ("你聽過『第六個人影』的傳聞嗎？", None),
            ("警報控制台在 18:41 到 18:54 為什麼顯示旁路模式？", "E2"),
            ("旁路期間你為什麼沒有通報？", "E2"),
        ],
    },
    "cleaner": {
        "name": "王冠宇",
        "role": "清潔員（被告）",
        "location": "B1 地下器材室",
        "image": "assets/witness_cleaner.jpg",
        "personality": "緊張但觀察力敏銳，害怕別人把自己的筆記當成胡言亂語",
        "statement_id": "cleaner_basement",
        "statement": "18:30 到 19:00，我在 B1 器材室整理清潔車，沒有上過 B 展廳。",
        "known_facts": "他的當班工作地點是 B1 器材室；勤務簿除了簽到簽退，還有幾晚以前記下的『第六個人影』。",
        "sample_questions": [
            ("你為什麼在勤務簿上畫了第六個人影？", "E3"),
            ("18:30 到 19:00 之間有人能證明你在 B1 嗎？", None),
            ("你的識別證有沒有借給別人或遺失？", None),
            ("你知道那只恆溫箱要送去哪裡嗎？", "E4"),
        ],
    },
}

STATEMENTS = {
    witness["statement_id"]: {
        "witness_id": witness_id,
        "witness_name": witness["name"],
        "text": witness["statement"],
    }
    for witness_id, witness in WITNESSES.items()
}

EVIDENCE = [
    {
        "id": "E1",
        "scene_id": "security",
        "title": "門禁與入口影像紀錄",
        "tag": "門禁紀錄",
        "time_hint": "18:42 · 2F B 展廳入口",
        "image": "assets/evidence_e1.jpg",
        "object_name": "門禁電腦與監控畫面",
        "object_short": "門禁監控電腦",
        "object_icon": "🖥️",
        "scene_spot": "保全中控區左側雙螢幕監控主機",
        "scene_note": "調閱門禁與入口影像：18:42 林書妍本人進入 B 展廳，夜間側光同時亮起，玻璃裡浮出第六道人影。",
        "hotspot_x": 16,
        "hotspot_y": 64,
        "unlocks_scenes": ["loading_dock"],
        "detail": "18:42，林書妍的識別證刷入 B 展廳，入口影像核對為她本人。夜間側光同時亮起，玻璃上出現像是站在畫裡的第六道人影；畫面只看得到一個實際進入的人。門禁和影像能證明她到過現場，不能單獨證明她拿走畫作。",
    },
    {
        "id": "E2",
        "scene_id": "security",
        "title": "警報控制台紀錄",
        "tag": "系統紀錄",
        "time_hint": "18:41–18:54 · 警報中控台",
        "image": "assets/evidence_e2.jpg",
        "object_name": "警報控制面板",
        "object_short": "警報控制面板",
        "object_icon": "📟",
        "scene_spot": "保全中控區右側牆面警報控制面板",
        "scene_note": "從中控區右側牆上的警報控制面板查看感應器系統紀錄，顯示 18:41 至 18:54 期間遭管理帳號切換為旁路模式。",
        "hotspot_x": 74,
        "hotspot_y": 49,
        "unlocks_scenes": ["loading_dock"],
        "detail": "B 展廳的動作感應器於 18:41 至 18:54 被切換為旁路模式；操作帳號為策展人專用的管理帳號。",
    },
    {
        "id": "E3",
        "scene_id": "basement",
        "title": "勤務簿與手繪影像筆記",
        "tag": "手寫紀錄",
        "time_hint": "18:30–19:00 · B1 器材室",
        "image": "assets/evidence_e3.jpg",
        "object_name": "清潔勤務簿／筆記本",
        "object_short": "清潔勤務筆記",
        "object_icon": "📒",
        "scene_spot": "B1 器材室檯燈工作桌上的清潔勤務簿",
        "scene_note": "翻閱工作桌上的清潔勤務簿：除當晚簽到與簽退時間外，頁角還留著三晚前 18:42 的人影速寫。",
        "hotspot_x": 69,
        "hotspot_y": 59,
        "unlocks_scenes": [],
        "detail": "王冠宇 18:30 在 B1 簽到、19:00 由主管簽退。簿頁邊角還有三晚前的速寫：「18:42，燈光轉暗，玻璃裡又多出一個人影。」這證明他曾記下怪談，不代表簽到簿能逐分鐘證明他整晚的位置。",
    },
    {
        "id": "E4",
        "scene_id": "loading_dock",
        "title": "被塗改的恆溫箱出庫單",
        "tag": "物流紀錄",
        "time_hint": "18:56 · 1F 西側裝卸區",
        "image": "assets/evidence_e4.jpg",
        "object_name": "桌上出庫單文件",
        "object_short": "桌上出庫文件",
        "object_icon": "📋",
        "scene_spot": "1F 西側裝卸區出貨作業台上的公文夾",
        "scene_note": "檢視西側裝卸區出庫單：18:56 恆溫箱由林書妍簽核出館，正本貨物欄空白，複寫聯卻留下舊畫室目的地。",
        "hotspot_x": 28,
        "hotspot_y": 60,
        "unlocks_scenes": ["curator_office"],
        "detail": "18:56，一只標示「器材退庫」的恆溫運輸箱由西側出館，申請與簽核人都是林書妍。正本的貨物欄空白；墊在底下的複寫聯卻留有目的地「林月琴舊畫室」。這仍不能單獨證明箱內裝的是原畫。",
    },
    {
        "id": "E5",
        "scene_id": "gallery",
        "title": "紫外線鑑定與署名比對",
        "tag": "鑑定報告",
        "time_hint": "19:05 · B 展廳畫框",
        "image": "assets/evidence_e5.jpg",
        "object_name": "畫框與檢驗資料",
        "object_short": "畫框檢驗資料",
        "object_icon": "🖼️",
        "scene_spot": "2F B 展廳中央《海霧港灣》畫框與旁側檢驗資料",
        "scene_note": "檢查畫框與鑑定資料：留在現場的是 R-07 仿作；舊紫外線底片顯出清漆下的人影與林月琴署名。",
        "hotspot_x": 50,
        "hotspot_y": 45,
        "unlocks_scenes": ["security", "basement", "restoration"],
        "detail": "框中的畫是修復室編號 R-07 的仿作。兩週前的紫外線底片顯示，原作清漆下藏著一名女子；夜間側光照到畫面時，她的輪廓會映在玻璃上，像是多出第六個人。人像旁還有被覆蓋的署名「林月琴」——她是策展人林書妍的外祖母。館藏卡與隔日拍賣目錄卻都只列知名畫家沈景川，沒有林月琴。",
    },
]

# 環境探索物件與互動解謎機關：豐富 6 大場景的可玩性與跨房解鎖，嚴格沿用既有案件設定
ENV_OBJECTS = [
    {
        "id": "OBJ_DOOR_READER",
        "scene_id": "gallery",
        "title": "B 展廳東側拱門讀卡機",
        "hover_prompt": "🔍 靠近查看右側拱門旁的門禁讀卡機",
        "object_icon": "🪪",
        "hotspot_x": 89,
        "hotspot_y": 54,
        "unlocks_scenes": ["security"],
        "kicker": "GALLERY B ACCESS READER // HARDWARE CHECK",
        "sub": "位置：2F B 展廳東側拱門入口　｜　連線目標：保全中控區主機",
        "summary": "門鎖與讀卡機沒有被撬開的痕跡。閉館後若要進入 B 展廳，必須刷合法識別證，完整進出與入口影像會同步存入「保全中控區」。",
        "unlock_msg": "🔓 已確認連線位置！現在可切換至「🛡️ 保全中控區」調閱門禁與警報紀錄。",
    },
    {
        "id": "OBJ_WALL_SENSOR",
        "scene_id": "gallery",
        "title": "展廳側光軌道與動作感應器",
        "hover_prompt": "🔍 檢視畫框上方軌道燈與防盜感應模組",
        "object_icon": "📡",
        "hotspot_x": 67,
        "hotspot_y": 32,
        "unlocks_scenes": ["security"],
        "kicker": "GALLERY B LIGHTING & MOTION SENSOR",
        "sub": "位置：2F B 展廳主牆上方軌道　｜　狀態：無外力損壞",
        "summary": "展廳燈光在 18:42 切換為夜間側光時，光線會以約 48° 斜打在畫框玻璃上。動作感應器本身沒有故障，異常紀錄只會留在「保全中控區」的控制台。",
        "unlock_msg": "🔓 已追蹤感應器線路！現在可前往「🛡️ 保全中控區」查看警報控制台。",
    },
    {
        "id": "OBJ_PATROL_BOARD",
        "scene_id": "security",
        "title": "夜班巡邏平面圖看板",
        "hover_prompt": "🔍 檢視中控室中央牆面的全館巡邏路線圖",
        "object_icon": "🗺️",
        "hotspot_x": 50,
        "hotspot_y": 45,
        "unlocks_scenes": ["basement"],
        "kicker": "NIGHT PATROL ROUTE // MUSEUM FLOOR PLAN",
        "sub": "位置：1F 保全中控區中央牆面　｜　涵蓋：2F 展廳、1F 裝卸區、B1 器材室",
        "summary": "平面圖標示 18:30 閉館後的例行巡邏動線：保全於 19:05 巡至 2F B 展廳才發現畫作異常；圖下方另標記了清潔員王冠宇當班的「B1 地下器材室」簽到處。",
        "unlock_msg": "🔓 已確認 B1 器材室位置！現在可前往「🧹 B1 地下器材室」查核清潔員勤務簿。",
    },
    {
        "id": "OBJ_CLEANING_CART",
        "scene_id": "basement",
        "title": "B1 清潔工具推車",
        "hover_prompt": "🔍 查看左側停放的清潔推車與工具",
        "object_icon": "🛒",
        "hotspot_x": 21,
        "hotspot_y": 69,
        "unlocks_scenes": [],
        "kicker": "B1 MAINTENANCE CART // VISUAL INSPECTION",
        "sub": "位置：B1 地下器材室左側　｜　責任人：清潔員 王冠宇",
        "summary": "推車上整齊擺放拖把、清潔噴瓶與備品，與王冠宇「18:30 到 19:00 在 B1 整理清潔車」的說法相符；不過推車本身無法證明他中間是否曾短暫離開。",
        "unlock_msg": "📝 已將現場觀察收進調查筆記。",
    },
    {
        "id": "OBJ_UV_EASEL",
        "scene_id": "restoration",
        "title": "R-07 仿作畫架與真偽比對燈（互動關卡）",
        "hover_prompt": "🧩 進入互動找碴關卡：比對中央畫架與原作破綻",
        "object_icon": "🔬",
        "hotspot_x": 50,
        "hotspot_y": 46,
        "unlocks_scenes": ["curator_office"],
        "puzzle_type": "spot_diff",
        "kicker": "RESTORATION ROOM R-07 // FORENSIC SPOT-THE-DIFFERENCE",
        "sub": "位置：B1 修復室 R-07 中央畫架　｜　互動關卡：找出 3 處仿作破綻",
        "summary": "比對確認：R-07 仿作雖然臨摹了海霧港灣外觀，卻沒有原作清漆下的第六道女子人影，也少了被覆蓋的「林月琴」署名；畫架背面的修復借調簽核指向「2F 策展人辦公室」。",
        "unlock_msg": "🔓 完成 R-07 真偽比對！已解鎖隱藏區域「🕯️ 2F 策展人辦公室」。",
    },
    {
        "id": "OBJ_PIGMENT_TABLE",
        "scene_id": "restoration",
        "title": "清漆溶劑與修復顏料作業台",
        "hover_prompt": "🔍 檢視左側工作台上的清漆瓶與放大鏡",
        "object_icon": "🧪",
        "hotspot_x": 17,
        "hotspot_y": 72,
        "unlocks_scenes": [],
        "kicker": "CONSERVATION BENCH // VARNISH & PIGMENTS",
        "sub": "位置：B1 修復室 R-07 左側作業台　｜　用途：老舊清漆檢測與仿作保存",
        "summary": "工作台上擺著清漆樣本與放大鏡。紀錄註明：原作清漆層年代久遠，在特定夜間側光下會產生微弱折射，讓底層人像輪廓映在保護玻璃上——這就是「第六個人影」怪談的物理成因。",
        "unlock_msg": "📝 已記下怪談的物理光學成因（無超自然事實）。",
    },
    {
        "id": "OBJ_FILM_LIGHTBOX",
        "scene_id": "restoration",
        "title": "兩週前紫外線底片存檔燈箱",
        "hover_prompt": "🔍 查看右側牆面發光的紫外線底片燈箱",
        "object_icon": "🎞️",
        "hotspot_x": 88,
        "hotspot_y": 49,
        "unlocks_scenes": ["curator_office"],
        "kicker": "ARCHIVAL LIGHTBOX // UV NEGATIVES (2 WEEKS AGO)",
        "sub": "位置：B1 修復室 R-07 右側牆面　｜　調閱紀錄：策展人林書妍",
        "summary": "燈箱上整齊掛著兩週前拍攝的《海霧港灣》紫外線底片。借閱登記欄顯示，最近一次調閱這些底片並帶回「2F 策展人辦公室」核對署名的人，正是林書妍。",
        "unlock_msg": "🔓 發現底片借閱紀錄！現在可前往「🕯️ 2F 策展人辦公室」追查動機。",
    },
    {
        "id": "OBJ_LOADING_BAY",
        "scene_id": "loading_dock",
        "title": "恆溫運輸箱與貨運鐵捲門",
        "hover_prompt": "🔍 近距離檢視右側平板推車上的恆溫箱與捲門",
        "object_icon": "🚚",
        "hotspot_x": 74,
        "hotspot_y": 62,
        "unlocks_scenes": [],
        "kicker": "WEST LOADING DOCK // CLIMATE CRATE & BAY",
        "sub": "位置：1F 西側裝卸區貨運口　｜　用途：大型展品與器材出入館",
        "summary": "裝卸區地面留有平板推車胎痕。美術館用於運送油畫與器材的恆溫運輸箱尺寸相近，外觀無法直接看出箱內物品，必須核對左側工作台上的出庫單與複寫聯。",
        "unlock_msg": "📝 已將裝卸區動線觀察收進調查筆記。",
    },
    {
        "id": "OBJ_BRASS_BOX",
        "scene_id": "curator_office",
        "title": "上鎖的黃銅雕花木匣（互動密碼鎖）",
        "hover_prompt": "🔐 解開互動密碼機關：打開辦公桌上的黃銅木匣",
        "object_icon": "🔐",
        "hotspot_x": 63,
        "hotspot_y": 68,
        "unlocks_scenes": [],
        "puzzle_type": "brass_dial",
        "kicker": "CURATOR'S DESK // BRASS DIAL LOCKBOX",
        "sub": "位置：2F 策展人辦公室桌面　｜　互動關卡：三輪黃銅密碼鎖",
        "summary": "木匣內藏著一份被紅筆圈住「作者：沈景川」的拍賣預展目錄清樣，以及一張「林月琴舊畫室」地址牌。這印證了林書妍移走原畫的真正動機：阻止外祖母的署名在明早拍賣前徹底被抹去。",
        "unlock_msg": "🔓 成功開啟策展人暗匣！林書妍移走原畫的動機已徹底明朗。",
    },
    {
        "id": "OBJ_AUCTION_DRAFT",
        "scene_id": "curator_office",
        "title": "拍賣預展目錄校對稿",
        "hover_prompt": "🔍 檢視綠色檯燈下攤開的拍賣預展清冊",
        "object_icon": "📖",
        "hotspot_x": 47,
        "hotspot_y": 75,
        "unlocks_scenes": [],
        "kicker": "AUCTION PREVIEW CATALOG // FINAL PROOF",
        "sub": "位置：2F 策展人辦公室綠燈書桌　｜　印刷狀態：明早公開發行",
        "summary": "校對稿上《海霧港灣》的作者欄僅印著知名畫家「沈景川」，頁邊留有被匆忙劃掉的補註「應補列共同創作者林月琴？——董事會否決」。",
        "unlock_msg": "📝 已收錄拍賣目錄背景線索，可用於最後結案推理。",
    },
    {
        "id": "OBJ_HARBOR_WINDOW",
        "scene_id": "curator_office",
        "title": "霧港夜景拱形窗台",
        "hover_prompt": "🔍 望向窗外濃霧籠罩的霧港碼頭",
        "object_icon": "🌫️",
        "hotspot_x": 85,
        "hotspot_y": 45,
        "unlocks_scenes": [],
        "kicker": "FOG HARBOR VIEW // 2F ARCHED WINDOW",
        "sub": "位置：2F 策展人辦公室右側拱窗　｜　視野：霧港碼頭與 1F 西側車道",
        "summary": "從 2F 辦公室拱窗往下望，恰好能看見 1F 西側裝卸區車道與海霧中的港灣船影——與《海霧港灣》畫中景色如出一轍。",
        "unlock_msg": "📝 已確認 2F 辦公室與 1F 裝卸區的相對位置。",
    },
]

CORRECT_CHALLENGES = {
    ("curator_office", "E1"): {
        "clue_id": "curator_access",
        "summary": "18:42 的門禁和入口影像核對為林書妍本人，與她「閉館後沒進展廳」的證詞衝突；這能證明她到過現場，還不能單獨證明她拿走原畫。",
        "fallback_reaction": "林書妍盯著影像沉默片刻：「你證明我進過展廳，還沒證明我把什麼帶走。」法官將這項矛盾記入筆錄。",
    },
    ("guard_alarm", "E2"): {
        "clue_id": "alarm_bypass",
        "summary": "控制台紀錄顯示 18:41 至 18:54 警報被切成旁路，與保全「警報沒有被切換」的證詞衝突。",
        "fallback_reaction": "陳建中避開法官的目光：「我以為是例行檢修，沒有追問，也沒有如實回報警報狀態。這是我的失職，但我不能替你判定誰搬走了畫。」",
    },
}

CULPRIT_ID = "curator"
CORRECT_REASON_ID = "combined_evidence"
FINAL_REASONS = {
    "combined_evidence": "E1、E2 證明林書妍在警報旁路時進入展廳；E4 的恆溫箱指向林月琴舊畫室；E5 的 R-07 仿作與隱藏署名，說明她為何要把原畫從拍賣目錄中救出。",
    "guard": "保全說謊代表他一定偷畫；誰說謊，誰就是犯人。",
    "cleaner": "勤務簿記下王冠宇在 B1 簽到和簽退，所以他整晚都在那裡。",
}

MAX_COURT_HINT_LEVEL = 3
REQUIRED_CLUES = {"curator_access", "alarm_bypass"}

# ---- 無 API Key 或 AI 失敗時的備援台詞 ----
# 每位證人依主題各有多句台詞，隨機挑選且避免連續重複；
# 台詞只能重述既有案件設定，不可新增案件事實。

# 出現任一關鍵字就視為「與本案有關」的問題
CASE_KEYWORDS = (
    "畫", "海霧", "展廳", "閉館", "警報", "門禁", "刷卡", "識別證", "影像", "監視",
    "保全", "巡", "清潔", "辦公室", "清冊", "運輸箱", "出庫", "裝卸", "仿作", "鑑定",
    "修復", "偷", "竊", "調包", "案", "證詞", "證據", "時間", "幾點", "當晚", "那天",
    "晚上", "18", "19", "b1", "器材室", "林書妍", "陳建中", "王冠宇", "策展", "簽到",
    "簽退", "帳號", "旁路", "控制台", "犯人", "兇手", "美術館", "拍賣", "預展",
    "第六個人", "人影", "倒影", "玻璃", "署名", "林月琴", "紫外線", "原畫",
)

FALLBACK_REPLIES = {
    "curator": {
        "topics": [
            {
                "keywords": ("拍賣", "預展", "貨箱", "董事會"),
                "replies": [
                    "隔日預展是董事會安排的，出庫程序由我簽核；請別把兩件事直接畫上等號。",
                    "我整理的是館藏清冊。至於貨箱裡是什麼，單據上並沒有寫。",
                ],
            },
            {
                "keywords": ("第六個人", "人影", "倒影", "玻璃", "怪談", "幽靈"),
                "replies": [
                    "那只是老館員流傳的怪談，玻璃和燈光會讓人看錯。",
                    "你想用一個人影來證明什麼？先看鑑定報告上的實際紀錄。",
                ],
            },
            {
                "keywords": ("林月琴", "外祖母", "署名", "作者", "紫外線"),
                "replies": [
                    "林月琴是我的外祖母。她的名字沒有出現在拍賣目錄裡，這才是你該追問的事。",
                    "報告上的署名被覆蓋了多年。你現在知道我為什麼不願意讓這幅畫就這樣被送走了嗎？",
                ],
            },
            {
                "keywords": ("辦公室", "清冊", "離開", "閉館後"),
                "replies": [
                    "沒有，閉館後我一直在辦公室整理清冊。",
                    "我說過了，18:30 閉館後我就待在辦公室，沒有再進 B 展廳。",
                ],
            },
            {
                "keywords": ("門禁", "刷卡", "識別證", "18:42", "影像", "進入", "進去", "展廳"),
                "replies": [
                    "我不記得在 18:42 進過 B 展廳。即使短暫進去查看陳列，也不代表我拿走了畫作。",
                    "識別證紀錄不代表刷卡的人就是我……我是說，閉館後我在辦公室整理清冊。",
                    "辯護律師，你是在暗示什麼？我的證詞很清楚，閉館後我沒有再進 B 展廳。",
                ],
            },
            {
                "keywords": ("運輸箱", "出庫", "裝卸", "18:56", "退庫", "箱", "單據"),
                "replies": [
                    "那只是展務器材退庫，單據由我簽核是正常程序，跟失竊的《海霧港灣》無關。",
                    "退庫流程本來就要我簽核，單據沒填箱內物品只是疏忽。",
                    "出庫單需要策展人簽核，這是我的職責，不能因此就懷疑我。",
                ],
            },
            {
                "keywords": ("警報", "旁路", "帳號", "控制台", "權限"),
                "replies": [
                    "警報系統的事，你應該去問負責巡場的保全。",
                    "管理帳號是策展人使用的沒錯，但當晚控制台的狀況我不清楚。",
                ],
            },
            {
                "keywords": ("畫", "仿作", "鑑定", "修復", "r-07", "海霧"),
                "replies": [
                    "《海霧港灣》被調包，身為策展人我比誰都心痛。",
                    "鑑定報告我看過了，但那並不能說明是誰換的畫。",
                ],
            },
        ],
        "default": [
            "閉館後我一直在辦公室整理清冊，沒有離開。",
            "我能說的都已經在證詞裡了：18:30 閉館後，我在辦公室。",
        ],
        "irrelevant": [
            "這跟本案無關吧？請把問題集中在當晚的事。",
            "我不打算回答與案件無關的私人問題。",
            "辯護律師，法庭的時間很寶貴，請問與本案有關的事。",
        ],
    },
    "guard": {
        "topics": [
            {
                "keywords": ("拍賣", "預展", "貨箱", "出庫"),
                "replies": [
                    "我以為那只是隔日預展的器材退庫流程，沒有確認複寫聯上的目的地。",
                    "我沒有看過箱內，也不知道林策展人把箱子送去了哪裡。",
                ],
            },
            {
                "keywords": ("第六個人", "人影", "倒影", "玻璃", "怪談", "幽靈"),
                "replies": [
                    "夜班的人都聽過那個傳聞。我一直覺得是展廳熄燈後玻璃反光造成的。",
                    "我不相信有鬼，但我確實沒有把那個人影當成需要通報的事。",
                ],
            },
            {
                "keywords": ("警報", "解除", "旁路", "控制台", "18:41", "18:54"),
                "replies": [
                    "我巡場時沒有發現警報異常，控制台紀錄應該是完整的。",
                    "旁路模式？我巡場時警報看起來都正常，我不知道為什麼會有這種紀錄。",
                    "警報整晚都正常，至少我巡場時是這樣認為的。",
                ],
            },
            {
                "keywords": ("權限", "帳號", "管理", "誰"),
                "replies": [
                    "旁路模式要策展人等級的管理帳號才能切換，我的權限做不到。",
                    "保全的帳號沒有那個權限，只有策展人專用的管理帳號可以切換旁路。",
                ],
            },
            {
                "keywords": ("巡", "路線", "時間", "幾點", "19:05", "發現"),
                "replies": [
                    "我負責閉館後巡場，直到 19:05 巡到 B 展廳發現畫作不對勁，才知道出了狀況。",
                    "巡場就是照路線一區一區走，19:05 走到 B 展廳才發現畫被換了。",
                ],
            },
            {
                "keywords": ("門禁", "刷卡", "識別證", "影像"),
                "replies": [
                    "門禁紀錄不是我負責查的，你可以去調資料。",
                    "我只負責巡場，誰刷卡進出我不會一筆一筆看。",
                ],
            },
        ],
        "default": [
            "我能說的就是：從閉館到 19:05，B 展廳警報都正常。",
            "我只是照流程巡場，其他的我不清楚。",
        ],
        "irrelevant": [
            "呃……這跟案子有什麼關係？",
            "我值了一整晚的班，可以先問案子的事嗎？",
            "抱歉，這個問題跟本案無關，我沒辦法回答。",
        ],
    },
    "cleaner": {
        "topics": [
            {
                "keywords": ("第六個人", "人影", "倒影", "玻璃", "怪談", "幽靈"),
                "replies": [
                    "我把看到的東西畫在簿子上，不是說那一定是鬼。燈一暗，玻璃裡就像多了一個人。",
                    "那個人影我三晚前就記下來了。當晚我在 B1，沒有上樓看畫。",
                ],
            },
            {
                "keywords": ("拍賣", "預展", "林月琴", "署名", "作者", "紫外線"),
                "replies": [
                    "我只知道隔天要送展，其他是我從出庫單和報告裡拼出來的。",
                    "如果那個署名是真的，這幅畫就不只是值多少錢的問題了。",
                ],
            },
            {
                "keywords": ("證明", "有人", "誰", "證人", "簽到", "簽退", "主管"),
                "replies": [
                    "可以！我 18:30 在 B1 簽到，19:00 是主管幫我簽退的，簽到單上都有時間戳記。",
                    "主管 19:00 在 B1 器材室幫我簽退，簽到和簽退紀錄都可以查。",
                ],
            },
            {
                "keywords": ("勤務", "地下", "b1", "時間", "清潔車", "在哪", "做什麼"),
                "replies": [
                    "18:30 到 19:00 我在 B1 器材室整理清潔車，沒有上樓。",
                    "那半小時我都在器材室整理清潔車，一直待在 B1。",
                ],
            },
            {
                "keywords": ("識別證", "工作證", "借", "遺失", "弄丟"),
                "replies": [
                    "我的工作證一直帶在身上，從沒借給別人。",
                    "識別證沒有遺失，也沒有借人，我可以發誓。",
                ],
            },
            {
                "keywords": ("聲音", "動靜", "裝卸", "聽到", "看到"),
                "replies": [
                    "我在 B1 整理清潔車，沒有注意到樓上或裝卸區的動靜。",
                    "器材室在地下一樓，上面發生什麼事我不太清楚。",
                ],
            },
            {
                "keywords": ("畫", "偷", "調包", "仿作", "展廳"),
                "replies": [
                    "我根本沒碰過那幅畫，我連 B 展廳都沒上去！",
                    "我只是清潔員，那段時間我在 B1，怎麼可能去換畫……",
                ],
            },
        ],
        "default": [
            "我照排班工作，沒有進入 B 展廳。那天我一直在 B1 器材室。",
            "律師，拜託相信我，我真的什麼都沒做。",
        ],
        "irrelevant": [
            "呃……這跟案子有關嗎？我現在只想證明自己是清白的。",
            "對不起，我太緊張了……可以先問那天晚上的事嗎？",
        ],
    },
}

