import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: { 48: "Baccarat Blockchain" },
    lobbyNames: { 48: "Blockchain Baccarat" },
    blockchainBaccarat: {
        headerContent:
            "El Número de Serie de cada carta se genera antes del inicio del juego. El jugador puede verificar la equidad y transparencia del resultado de la carta al comparar la Clave Privada (publicada al revelar la carta) con el Número de Serie.",
        verifyCards: "Verificar Tarjetas",
        cardVerification: "Verificación de Tarjeta",
        verify: "Verificar",
        cardList: "Lista de cartas",
        privateKey: "Llave Privada",
        serialNumber: "Número de serie",
        verifiedSerial: "Número de serie validado mediante clave privada",
        copy: "Copiar",
        verifiedValue:
            "Comprueba la equidad y transparencia del resultado de la carta comparando la Clave Privada (publicada al revelar la carta) con el Número de Serie.",
        last_round: "Última Ronda:",
        verifySuccess: "¡Verificación Exitosa!",
        verifyFailed: "¡Verificación Fallida!",
        changeCard: "Cambiar Carta",
        correctSerialNumber: "Número de serie correcto",
        wrongSerialNumber: "Número de Serie Incorrecto",
        serialTooltip: "El número de serie de cada tarjeta es un valor único que se genera encriptando la Clave Privada.",
        privateTooltip: "La Clave Privada contiene la información de la tarjeta y se revelará al abrirla.",
        banker_win: "Gana la Banca",
        player_win: "Gana el Jugador",
        tie_win: "Empate",
        guide1Header1:
            "<color=#00FFF6>TE OFRECEMOS </c><color=#FFF000>GARANTÍAS DE JUEGO JUSTO</color><color=#00FFF6>\nEL NUEVO AVANCE GRACIAS A LA </c><color=#FFF000>TECNOLOGÍA BLOCKCHAIN</color>",
        guide1Header2: "",
        guide1Content:
            "- Mayor nivel de seguridad con técnicas criptográficas avanzadas.\n\n- Todas las cartas se cifran y se publican como números de serie antes de iniciar el juego.\n\n- No se pueden modificar los valores ni el orden de las cartas una vez cifradas.\n\n- Permite verificar fácilmente la autenticidad de las cartas y la transparencia de los resultados en cualquier momento.",
        guide2Title: "¿Qué es Blockchain?",
        guide2Content:
            "- Una blockchain es una base de datos que almacena bloques de datos cifrados y luego los enlaza en orden cronológico para formar una cadena.\n\n- Con blockchain, los datos no se pueden modificar una vez cifrados.",
        guide2Step1: "Historial",
        guide2Step2: "Vinculados entre sí",
        guide2Step3: "Inalterable",
        guide2Step4: "Protegido con el algoritmo SHA-256",
        guide3Title: "¿Cómo se aplica Blockchain en el Baccarat?",
        guide3Key1: "<color=#ff6060>Clave Privada</c>\n<color=#08ef95>Número de Serie\n(Índice de la tarjeta 001)</color>",
        guide3Key2:
            "<color=#ff6060>Clave Privada:</c> {Card Value}_{Time}_{<color=#08ef95>Número de Serie (carta índice 001)</color>}_{UUID}\n<color=#08ef95>Número de Serie (carta índice 002)</color>",
        guide3Content:
            "El Baccarat Blockchain utiliza 8 barajas de cartas (52 cartas por baraja), un total de 416 cartas. Cada carta se considera un bloque, y la siguiente contendrá la información encriptada de la anterior para formar una secuencia inmutable de 416 cartas.",
        guide4Title: "Cifrado de Datos",
        guide4PrivateDetail: "La Clave Privada contiene los datos de la tarjeta.",
        guide4PublicDetail: "Número de Serie",
        guide4Content:
            "- Se generarán 416 cartas aleatoriamente al inicio de la nueva partida.\n\n- La Clave Privada contiene la información de la carta y no se revelará hasta que esta sea abierta.\n\n- El Número de Serie de cada carta es un valor único que se genera cifrando la Clave Privada y se publicará después de que las cartas sean barajadas.",
        guide5Title: "Verificación de Resultados",
        guideNoteLine1:
            "Nota: Los jugadores también pueden usar cualquier otra herramienta SHA-256 de terceros <b>(https://sha512.online/sha-256; https://atatus.com/tools/sha256-to-hash)<b>",
        guideNoteLine2: "realizar la misma verificación.",
        note: "<b>Nota</b>: Los jugadores también pueden usar cualquier otra herramienta SHA-256 de terceros para realizar la misma verificación.",
        title: "Baccarat Blockchain",
        block1: "Bloque 1",
        block2: "Bloque 2",
        block3: "Bloque 3",
        block4: "Bloque 4",
        block416: "Bloque 416"
    }
};

reloadLanguageData("es", phrases);
