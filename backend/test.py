from pydantic import BaseModel, Field
from datetime import datetime, timedelta

class Pet(BaseModel):
    name: str
    tiredness: float = Field(ge=0, le=100, default=50)
    health: float = Field(ge=0, le=100, default=100)
    hunger: float = Field(ge=0, le=100, default=50)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    def apply_time_decay(self):
        """Updates pet's stats based on elapsed time since last update."""
        now = datetime.utcnow()
        hours_passed = (now - self.last_updated).total_seconds() / 3600  # Convert seconds to hours

        if hours_passed > 0:
            self.tiredness = min(100, self.tiredness + hours_passed * 2)
            self.hunger = min(100, self.hunger + hours_passed * 3)
            self.health = max(0, self.health - (self.hunger * 0.05) - (self.tiredness * 0.03))

            self.last_updated = now  # Update last_updated time

    def feed(self, amount: float):
        """Reduces hunger when the pet is fed."""
        self.apply_time_decay()
        self.hunger = max(0, self.hunger - amount)

    def rest(self, hours: float):
        """Reduces tiredness when the pet rests."""
        self.apply_time_decay()
        self.tiredness = max(0, self.tiredness - hours * 5)

# Example Usage:
pet = Pet(name="Fluffy")
print(f"Before time decay: {pet}")

# Simulating time passing
pet.apply_time_decay()

print(f"After time decay: {pet}")
