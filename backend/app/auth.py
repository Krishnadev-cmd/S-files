from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import database, models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)):
    # This is a placeholder. In a real application, you would validate the token
    # and get the user from the database.
    user = db.query(models.User).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    # This is a placeholder. You might add logic here to check if the user is active.
    return current_user
