import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: { 48: "ブロックチェーンバカラ" },
    lobbyNames: { 48: "ブロックチェーン\nバカラ" },
    blockchainBaccarat: {
        banker_win: "バンカー勝利",
        block1: "ブロック 1",
        block2: "ブロック2",
        block3: "ブロック 3",
        block4: "ブロック4",
        block416: "ブロック416",
        cardList: "カードリスト",
        cardVerification: "カード認証",
        changeCard: "カードを交換",
        copy: "コピー",
        correctSerialNumber: "シリアル番号が正しい",
        guide1Content:
            "- 最新の暗号化技術による高度なセキュリティ。\n\n- 全てのカードは暗号化され、ゲーム開始前にシリアルナンバーとして公開。\n\n- 暗号化後、カードの価値や順番を変更することは不可能。\n\n- いつでもカードと結果の透明性を容易に検証可能。",
        guide1Header1:
            "<color=#00FFF6>公正さを</c><color=#FFF000>保証</color><color=#00FFF6>！</color><color=#FFF000>ブロックチェーン技術</color> <color=#00FFF6>による革新</color>",
        guide1Header2: "",
        guide2Content:
            "- ブロックチェーンとは、暗号化されたデータのブロックを保存し、それらを時系列順にリンクさせてチェーンを形成するデータベースのことです。\n\n- ブロックチェーンを使用すると、暗号化されたデータは一度変更することはできません。",
        guide2Step1: "記録コレクション",
        guide2Step2: "連動",
        guide2Step3: "変更不可",
        guide2Step4: "SHA-256 アルゴリズムによる保護",
        guide2Title: "ブロックチェーンとは？",
        guide3Content:
            "- ブロックチェーンバカラは、8組のカード（1組52枚、合計416枚）を使用します。各カードはブロックと見なされ、次のカードには前のカードの暗号化された情報が含まれ、416枚のカードの不変のシーケンスを形成します。",
        guide3Key1: "<color=#ff6060>秘密鍵</c>\n<color=#08ef95>シリアルナンバー\n(Cインデックス 001)</color>",
        guide3Key2:
            "<color=#ff6060>秘密鍵:</c> {カード値}_{時間}_{<color=#08ef95>シリアル番号（Cインデックス 001）</color>}_{UUID}\n<color=#08ef95>シリアル番号（Cインデックス 002）</color>",
        guide3Title: "バカラにブロックチェーンはどのように活用されていますか？",
        guide4Content:
            "- 新しいゲーム開始時に、416枚のカードがランダムに生成されます。\n\n- プライベートキーにはカードの情報が含まれており、カードを開くまで公開されません。\n\n- 各カードのシリアルナンバーは、プライベートキーを暗号化して生成された固有の値であり、カードがシャッフルされた後に公開されます。",
        guide4PrivateDetail: "プライベートキーには、カードの情報が含まれています。",
        guide4PublicDetail: "シリアル番号",
        guide4Title: "データ暗号化",
        guide5Title: "結果検証",
        guideNoteLine1: "注意: プレイヤーは、他のサードパーティSHA-256ツールも使用できます<b>(https://sha512.online/sha-256;</b>",
        guideNoteLine2: "<b>https://atatus.com/tools/sha256-to-hash)</b> 同様の本人確認を行ってください。",
        headerContent:
            "各カードのシリアル番号は、ゲーム開始前に生成されます。プレイヤーは、プライベートキー（カードオープン時に公開）とシリアル番号を照合することで、カード結果の公平性と透明性を確認できます。",
        last_round: "最終ラウンド:",
        note: "<b>注意</b>：プレイヤーは、他の第三者SHA-256ツールを使用して同じ検証を行うことも可能です。",
        player_win: "プレイヤー勝利",
        privateKey: "秘密鍵",
        privateTooltip: "プライベートキーにはカードの情報が含まれており、カードを開封後に表示されます。",
        serialNumber: "シリアル番号",
        serialTooltip: "各カードのシリアルナンバーは、秘密鍵を暗号化して生成される固有の値です。",
        tie_win: "引き分け",
        title: "ブロックチェーンバカラ",
        verify: "認証",
        verifiedSerial: "秘密鍵からの検証済みシリアル番号",
        verifiedValue: "カードの結果の公平性と透明性を、シリアル番号と照合して、カード公開時に発行される秘密鍵でご確認ください。",
        verifyCards: "カード認証",
        verifyFailed: "認証に失敗しました！",
        verifySuccess: "認証完了！",
        wrongSerialNumber: "シリアル番号が間違っています"
    }
};

reloadLanguageData("ja", phrases);
