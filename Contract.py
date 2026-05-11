# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class TruthOrBot(gl.Contract):
    players: DynArray[Address]
    claims: DynArray[str]
    liar_index: u256
    liar_claim: str
    is_resolved: bool

    def __init__(self):
        self.liar_index = u256(99)
        self.liar_claim = ""
        self.is_resolved = False

    @gl.public.write
    def add_claim(self, claim: str):
        if len(self.claims) >= 3:
           raise Exception("Room is full! 3 claims already added.")
        self.claims.append(claim)

    @gl.public.write
    def reveal(self):
        if len(self.claims) < 3:
            raise Exception("Need 3 claims before revealing.")

        c0 = str(self.claims[0])
        c1 = str(self.claims[1])
        c2 = str(self.claims[2])

        def get_judgment() -> str:
            prompt = (
                f"You are a lie detector. Here are three claims:\n"
                f"0: {c0}\n"
                f"1: {c1}\n"
                f"2: {c2}\n"
                f"One of these is a lie and the other two are truths. "
                f"Reply with ONLY valid JSON in this exact format: "
                f'{{ "liar_index": 1, "liar_claim": "the exact claim text here" }}. '
                f"Nothing else. No explanation."
            )
            raw = gl.nondet.exec_prompt(prompt)
            raw = raw.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(raw)
            idx = int(parsed["liar_index"])
            if idx not in (0, 1, 2):
                idx = 0
            claim_text = [c0, c1, c2][idx]
            return json.dumps({"liar_index": idx, "liar_claim": claim_text}, sort_keys=True)

        result_str = gl.eq_principle.strict_eq(get_judgment)
        result = json.loads(result_str)

        self.liar_index = u256(int(result["liar_index"]))
        self.liar_claim = str(result["liar_claim"])
        self.is_resolved = True

    @gl.public.write
    def reset_game(self):
        while len(self.claims) > 0:
            self.claims.pop()
        while len(self.players) > 0:
            self.players.pop()
        self.liar_index = u256(99)
        self.liar_claim = ""
        self.is_resolved = False

    @gl.public.view
    def check_now(self) -> dict:
        return {
            "total_claims": len(self.claims),
            "is_resolved": self.is_resolved,
            "liar_index": int(self.liar_index),
            "liar_claim": self.liar_claim
        }
