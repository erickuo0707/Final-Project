"""固定案件、證詞與法庭判定資料。"""

CASE_TITLE = "消失的名畫"
ARTWORK_NAME = "海霧港灣"
CASE_BACKGROUND = (
    "市立霧港美術館於 18:30 閉館。19:05，夜班保全發現 B 展廳的名畫《海霧港灣》"
    "已被仿作替換。清潔員因當晚仍在館內而遭到懷疑。你是他的辯護律師，必須找出證詞與證物的矛盾，"
    "並在庭上說服法官。"
)

SCENE_IMAGES = {
    "museum": "assets/scene_museum.jpg",
    "courtroom": "assets/scene_courtroom.jpg",
}

CASE_TIMELINE = [
    {"time": "18:30", "event": "美術館閉館", "detail": "觀眾離場；王冠宇於 B1 器材室簽到整理清潔車"},
    {"time": "18:41–18:54", "event": "B 展廳警報異動", "detail": "動作感應器遭管理帳號切換為「旁路模式」（待查證）"},
    {"time": "18:42", "event": "B 展廳門禁刷卡", "detail": "門禁系統記錄到有人刷卡進入 2F B 展廳（待查證）"},
    {"time": "18:56", "event": "西側裝卸區出庫", "detail": "一只標示「器材退庫」的恆溫運輸箱由西側裝卸區出館"},
    {"time": "19:00", "event": "B1 勤務簽退", "detail": "主管於 B1 器材室為王冠宇簽退"},
    {"time": "19:05", "event": "發現名畫遭調包", "detail": "夜班保全巡場至 B 展廳，發現《海霧港灣》被換成仿作"},
]

WITNESSES = {
    "curator": {
        "name": "林書妍",
        "role": "美術館策展人",
        "location": "2F 策展人辦公室 ／ B 展廳",
        "image": "assets/witness_curator.jpg",
        "personality": "冷靜、措辭謹慎，重視自己的專業形象",
        "statement_id": "curator_office",
        "statement": "18:30 閉館後，我一直在辦公室整理清冊，沒有再進入 B 展廳。",
        "known_facts": "美術館 18:30 閉館；她表示閉館後留在辦公室整理清冊。",
        "sample_questions": [
            "閉館後你真的沒有離開辦公室嗎？",
            "18:42 的門禁刷卡與入口影像怎麼解釋？",
            "為什麼 18:56 會有你簽核的恆溫運輸箱出館？",
        ],
    },
    "guard": {
        "name": "陳建中",
        "role": "夜班保全",
        "location": "全館巡邏路線 ／ 中控台",
        "image": "assets/witness_guard.jpg",
        "personality": "務實、略顯疲憊，回答時常強調巡場流程",
        "statement_id": "guard_alarm",
        "statement": "從閉館到 19:05 發現畫作不見，B 展廳警報都正常，沒有被解除。",
        "known_facts": "他負責閉館後巡場；他表示警報整晚都正常。",
        "sample_questions": [
            "閉館後你的巡場路線與時間是什麼？",
            "警報控制台在 18:41 到 18:54 為什麼顯示旁路模式？",
            "誰擁有將警報切換成旁路模式的管理權限？",
        ],
    },
    "cleaner": {
        "name": "王冠宇",
        "role": "清潔員（被告）",
        "location": "B1 地下器材室",
        "image": "assets/witness_cleaner.jpg",
        "personality": "緊張但願意配合，熟悉自己的排班和工作車",
        "statement_id": "cleaner_basement",
        "statement": "18:30 到 19:00，我在 B1 器材室整理清潔車，沒有上過 B 展廳。",
        "known_facts": "他的當班工作地點是 B1 器材室；他表示那段時間沒有上樓。",
        "sample_questions": [
            "18:30 到 19:00 之間有人能證明你在 B1 嗎？",
            "你的識別證有沒有借給別人或遺失？",
            "你在整理清潔車時有聽到裝卸區的動靜嗎？",
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
        "title": "門禁與入口影像紀錄",
        "tag": "關鍵矛盾證物",
        "time_hint": "18:42 · 2F B 展廳入口",
        "image": "assets/evidence_e1.jpg",
        "detail": "18:42，林書妍的識別證刷入 B 展廳，入口影像經值班員核對為她本人。紀錄能證明她進入，但不能單獨證明她拿走畫作。",
    },
    {
        "id": "E2",
        "title": "警報控制台紀錄",
        "tag": "關鍵矛盾證物",
        "time_hint": "18:41–18:54 · 警報中控台",
        "image": "assets/evidence_e2.jpg",
        "detail": "B 展廳的動作感應器於 18:41 至 18:54 被切換為旁路模式；操作帳號為策展人專用的管理帳號。",
    },
    {
        "id": "E3",
        "title": "清潔勤務簽到單",
        "tag": "不在場證明",
        "time_hint": "18:30–19:00 · B1 器材室",
        "image": "assets/evidence_e3.jpg",
        "detail": "王冠宇於 18:30 在 B1 器材室簽到，19:00 由主管簽退；兩筆紀錄均有時間戳記。",
    },
    {
        "id": "E4",
        "title": "西側裝卸區出庫單",
        "tag": "贓物動向",
        "time_hint": "18:56 · 1F 西側裝卸區",
        "image": "assets/evidence_e4.jpg",
        "detail": "18:56，一只標示「器材退庫」的恆溫運輸箱由西側裝卸區出館，申請與簽核人都是林書妍；單據沒有填寫箱內物品。",
    },
    {
        "id": "E5",
        "title": "畫作鑑定報告",
        "tag": "調包鐵證",
        "time_hint": "19:05 · B 展廳畫框",
        "image": "assets/evidence_e5.jpg",
        "detail": "留在展廳畫框中的畫布含有合成清漆，背面另有修復室仿作編號 R-07；鑑定結論為仿作。",
    },
]

CORRECT_CHALLENGES = {
    ("curator_office", "E1"): {
        "clue_id": "curator_access",
        "summary": "門禁紀錄顯示策展人的識別證在 18:42 進入 B 展廳，與她「閉館後沒有進入展廳」的證詞衝突。",
        "fallback_reaction": "林書妍停頓了一下：「識別證紀錄不代表刷卡的人就是我。」法官將這項矛盾記入筆錄。",
    },
    ("guard_alarm", "E2"): {
        "clue_id": "alarm_bypass",
        "summary": "控制台紀錄顯示警報曾被切換為旁路模式，與保全「警報沒有被解除」的證詞衝突。",
        "fallback_reaction": "陳建中皺起眉頭：「我巡場時沒有發現異常。」法官要求他說明控制台紀錄。",
    },
}

CULPRIT_ID = "curator"
CORRECT_REASON_ID = "combined_evidence"
FINAL_REASONS = {
    "combined_evidence": "策展人的進出與警報紀錄、她簽核的運輸箱，以及展出的仿作彼此吻合。",
    "guard": "保全否認警報異常，所以一定是保全偷走畫作。",
    "cleaner": "清潔員當晚仍在館內，所以他一定換走了畫作。",
}

MAX_WRONG_CHALLENGES = 3
REQUIRED_CLUES = {"curator_access", "alarm_bypass"}
