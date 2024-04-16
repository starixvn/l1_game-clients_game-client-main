import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        48: "區塊鏈百家樂"
    },
    lobbyNames: {
        48: "區塊鏈百家樂"
    },
    blockchainBaccarat: {
        headerContent:
            "每張卡的序列號是通過加密私鑰生成的唯一值。卡的序列號在遊戲開始前生成。玩家可以通過比對私鑰（開卡時公佈）和序列號來檢查開卡結果的公平性和透明度。",
        verifyCards: "驗證卡",
        cardVerification: "驗證卡",
        verify: "核實",
        cardList: "卡片列表",
        privateKey: "私鑰",
        serialNumber: "序列號",
        verifiedSerial: "從私鑰驗證序列號",
        copy: "複製",
        verifiedValue: "通過將私鑰（開卡時發布）與序列號進行比較，檢查卡片結果的公平性和透明度。",
        last_round: "最後一輪:",
        verifySuccess: "驗證成功！",
        verifyFailed: "驗證失敗！",
        changeCard: "換卡",
        correctSerialNumber: "正確的序列號",
        wrongSerialNumber: "序列號錯誤",
        serialTooltip: "每張卡的序列號是通過加密私鑰生成的唯一值。",
        privateTooltip: "私鑰包含卡的信息，將在打開卡後顯示。",
        banker_win: "莊家贏！",
        player_win: "閒家贏！",
        tie_win: "平局",
        guide1Header1: "<color=#00FFF6>保證公平公正</c><color=#FFF000>\n 區塊鏈技術的突破</color>",
        guide1Header2: "",
        guide1Content:
            "- 使用新的加密技術實現更高級別的安全性.\n\n- 所有卡牌在遊戲開始前都已經加密並作為序列號發布.\n\n- 加密後無法更改卡值和卡的順序.\n\n- 隨時輕鬆驗證卡牌和結果的透明度.",
        guide2Title: "什麼是區塊鏈百家樂？",
        guide2Content:
            "- 區塊鍊是一個數據庫，它儲存加密的數據塊，然後按時間順序將它們連接在一起形成一條鏈。\n\n- 使用區塊鏈，數據一旦加密就無法更改。",
        guide2Step1: "備案收集",
        guide2Step2: "彼此相連",
        guide2Step3: "不能更改",
        guide2Step4: "使用 SHA-256 算法保護",
        guide3Title: "區塊鏈如何應用於百家樂？",
        guide3Key1: "<color=#ff6060>私鑰</c>\n<color=#08ef95>序列号\n(卡片索引 001)</color>",
        guide3Key2:
            "<color=#ff6060>私鑰:</c> {卡片價值}_{時間}_{<color=#08ef95>序列號 (卡片索引 001)</color>}_{UUID}\n<color=#08ef95>序列号 (卡片索引 002)</color>",
        guide3Content:
            "- 區塊鏈百家樂使用8副牌(每副52張牌) 共416張牌。·每張卡片被視為一個塊，下一張卡片將包含前一張卡片的加密信息，以形成 416 張卡片的不可變序列。",
        guide4Title: "數據加密",
        guide4PrivateDetail: "私鑰包含卡的信息",
        guide4PublicDetail: "序列號",
        guide4Content:
            "- 新遊戲開始時會隨機生成416張卡牌。\n\n- 私鑰包含卡的信息，只有在打開卡時才會顯示出來。\n\n- 每張卡的序列號是通過私鑰加密生成的唯一值，將在洗牌後公佈。",
        guide5Title: "結果驗證",
        guideNoteLine1:
            "注意: 玩家也可以是用任何其它第3方SHA-256工具 <b> (https://sha512.online/sha-256; https://atatus.com/tools/sha256-to-hash)</b>",
        guideNoteLine2: "進行相同的驗證",
        note: "<b>注意</b>: 玩家也可以使用任何其他第三方 {SHA-256} 工具進行相同的驗證",
        title: "區塊鏈百家樂",
        block1: "區塊1",
        block2: "區塊2",
        block3: "區塊3",
        block4: "區塊4",
        block416: "區塊416"
    }
};

reloadLanguageData("zh_tw", phrases);
