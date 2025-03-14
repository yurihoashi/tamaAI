from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Pet(BaseModel):
    name: str
    tiredness: float = Field(ge=0, le=100, default=50)  # 0 = well-rested, 100 = exhausted
    health: float = Field(ge=0, le=100, default=100)  # 0 = very sick, 100 = perfectly healthy
    hunger: float = Field(ge=0, le=100, default=50)  # 0 = full, 100 = starving
    last_updated: Optional[datetime] = None

    def update_status(self, hours_passed: float):
        """Simulates time passage, affecting the pet's stats."""
        self.tiredness = min(100, self.tiredness + hours_passed * 2)  # Gets tired over time
        self.hunger = min(100, self.hunger + hours_passed * 3)  # Gets hungrier faster
        self.health = max(0, self.health - (self.hunger * 0.05) - (self.tiredness * 0.03))  # Health drops if neglected
        self.last_updated = datetime.utcnow()


