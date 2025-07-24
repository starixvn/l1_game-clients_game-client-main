# 🎰 Free Spins Bonus Promotion Flowchart (Mermaid)

This document describes the complete flow of the Free Spins Bonus Promotion system, including both In-Game and In-Lobby paths.  
The flow captures key events such as gift code redemption, promotion panels, auto spin, end popup, turnover requirements, and claim notifications.

---

## 🧭 Flowchart

```mermaid
flowchart TD
    A1([Server send PromotionData])
    A2{receivedPromotionInGame?}
    A1 --> A2

    %% In-Game Flow
    A2 -- Yes --> IG1[OPEN_GIFT_CODE]
    IG1 --> IG2[Click Icon → OPEN_GIFT_CODE_REDEEM_POPUP]
    IG2 --> IG3[Send GIFT_CODE to socket]
    IG3 --> IG3a{Redeem result?}
    IG3a -- Success --> IG4[OPEN_FREE_SPINS_PROMOTION]
    IG3a -- Failed --> IG3b[Show error message in Redeem Popup]

    IG4 --> IG4a{Player click?}
    IG4a -- Play Later --> IG4b[CLOSE_FREE_SPINS_PROMOTION]
    IG4a -- Play Now --> IG5[OPEN_PROMOTION_DETAILS_PANEL]
    IG5 --> IG6[Auto Spin]
    IG6 --> IG7{Remaining Bonus = 0 OR Expired Time}
    IG7 --> IG8[OPEN_PROMOTION_ENDED_POPUP]
    IG8 --> IG9{Total Win > 0 AND Remaining Bonus = 0}
    IG9 -- No --> IG10[CLOSE_PROMOTION_ENDED_POPUP]
    IG9 -- Yes --> IG11[OPEN_TURN_OVER_REQUIRED]
    IG11 --> IG12[Click Claim → Socket]
    IG12 --> IG13{Socket Response}
    IG13 -- Success --> IG14[OPEN_CLAIM_BONUS_NOTIFICATION]
    IG13 -- Failed --> IG15[Show Notice with errorCode]

    %% In-Lobby Flow
    A2 -- No --> IL1[OPEN_FREE_SPINS_PROMOTION]
    IL1 --> IL1a{User click?}
    IL1a -- Play Now --> IL2[OPEN_PROMOTION_DETAILS_PANEL]
    IL1a -- Play Later --> IL1b[CLOSE_FREE_SPINS_PROMOTION]
    IL2 --> IL3{Remaining Bonus = 0 OR Expired Time}
    IL3 --> IL4[OPEN_PROMOTION_ENDED_POPUP]
    IL4 --> IL5{Total Win > 0 AND Remaining Bonus = 0}
    IL5 -- Yes --> IL6[OPEN_TURN_OVER_REQUIRED]
    IL6 --> IL7[Click Claim → Socket]
    IL7 --> IL8{Socket Response}
    IL8 -- Success --> IL9[OPEN_CLAIM_BONUS_NOTIFICATION]
    IL8 -- Failed --> IL10[Show Notice with errorCode]
```

---

## 📌 Notes

✅ **OPEN_GIFT_CODE**: Only shown in In-Game mode

🔁 **OPEN_FREE_SPINS_PROMOTION**: Triggered after redeem (In-Game) or immediately (In-Lobby)

▶️ **OPEN_PROMOTION_DETAILS_PANEL**: Opened when user selects “Play Now”

⏳ **OPEN_PROMOTION_ENDED_POPUP**: Shown when bonus runs out or expires

📈 **OPEN_TURN_OVER_REQUIRED**: Shown if player wins and uses all bonus spins

💰 **OPEN_CLAIM_BONUS_NOTIFICATION**: Triggered after successful claim

❌ **Show Notice with errorCode**: Triggered when redeem or claim fails

---

## ⚠️ Additional Rules

🌀 Extra Free Spins during the bonus promotion spins are still considered part of the bonus promotion and will auto-play immediately.

🎟️ Extra Free Spins from normal ticket spins (not bonus promotion) must be played first before the user plays gift code.

⏱️ Promotion has expiration and must be claimed within the defined period or it will be voided.

🎮 Auto Spin will begin automatically if the player selects “Play Now” during bonus.

