import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        48: "Bakarat Blockchain"
    },
    lobbyNames: {
        48: "Bakarat\nBlockchain"
    },
    blockchainBaccarat: {
        headerContent:
            "Nomor seri untuk setiap kartu dihasilkan sebelum permainan dimulai. Pemain dapat memeriksa keadilan dan transparansi hasil kartu dengan membandingkan Kunci Pribadi (diterbitkan saat kartu dibuka) dengan nomor Seri.",
        verifyCards: "Verifikasi Kartu",
        cardVerification: "Verifikasi Kartu",
        verify: "Verifikasi",
        cardList: "Daftar Kartu",
        privateKey: "Kunci Pribadi",
        serialNumber: "Nomor Seri",
        verifiedSerial: "Nomor Seri Terverifikasi dari Kunci Pribadi",
        copy: "Salin",
        verifiedValue:
            "Periksa keadlian dan transparansi hasil kartu dengan membandingkan Kunci Pribadi (terbit saat kartu dibuka) dengan Nomor Seri.",
        last_round: "Ronde Terakhir:",
        verifySuccess: "Verifikasi Berhasil!",
        verifyFailed: "Verifikasi Gagal!",
        changeCard: "Tukar Kartu",
        correctSerialNumber: "Nomor Seri Benar",
        wrongSerialNumber: "Nomor Seri Salah",
        serialTooltip: "Nomor seri untuk setiap kartu adalah nilai unik yang dihasilkan dengan mengenkripsi Kunci Pribadi.",
        privateTooltip: "Kunci Pribadi berisi informasi kartu dan akan terungkap setelah kartu dibuka.",
        banker_win: "Banker Menang!",
        player_win: "Player Menang!",
        tie_win: "Seri",
        guide1Header1: "<color=#00FFF6>Membawa Jaminan Kewajaran</c><color=#FFF000>\n Terobosan baru dengan Teknologi Blockchain</color>",
        guide1Header2: "",
        guide1Content:
            "- Tingkat keamanan yang lebih tinggi dengan teknik kriptografi baru.\n\n- Semua kartu dienkripsi dan diterbitkan sebagai nomor seri sebelum permainan dimulai.\n\n- Tidak dapat mengubah nilai kartu dan urutan kartu setelah dienkripsi.\n\n- Verifikasi kartu dan transparansi hasil dengan mudah kapan saja.",
        guide2Title: "Apa itu Blockchain?",
        guide2Content:
            "- Blockchain adalah basis data yang menyimpan blok data terenkripsi dan kemudian menghubungkannya bersama dalam urutan kronologis untuk membentuk rantai.\n\n- Dengan blockchain, data tidak dapat diubah setelah dienkripsi.",
        guide2Step1: "Koleksi rekaman",
        guide2Step2: "Terhubung satu sama lain",
        guide2Step3: "Tidak dapat diubah",
        guide2Step4: "Dilindungi menggunakan algoritma SHA-256",
        guide3Title: "Bagaimana Blockchain diterapkan di Baccarat?",
        guide3Key1: "<color=#ff6060>Kunci Pribadi</c>\n<color=#08ef95>Nomor Seri\n(Indeks kartu 001)</color>",
        guide3Key2:
            "<color=#ff6060>Kunci Pribadi:</c> {Nilai Kartu}_{Waktu}_{<color=#08ef95>Nomor Seri (Indeks kartu 001)</color>}_{UUID}\n<color=#08ef95>Nomor Seri (Indeks kartu 002)</color>",
        guide3Content:
            "- Blockchain Bakarat menggunakan 8 tumpukan kartu (52 kartu per tumpukan), total 416 kartu. Setiap kartu dianggap sebagai satu blok dan kartu berikutnya akan berisi informasi terenkripsi dari kartu sebelumnya untuk membentuk urutan 416 kartu yang tidak dapat diubah.",
        guide4Title: "Enkripsi data",
        guide4PrivateDetail: "Kunci Pribadi berisi informasi Kartu",
        guide4PublicDetail: "Nomor seri",
        guide4Content:
            "- 416 kartu akan dibuat secara acak di awal permainan baru.\n\n- Kunci Privat berisi informasi kartu, dan tidak akan diungkapkan sampai kartu dibuka.\n\n- Nomor Seri untuk setiap kartu adalah nilai unik yang dihasilkan dengan mengenkripsi Kunci Pribadi dan akan dipublikasikan setelah kartu dikocok.",
        guide5Title: "Verifikasi Hasil",
        guideNoteLine1:
            "Catatan: Pemain juga dapat menggunakan alat SHA-256 pihak ketiga lainnya <b> \n(https://sha512.online/sha-256; https://atatus.com/tools/sha256-to-hash)</b> untuk melakukan verifikasi yang sama",
        guideNoteLine2: "",
        note: "<b>Catatan</b>: Pemain juga dapat menggunakan alat {SHA-256} pihak ketiga lainnya untuk melakukan verifikasi yang sama",
        title: "Bakarat Blockchain",
        block1: "Blok  1",
        block2: "Blok  2",
        block3: "Blok  3",
        block4: "Blok  4",
        block416: "Blok 416"
    }
};

reloadLanguageData("id", phrases);
