import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        48: "区块链百家乐"
    },
    lobbyNames: {
        48: "区块链百家乐"
    },
    blockchainBaccarat: {
        headerContent:
            "每张卡的序列号是通过加密私钥生成的唯一值。卡的序列号在游戏开始前生成。玩家可以通过比对私钥（开卡时公布）和序列号来检查开卡结果的公平性和透明度。",
        verifyCards: "验证卡",
        cardVerification: "验证卡",
        verify: "核实",
        cardList: "卡片列表",
        privateKey: "私钥",
        serialNumber: "序列号",
        verifiedSerial: "从私钥验证序列号",
        copy: "复制",
        verifiedValue: "通过将私钥（开卡时发布）与序列号进行比较，检查卡片结果的公平性和透明度。",
        last_round: "最后一轮:",
        verifySuccess: "验证成功！",
        verifyFailed: "验证失败！",
        changeCard: "换卡",
        correctSerialNumber: "正确的序列号",
        wrongSerialNumber: "序列号错误",
        serialTooltip: "每张卡的序列号是通过加密私钥生成的唯一值。",
        privateTooltip: "私钥包含卡的信息，将在打开卡后显示。",
        banker_win: "庄家赢！",
        player_win: "闲家赢！",
        tie_win: "平局",
        guide1Header1: "<color=#00FFF6>保证公平公正</c><color=#FFF000>\n 区块链技术的突破</color>",
        guide1Header2: "",
        guide1Content:
            "- 使用新的加密技术实现更高级别的安全性.\n\n- 所有卡牌在游戏开始前都已经加密并作为序列号发布.\n\n- 加密后无法更改卡值和卡的顺序.\n\n- 随时轻松验证卡牌和结果的透明度.",
        guide2Title: "什么是区块链百家乐？",
        guide2Content:
            "- 区块链是一个数据库，它储存加密的数据块，然后按时间顺序将它们连接在一起形成一条链。\n\n- 使用区块链，数据一旦加密就无法更改。",
        guide2Step1: "备案收集",
        guide2Step2: "彼此相连",
        guide2Step3: "不能更改",
        guide2Step4: "使用 SHA-256 算法保护",
        guide3Title: "区块链如何应用于百家乐？",
        guide3Key1: "<color=#ff6060>私钥</c>\n<color=#08ef95>序列号\n(卡片索引 001)</color>",
        guide3Key2:
            "<color=#ff6060>私钥:</c> {卡片价值}_{时间}_{<color=#08ef95>序列号 (卡片索引 001)</color>}_{UUID}\n<color=#08ef95>序列号 (卡片索引 002)</color>",
        guide3Content:
            "- 区块链百家乐使用8副牌(每副52张牌) 共416张牌。·每张卡片被视为一个块，下一张卡片将包含前一张卡片的加密信息，以形成 416 张卡片的不可变序列。",
        guide4Title: "数据加密",
        guide4PrivateDetail: "私钥包含卡的信息",
        guide4PublicDetail: "序列号",
        guide4Content:
            "- 新游戏开始时会随机生成416张卡牌。\n\n- 私钥包含卡的信息，只有在打开卡时才会显示出来。\n\n- 每张卡的序列号是通过私钥加密生成的唯一值，将在洗牌后公布。",
        guide5Title: "结果验证",
        guideNoteLine1:
            "注意: 玩家也可以是用任何其它第3方SHA-256工具 <b> (https://sha512.online/sha-256; https://atatus.com/tools/sha256-to-hash)</b>",
        guideNoteLine2: "进行相同的验证",
        note: "<b>注意</b>: 玩家也可以使用任何其他第三方 {SHA-256} 工具进行相同的验证",
        title: "区块链百家乐",
        block1: "区块1",
        block2: "区块2",
        block3: "区块3",
        block4: "区块4",
        block416: "区块416"
    }
};

reloadLanguageData("zh_cn", phrases);
