import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        48: "Blockchain Baccarat"
    },
    lobbyNames: {
        48: "Blockchain\nBaccarat"
    },
    blockchainBaccarat: {
        headerContent:
            "Số Seri cho mỗi lá bài được công bố ngay tại thời điểm ban đầu. Người chơi có thể kiểm tra tính minh bạch của kết quả bằng cách so sánh “Khóa Bảo Mật” (được công bố khi mở bài) với “Số Seri”.",
        verifyCards: "Xác Minh Bài",
        cardVerification: "Xác Minh Lá Bài",
        verify: "Xác Minh",
        cardList: "Danh Sách Bài",
        privateKey: "Khóa Bảo Mật",
        serialNumber: "Số Seri",
        verifiedSerial: "Số Seri đã xác minh từ Khóa Bảo Mật",
        copy: "Copy",
        verifiedValue: "Kiểm tra sự minh bạch trong kết quả bằng cách đối chiếu Số Seri với Khóa Bảo Mật (công bố sau khi mở bài). ",
        last_round: "Phiên Trước:",
        verifySuccess: "Xác minh thành công!",
        verifyFailed: "Xác minh thất bại!",
        changeCard: "Đổi Bài",
        correctSerialNumber: "Số Seri trùng khớp",
        wrongSerialNumber: "Số Seri không khớp",
        serialTooltip: "Thông tin của lá bài (Khóa Bảo Mật) sẽ được hệ thống mã hóa thành số Seri. Mỗi lá bài sẽ có số Seri khác nhau.",
        privateTooltip: "Khóa bảo mật chứa thông tin của lá bài chỉ được công bố sau khi lá bài được mở.",
        banker_win: "Nhà Cái Thắng",
        player_win: "Nhà Con Thắng",
        tie_win: "Hòa",
        guide1Header1: "<color=#00FFF6>ĐẲNG CẤP TIÊN PHONG </c><color=#FFF000>&</color><color=#00FFF6> CÔNG NGHỆ ĐỘT PHÁ</c>",
        guide1Header2:
            "<color=#00FFF6>NÂNG TẦM </c><color=#FFF000>XANH-CHÍN</c><color=#00FFF6> VỚI CÔNG NGHỆ BLOCKCHAIN - CHÌA KHÓA CỦA SỰ </c><color=#FFF000>MINH BẠCH</c>",
        guide1Content:
            "- Bảo mật cao với công nghệ mã hóa Chuỗi - Khối.\n\n- Chuỗi bài được mã hóa và công khai dưới dạng Số Seri trên từng lá bài ngay khi bắt đầu game.\n\n- Không thể thay đổi kết quả chuỗi bài, thứ tự lá bài sau khi được mã hóa.\n\n- Dễ dàng xác minh kết quả và tính minh bạch bất cứ lúc nào.",
        guide2Title: "Blockchain là gì?",
        guide2Content:
            "- Blockchain là công nghệ chuỗi - khối cho phép lưu trữ và mã hóa dữ liệu.\n\n- Dữ liệu phân cấp lưu trữ thông tin trong các khối (block) và được liên kết với khối trước đó thành chuỗi (chain).\n\n- Với Blockchain, dữ liệu sẽ không thể thay đổi một khi đã được mã hóa.",
        guide2Step1: "Lưu trữ thông tin",
        guide2Step2: "Khối sau lưu giữ thông tin khối trước",
        guide2Step3: "Không thể thay đổi dữ liệu",
        guide2Step4: "Bảo mật với công nghệ mã hóa SHA-256",
        guide3Title: "Áp dụng blockchain vào baccarat",
        guide3Key1: "<color=#ff6060>Khóa bảo mật</c>\n<color=#08ef95>Số Seri lá bài 001</color>",
        guide3Key2:
            "<color=#ff6060>Khóa bảo mật:</c> {Giá trị bài}_{Thời gian}_{<color=#08ef95>Số Seri lá bài 001</color>}_{UUID}\n<color=#08ef95>Số Seri lá bài 002</color>",
        guide3Content:
            "- Blockchain Baccarat sử dụng 8 bộ bài (52 lá cho mỗi bộ), tổng cộng 416 lá. Trong đó mỗi lá bài tượng trưng cho 1 khối và lá bài sau sẽ chứa thông tin mã hóa của lá bài trước đó để tạo thành 1 chuỗi bất biến gồm 416 lá.",
        guide4Title: "Mã hóa dữ liệu",
        guide4PrivateDetail: "Khóa bảo mật (Private Key) chứa thông tin của lá bài",
        guide4PublicDetail: "Số Seri (Private Key được mã hóa)",
        guide4Content:
            "- Các lá bài (416 lá) sẽ được hệ thống tạo ra ngẫu nhiên ngay khi bắt đầu game.\n\n- Khóa bảo mật (Private Key) chứa thông tin của lá bài chỉ được công bố sau khi lá bài được mở.\n\n- Số Seri (Private Key được mã hóa) sẽ được công bố ngay tại thời điểm ban đầu.",
        guide5Title: "kiểm tra tính minh bạch",
        guideNoteLine1:
            "Lưu ý: Người chơi có thể sử dụng bất kỳ công cụ liên quan đến giải thuật SHA-256 từ bên thứ 3 để kiểm tra tính minh bạch của",
        guideNoteLine2: "kết quả <b>(https://sha512.online/sha-256; https://atatus.com/tools/sha256-to-hash)<b>.",
        note: "<b>Lưu ý</b>: Người chơi có thể sử dụng bất kỳ ứng dụng của bên thứ 3 để kiểm tra tính minh bạch của kết quả và xác minh thông tin lá bài.",
        title: "Blockchain Baccarat",
        block1: "Block 1",
        block2: "Block 2",
        block3: "Block 3",
        block4: "Block 4",
        block416: "Block 416"
    }
};

reloadLanguageData("vi", phrases);
