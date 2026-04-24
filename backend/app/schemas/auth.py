from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    coin_balance: int

    class Config:
        from_attributes = True


class TokenPayload(BaseModel):
    sub: str | None = None