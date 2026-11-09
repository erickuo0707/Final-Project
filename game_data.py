"""固定案件、證詞與法庭判定資料。"""

CASE_TITLE = "消失的名畫"
ARTWORK_NAME = "海霧港灣"
CASE_BACKGROUND = (
    "市立霧港美術館於 18:30 閉館。19:05，夜班保全發現 B 展廳的名畫《海霧港灣》"
    "已被仿作替換。清潔員因當晚仍在館內而遭到懷疑。你是他的辯護律師，必須找出證詞與證物的矛盾，"
    "並在庭上說服法官。"
)

WITNESSES = {
    "curator": {
        "name": "林書妍",
        "role": "美術館策展人",
        "personality": "冷靜、措辭謹慎，重視自己的專業形象",
        "statement_id": "curator_office",
        "statement": "18:30 閉館後，我一直在辦公室整理清冊，沒有再進入 B 展廳。",
        "known_facts": "美術館 18:30 閉館；她表示閉館後留在辦公室整理清冊。",
    },
    "guard": {
        "name": "陳建中",
        "role": "夜班保全",
        "personality": "務實、略顯疲憊，回答時常強調巡場流程",
        "statement_id": "guard_alarm",
        "statement": "從閉館到 19:05 發現畫作不見，B 展廳警報都正常，沒有被解除。",
        "known_facts": "他負責閉館後巡場；他表示警報整晚都正常。",
    },
    "cleaner": {
        "name": "王冠宇",
        "role": "清潔員（被告）",
        "personality": "緊張但願意配合，熟悉自己的排班和工作車",
        "statement_id": "cleaner_basement",
        "statement": "18:30 到 19:00，我在 B1 器材室整理清潔車，沒有上過 B 展廳。",
        "known_facts": "他的當班工作地點是 B1 器材室；他表示那段時間沒有上樓。",
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
        "detail": "18:42，林書妍的識別證刷入 B 展廳，入口影像經值班員核對為她本人。紀錄能證明她進入，但不能單獨證明她拿走畫作。",
    },
    {
        "id": "E2",
        "title": "警報控制台紀錄",
        "detail": "B 展廳的動作感應器於 18:41 至 18:54 被切換為旁路模式；操作帳號為策展人專用的管理帳號。",
    },
    {
        "id": "E3",
        "title": "清潔勤務簽到單",
        "detail": "王冠宇於 18:30 在 B1 器材室簽到，19:00 由主管簽退；兩筆紀錄均有時間戳記。",
    },
    {
        "id": "E4",
        "title": "西側裝卸區出庫單",
        "detail": "18:56，一只標示「器材退庫」的恆溫運輸箱由西側裝卸區出館，申請與簽核人都是林書妍；單據沒有填寫箱內物品。",
    },
    {
        "id": "E5",
        "title": "畫作鑑定報告",
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
