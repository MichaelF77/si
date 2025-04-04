from backend.app.util.util import generate_id


# this class keeps definition of all small bean-like classes without complex logic

class Player:
    def __init__(self, name: str, game_id: str, existing_id:str = None , restore_score:int = 0): 
        self.score:int = restore_score
        self.player_id = generate_id() if existing_id is None else existing_id
        self.name = name
        self.game_id=game_id
        self.lag = 0  # used to show delay when signal was received

class Signal:
    def __init__(self, player_id: str, server_ts, client_ts, adjusted_ts):
        self.player_id = player_id
        self.server_ts = server_ts
        self.client_ts = client_ts
        self.adjusted_ts = adjusted_ts
