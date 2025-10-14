

# Full Rubik's Cube group implementation using pycuber

# Secure Rubik's Cube group encryption implementation
import pycuber as pc
import random

def get_move_maps():
    base_moves = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"]
    chars = [chr(i) for i in range(ord('A'), ord('Z')+1)]
    lower = [chr(i) for i in range(ord('a'), ord('z')+1)]
    digits = [str(i) for i in range(10)]
    symbols = ['{','}','_']
    all_chars = chars + lower + digits + symbols
    move_map = {}
    inv_map = {}
    for i, c in enumerate(all_chars):
        if i < len(base_moves):
            move_map[c] = base_moves[i]
            inv_map[base_moves[i]] = c
        else:
            m1 = base_moves[i % len(base_moves)]
            m2 = base_moves[(i // len(base_moves)) % len(base_moves)]
            move_seq = f"{m1} {m2}"
            move_map[c] = move_seq
            inv_map[move_seq] = c
    return move_map, inv_map, base_moves, all_chars

def generate_key(length=20, base_moves=None):
    # Generate a random key (sequence of moves)
    if base_moves is None:
        base_moves = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"]
    key_moves = [random.choice(base_moves) for _ in range(length)]
    return key_moves

def invert_moves(moves):
    # Invert a sequence of moves
    inv = []
    for m in reversed(moves):
        if "'" in m:
            inv.append(m.replace("'", ""))
        else:
            inv.append(m + "'")
    return inv

def encode_message(message, key_moves=None):
    move_map, inv_map, base_moves, all_chars = get_move_maps()
    moves = []
    cube = pc.Cube()
    for c in message:
        if c in move_map:
            move = move_map[c]
            for m in move.split():
                cube(m)
            moves.append(move)
        else:
            moves.append('?')
    # Apply key moves for encryption
    if key_moves:
        for m in key_moves:
            cube(m)
    return ' '.join(moves), key_moves, str(cube)

def decode_message(moves, key_moves=None):
    move_map, inv_map, base_moves, all_chars = get_move_maps()
    move_tokens = moves.split()
    i = 0
    message = ''
    while i < len(move_tokens):
        # Try double move
        if i+1 < len(move_tokens):
            move_seq = f"{move_tokens[i]} {move_tokens[i+1]}"
            if move_seq in inv_map:
                message += inv_map[move_seq]
                i += 2
                continue
        # Try single move
        if move_tokens[i] in inv_map:
            message += inv_map[move_tokens[i]]
        else:
            message += '?'
        i += 1
    # To decrypt, apply inverse key moves to the cube
    cube = pc.Cube()
    for m in move_tokens:
        for sub_m in m.split():
            cube(sub_m)
    if key_moves:
        inv_key = invert_moves(key_moves)
        for m in inv_key:
            cube(m)
    # Optionally, you could extract the message from the cube state
    return message


if __name__ == '__main__':
    plain_text = 'khi{quick_rubiks_scramble}'
    print('Starting Text:')
    print(plain_text)
    move_map, inv_map, base_moves, all_chars = get_move_maps()

    # Set this to True to use a hard-coded key, False to generate a random key
    manual_key = True
    key_moves = ["R'", "R", "L'", "D", "B'", "D", "F", "D'", "L'", "B'", "L'", "L", "U'", "U", "R", "R", "U'", "B", "L", "F", "R", "L", "B'", "L"]

    if manual_key:
        key_moves = key_moves
        print('Using Hard-Coded Key Moves:')
    else:
        key_moves = generate_key(length=20, base_moves=base_moves)
        print('Generated Encryption Key Moves:')
    print(' '.join(key_moves))

    encoded_moves, key_used, final_state = encode_message(plain_text, key_moves=key_moves)
    print('Encoded Moves:')
    print(encoded_moves)
    print('Final Cube State:')
    print(final_state)

    # Set this to True to use a manual encoded_moves, False to use the generated one
    manual_encoded_moves = True
    MANUAL_ENCODED_MOVES = "U D' F' D B D D R' L D' B D' B D R D U D' R R' L' D' B D' D' D B D U D' F D' R R' F D' R D L' D' D D D D' D' D U' D' L D D' R'"

    print('Decryption:')
    if manual_encoded_moves:
        print('Using Manual Encoded Moves:')
        decoded = decode_message(MANUAL_ENCODED_MOVES, key_moves=key_used)
    else:
        decoded = decode_message(encoded_moves, key_moves=key_used)
    print(decoded)
