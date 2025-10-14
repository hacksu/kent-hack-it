navajo_map = {
    'A': ['WOL-LA-CHEE', 'BE-LA-SANA', 'TSE-NILL'],
    'B': ['NA-HASH-CHID', 'SHUSH', 'TOISH-JEH'],
    'C': ['MOASI', 'TLA-GIN', 'BA-GOSHI'],
    'D': ['BE', 'CHINDI', 'LHA-CHA-EH'],
    'E': ['AH-JAH', 'DZEH', 'AH-NAH'],
    'F': ['CHUO', 'TSA-E-DONIN-EE', 'MA-E'],
    'G': ['AH-TAD', 'KLIZZIE', 'JEHA'],
    'H': ['TSE-GAH', 'CHA', 'LIN'],
    'I': ['TKIN', 'YEH-HES', 'A-CHI'],
    'J': ['TKELE-CHO-G', 'AH-YA-TSINNE', 'YIL-DOI'],
    'K': ['JAD-HO-LONI', 'BA-AH-NE-DI-TININ', 'KLIZZIE-YAZZIE'],
    'L': ['DIBEH-YAZZIE', 'AH-JAD', 'NASH-DOIE-TSO'],
    'M': ['TSIN-TLITI', 'BE-TAS-TNI', 'NA-AS-TSO-SI'],
    'N': ['TSAH', 'A-CHIN'],
    'O': ['A-KHA', 'TLO-CHIN', 'NE-AHS-JAH'],
    'P': ['CLA-GI-AIH', 'BI-SO-DIH', 'NE-ZHONI'],
    'Q': ['CA-YEILTH'],
    'R': ['GAH', 'DAH-NES-TSA', 'AH-LOSZ'],
    'S': ['DIBEH', 'KLESH'],
    'T': ['D-AH', 'A-WOH', 'THAN-ZIE'],
    'U': ['SHI-DA', 'NO-DA-IH'],
    'V': ['A-KEH-DI-GLINI'],
    'W': ['GLOE-IH'],
    'X': ['AL-NA-AS-DZOH'],
    'Y': ['TSAH-AS-ZIH'],
    'Z': ['BESH-DO-TLIZ'],
}
import random

def navajo_substitute(text):
    result = []
    for char in text.upper():
        if char in navajo_map:
            word = random.choice(navajo_map[char])
        else:
            word = char
        hex_word = word.encode('utf-8').hex()
        # Split hex_word into 8-char (4-byte) chunks
        chunks = [hex_word[i:i+8] for i in range(0, len(hex_word), 8)]
        result.append(' '.join(chunks))
    return ' | '.join(result)

if __name__ == "__main__":
    input_text = 'khi{walkie_talkie_certified}'
    input_text = ''.join([c for c in input_text if c.isalpha()])
    print(navajo_substitute(input_text))

    

